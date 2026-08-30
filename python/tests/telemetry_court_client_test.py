import json
import os
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path
from types import SimpleNamespace
from unittest.mock import patch

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

REPOSITORY_ROOT = Path(__file__).resolve().parents[2]
TSX_EXECUTABLE = REPOSITORY_ROOT / "node_modules" / ".bin" / "tsx"

from telemetry_court_client import (  # noqa: E402
    CasePackageShapeError,
    CLUSTER_REFINEMENT_JSON_MAX_BYTES,
    HotFolderPathError,
    RefinementReadError,
    RefinementSchemaError,
    TelemetryCourtHotFolder,
    UnsafeFilenameError,
)


class TelemetryCourtHotFolderTests(unittest.TestCase):
    def test_writes_case_package_json_to_hot_folder(self):
        with tempfile.TemporaryDirectory() as folder:
            client = TelemetryCourtHotFolder(folder)

            result = client.write_case_package(minimal_case_package())

            output_path = Path(result["path"])
            self.assertTrue(result["written"])
            self.assertEqual(output_path.parent, Path(folder))
            self.assertEqual(result["package_id"], "pkg-test-001")
            self.assertEqual(result["case_id"], "case-test-001")
            self.assertEqual(result["cluster_id"], "cluster-test-001")
            self.assertIn("pkg-test-001", output_path.name)
            self.assertIn("case-test-001", output_path.name)
            self.assertEqual(output_path.suffix, ".json")

            written = json.loads(output_path.read_text(encoding="utf-8"))
            self.assertEqual(written["schema_version"], "case_package.v0.1")
            self.assertEqual(written["package_id"], "pkg-test-001")

    def test_writes_case_package_from_json_string_with_filename_override(self):
        with tempfile.TemporaryDirectory() as folder:
            client = TelemetryCourtHotFolder(folder)

            result = client.write_case_package(
                json.dumps(minimal_case_package()),
                filename="approved-package.json",
            )

            self.assertTrue(result["written"])
            self.assertEqual(result["filename"], "approved-package.json")
            self.assertTrue((Path(folder) / "approved-package.json").exists())

    def test_dry_run_write_does_not_create_file(self):
        with tempfile.TemporaryDirectory() as folder:
            client = TelemetryCourtHotFolder(folder)

            result = client.write_case_package(minimal_case_package(), dry_run=True)

            self.assertFalse(result["written"])
            self.assertTrue(result["dry_run"])
            self.assertFalse(Path(result["path"]).exists())
            self.assertEqual(list(Path(folder).iterdir()), [])

    def test_rejects_unsafe_filename_override(self):
        with tempfile.TemporaryDirectory() as folder:
            client = TelemetryCourtHotFolder(folder)

            with self.assertRaises(UnsafeFilenameError):
                client.write_case_package(
                    minimal_case_package(),
                    filename="../outside.json",
                )

    def test_rejects_missing_required_case_package_shape_fields(self):
        package = {
            **minimal_case_package(),
            "case": {},
        }

        with tempfile.TemporaryDirectory() as folder:
            client = TelemetryCourtHotFolder(folder)

            with self.assertRaises(CasePackageShapeError):
                client.write_case_package(package)

    def test_reads_valid_cluster_refinement_json(self):
        with tempfile.TemporaryDirectory() as folder:
            path = Path(folder) / "case-cluster-refinement.json"
            path.write_text(
                json.dumps(minimal_refinement(), indent=2),
                encoding="utf-8",
            )
            client = TelemetryCourtHotFolder(folder)

            refinement = client.read_refinement(path)

            self.assertEqual(refinement["schema_version"], "cluster_refinement.v0.1")
            self.assertEqual(refinement["refinement_id"], "refinement-test-001")

    @unittest.skipUnless(TSX_EXECUTABLE.exists(), "tsx is not installed")
    def test_reads_artifact_built_by_canonical_typescript_exporter(self):
        script = """
import { buildClusterRefinementV01 } from "./lib/clusterRefinementV01";
import {
  syntheticOverclaimEvaluationReportExampleV01 as example,
} from "./lib/evaluationReportV01Examples";
const artifact = buildClusterRefinementV01({
  report: example.evaluationReport,
  sourceReviewResults: example.sourceReviewResults,
  generatedAt: "2026-08-30T00:00:00.000Z",
  refinementId: "refinement-cross-runtime-test",
});
process.stdout.write(JSON.stringify(artifact));
"""
        generated = subprocess.run(
            [str(TSX_EXECUTABLE), "-e", script],
            cwd=REPOSITORY_ROOT,
            check=True,
            capture_output=True,
            text=True,
            timeout=30,
        )

        with tempfile.TemporaryDirectory() as folder:
            path = Path(folder) / "typescript-export.json"
            path.write_text(generated.stdout, encoding="utf-8")
            client = TelemetryCourtHotFolder(folder)

            refinement = client.read_refinement(path)

            self.assertEqual(refinement["refinement_id"], "refinement-cross-runtime-test")
            self.assertGreater(len(refinement["prune_session_ids"]), 0)
            self.assertGreater(len(refinement["split_recommendations"]), 0)

    @unittest.skipUnless(TSX_EXECUTABLE.exists(), "tsx is not installed")
    def test_accepts_canonical_typescript_no_op_as_no_action_handoff(self):
        script = """
import { aggregateReviewResultsV01 } from "./lib/evaluationReportV01";
import { buildClusterRefinementV01 } from "./lib/clusterRefinementV01";
import {
  syntheticOverclaimEvaluationReportExampleV01 as example,
} from "./lib/evaluationReportV01Examples";
const reviews = example.sourceReviewResults.map((review) => {
  const { cluster_refinement: omitted, ...decisions } = review.decisions;
  return {
    ...review,
    decisions: {
      ...decisions,
      failure_modes: [],
      final_verdict: "supported",
      recommended_action: "accept_label",
    },
  };
});
const artifact = buildClusterRefinementV01({
  report: aggregateReviewResultsV01(reviews),
  sourceReviewResults: reviews,
  generatedAt: "2026-08-30T00:00:00.000Z",
  refinementId: "refinement-cross-runtime-no-op-test",
});
process.stdout.write(JSON.stringify(artifact));
"""
        generated = subprocess.run(
            [str(TSX_EXECUTABLE), "-e", script],
            cwd=REPOSITORY_ROOT,
            check=True,
            capture_output=True,
            text=True,
            timeout=30,
        )
        artifact = json.loads(generated.stdout)
        self.assertEqual(artifact["prune_session_ids"], [])
        self.assertEqual(artifact["split_recommendations"], [])
        self.assertEqual(artifact["merge_recommendations"], [])

        with tempfile.TemporaryDirectory() as folder:
            path = Path(folder) / "typescript-no-op-export.json"
            path.write_text(generated.stdout, encoding="utf-8")
            client = TelemetryCourtHotFolder(folder)

            loaded = client.read_refinement(path)

            self.assertEqual(loaded, artifact)

    def test_rejects_wrong_refinement_schema_version(self):
        with tempfile.TemporaryDirectory() as folder:
            path = Path(folder) / "wrong-schema.json"
            refinement = {
                **minimal_refinement(),
                "schema_version": "cluster_refinement.v9",
            }
            path.write_text(json.dumps(refinement), encoding="utf-8")
            client = TelemetryCourtHotFolder(folder)

            with self.assertRaises(RefinementSchemaError):
                client.read_refinement(path)

    def test_rejects_missing_refinement_compatibility_metadata(self):
        with tempfile.TemporaryDirectory() as folder:
            path = Path(folder) / "missing-compatibility.json"
            refinement = minimal_refinement()
            del refinement["compatibility"]
            path.write_text(json.dumps(refinement), encoding="utf-8")
            client = TelemetryCourtHotFolder(folder)

            with self.assertRaises(RefinementSchemaError):
                client.read_refinement(path)

    def test_rejects_incompatible_refinement_metadata(self):
        mutations = {
            "calculation_version": lambda artifact: artifact.update(
                calculation_version="cluster_refinement_calculation.v9"
            ),
            "source_application": lambda artifact: artifact.update(
                source_application="another_application"
            ),
            "format": lambda artifact: artifact.update(format="remote_api"),
            "review_result_schema_version": lambda artifact: artifact[
                "compatibility"
            ].update(review_result_schema_version="review_result.v9"),
            "review_protocol_version": lambda artifact: artifact[
                "compatibility"
            ].update(review_protocol_version="telemetry_court_review.v9"),
            "evaluation_report_schema_version": lambda artifact: artifact[
                "compatibility"
            ].update(evaluation_report_schema_version="evaluation_report.v9"),
            "evaluation_report_calculation_version": lambda artifact: artifact[
                "compatibility"
            ].update(
                evaluation_report_calculation_version="review_result_aggregation.v9"
            ),
        }

        for field, mutate in mutations.items():
            with self.subTest(field=field), tempfile.TemporaryDirectory() as folder:
                path = Path(folder) / "incompatible.json"
                refinement = minimal_refinement()
                mutate(refinement)
                path.write_text(json.dumps(refinement), encoding="utf-8")
                client = TelemetryCourtHotFolder(folder)

                with self.assertRaises(RefinementSchemaError):
                    client.read_refinement(path)

    def test_rejects_incomplete_case_package_reference(self):
        mutations = {
            "schema_version": lambda artifact: artifact["case_package"].update(
                schema_version="case_package.v9"
            ),
            "package_id": lambda artifact: artifact["case_package"].update(
                package_id=""
            ),
            "package_revision": lambda artifact: artifact["case_package"].update(
                package_revision=[]
            ),
            "case_id": lambda artifact: artifact["case_package"].update(case_id=None),
            "cluster_id": lambda artifact: artifact["case_package"].update(
                cluster_id=[]
            ),
            "pipeline": lambda artifact: artifact["case_package"].update(pipeline={}),
        }

        for field, mutate in mutations.items():
            with self.subTest(field=field), tempfile.TemporaryDirectory() as folder:
                path = Path(folder) / "bad-case-reference.json"
                refinement = minimal_refinement()
                mutate(refinement)
                path.write_text(json.dumps(refinement), encoding="utf-8")
                client = TelemetryCourtHotFolder(folder)

                with self.assertRaises(RefinementSchemaError):
                    client.read_refinement(path)

    def test_rejects_inconsistent_source_review_metadata(self):
        mutations = {
            "duplicate_source_review_ids": lambda artifact: artifact.update(
                source_review_ids=["review-test-001", "review-test-001"]
            ),
            "unsorted_source_review_ids": lambda artifact: artifact.update(
                source_review_ids=["review-z", "review-a"]
            ),
            "source_review_id_mismatch": lambda artifact: artifact.update(
                source_reviews=[{"review_id": "review-other"}]
            ),
            "reviewer_count_mismatch": lambda artifact: artifact.update(
                reviewer_count=2
            ),
            "boolean_reviewer_count": lambda artifact: artifact.update(
                reviewer_count=True
            ),
        }

        for condition, mutate in mutations.items():
            with self.subTest(condition=condition), tempfile.TemporaryDirectory() as folder:
                path = Path(folder) / "bad-source-reviews.json"
                refinement = minimal_refinement()
                mutate(refinement)
                path.write_text(json.dumps(refinement), encoding="utf-8")
                client = TelemetryCourtHotFolder(folder)

                with self.assertRaises(RefinementSchemaError):
                    client.read_refinement(path)

    def test_rejects_invalid_session_exclusion_recommendations(self):
        mutations = {
            "unknown_status": lambda artifact: artifact[
                "session_exclusion_recommendations"
            ][0].update(status="maybe"),
            "missing_session_id": lambda artifact: artifact[
                "session_exclusion_recommendations"
            ][0].pop("session_id"),
            "boolean_count": lambda artifact: artifact[
                "session_exclusion_recommendations"
            ][0].update(selected_count=True),
            "reviewer_count_mismatch": lambda artifact: artifact[
                "session_exclusion_recommendations"
            ][0].update(reviewer_count=2),
            "unknown_field": lambda artifact: artifact[
                "session_exclusion_recommendations"
            ][0].update(execute_upstream=True),
            "unsupported_signal": lambda artifact: artifact[
                "session_exclusion_recommendations"
            ][0].update(signals={"execute_upstream": True}),
            "duplicate_session_id": lambda artifact: artifact[
                "session_exclusion_recommendations"
            ].append(dict(artifact["session_exclusion_recommendations"][0])),
        }

        for condition, mutate in mutations.items():
            with self.subTest(condition=condition), tempfile.TemporaryDirectory() as folder:
                path = Path(folder) / "bad-session-recommendation.json"
                refinement = minimal_refinement()
                mutate(refinement)
                path.write_text(json.dumps(refinement), encoding="utf-8")
                client = TelemetryCourtHotFolder(folder)

                with self.assertRaises(RefinementSchemaError):
                    client.read_refinement(path)

    def test_rejects_prune_ids_that_are_duplicate_unsorted_or_not_derived(self):
        invalid_prune_ids = [
            ["session-test-001", "session-test-001"],
            ["session-z", "session-a"],
            [],
            ["session-other"],
        ]

        for prune_ids in invalid_prune_ids:
            with self.subTest(prune_ids=prune_ids), tempfile.TemporaryDirectory() as folder:
                path = Path(folder) / "bad-prune-ids.json"
                refinement = {**minimal_refinement(), "prune_session_ids": prune_ids}
                path.write_text(json.dumps(refinement), encoding="utf-8")
                client = TelemetryCourtHotFolder(folder)

                with self.assertRaises(RefinementSchemaError):
                    client.read_refinement(path)

    def test_rejects_malformed_split_and_merge_recommendations(self):
        mutations = {
            "split_status": lambda artifact: artifact.update(
                split_recommendations=[
                    {**valid_split_recommendation(), "status": "consider"}
                ]
            ),
            "split_unknown_source_review": lambda artifact: artifact.update(
                split_recommendations=[
                    {
                        **valid_split_recommendation(),
                        "source_review_ids": ["review-unknown"],
                    }
                ]
            ),
            "split_unknown_cluster": lambda artifact: artifact.update(
                split_recommendations=[
                    {
                        **valid_split_recommendation(),
                        "cluster_id": "cluster-unknown",
                    }
                ]
            ),
            "split_reason": lambda artifact: artifact.update(
                split_recommendations=[
                    {
                        **valid_split_recommendation(),
                        "details": {
                            **valid_split_recommendation()["details"],
                            "reason_codes": ["unsupported_reason"],
                        },
                    }
                ]
            ),
            "split_signal": lambda artifact: artifact.update(
                split_recommendations=[
                    {
                        **valid_split_recommendation(),
                        "signals": {"execute_upstream": True},
                    }
                ]
            ),
            "merge_status": lambda artifact: artifact.update(
                merge_recommendations=[
                    {**valid_merge_recommendation(), "status": "consider"}
                ]
            ),
            "merge_target": lambda artifact: artifact.update(
                merge_recommendations=[
                    {
                        **valid_merge_recommendation(),
                        "target": {"status": "automatic", "neighbor_cluster_ids": []},
                    }
                ]
            ),
            "merge_reason": lambda artifact: artifact.update(
                merge_recommendations=[
                    {
                        **valid_merge_recommendation(),
                        "target": {
                            "status": "selected",
                            "neighbor_cluster_ids": ["cluster-neighbor"],
                            "reason_codes": ["unsupported_reason"],
                        },
                    }
                ]
            ),
        }

        for condition, mutate in mutations.items():
            with self.subTest(condition=condition), tempfile.TemporaryDirectory() as folder:
                path = Path(folder) / "bad-cluster-recommendation.json"
                refinement = minimal_refinement()
                mutate(refinement)
                path.write_text(json.dumps(refinement), encoding="utf-8")
                client = TelemetryCourtHotFolder(folder)

                with self.assertRaises(RefinementSchemaError):
                    client.read_refinement(path)

    def test_accepts_well_formed_split_and_merge_recommendations(self):
        with tempfile.TemporaryDirectory() as folder:
            path = Path(folder) / "recommendations.json"
            refinement = {
                **minimal_refinement(),
                "split_recommendations": [valid_split_recommendation()],
                "merge_recommendations": [valid_merge_recommendation()],
            }
            path.write_text(json.dumps(refinement), encoding="utf-8")
            client = TelemetryCourtHotFolder(folder)

            loaded = client.read_refinement(path)

            self.assertEqual(loaded["split_recommendations"][0]["status"], "recommended")
            self.assertEqual(
                loaded["merge_recommendations"][0]["target"]["status"],
                "selected",
            )

    def test_rejects_unknown_refinement_fields(self):
        with tempfile.TemporaryDirectory() as folder:
            path = Path(folder) / "unknown-field.json"
            private_field = "private-acme4-workload-name"
            refinement = {**minimal_refinement(), private_field: True}
            path.write_text(json.dumps(refinement), encoding="utf-8")
            client = TelemetryCourtHotFolder(folder)

            with self.assertRaises(RefinementSchemaError) as raised:
                client.read_refinement(path)

            self.assertNotIn(private_field, str(raised.exception))

    def test_missing_hot_folder_error_does_not_echo_configured_absolute_path(self):
        with tempfile.TemporaryDirectory() as folder:
            missing_folder = Path(folder) / "private-acme4-hot-folder"
            client = TelemetryCourtHotFolder(missing_folder)

            with self.assertRaises(HotFolderPathError) as raised:
                client.find_refinements()

            self.assertNotIn(str(missing_folder), str(raised.exception))
            self.assertIsNone(raised.exception.__cause__)

            with patch(
                "telemetry_court_client.Path.is_dir",
                side_effect=OSError(str(missing_folder)),
            ):
                with self.assertRaises(HotFolderPathError) as inspection_error:
                    client.find_refinements()

            self.assertNotIn(str(missing_folder), str(inspection_error.exception))
            self.assertIsNone(inspection_error.exception.__cause__)

    def test_read_refinement_rejects_paths_outside_hot_folder(self):
        with tempfile.TemporaryDirectory() as folder:
            with tempfile.TemporaryDirectory() as outside_folder:
                path = Path(outside_folder) / "outside.json"
                path.write_text(json.dumps(minimal_refinement()), encoding="utf-8")
                client = TelemetryCourtHotFolder(folder)

                with self.assertRaises(RefinementReadError):
                    client.read_refinement(path)

    def test_read_refinement_rejects_symlink_even_when_target_is_inside_folder(self):
        with tempfile.TemporaryDirectory() as folder:
            target = Path(folder) / "target.json"
            link = Path(folder) / "linked.json"
            target.write_text(json.dumps(minimal_refinement()), encoding="utf-8")
            link.symlink_to(target)
            client = TelemetryCourtHotFolder(folder)

            with self.assertRaises(RefinementReadError):
                client.read_refinement(link)

    def test_read_refinement_rejects_malformed_json_without_echoing_content(self):
        with tempfile.TemporaryDirectory() as folder:
            path = Path(folder) / "malformed.json"
            path.write_text('{"private_payload": "do-not-echo",', encoding="utf-8")
            client = TelemetryCourtHotFolder(folder)

            with self.assertRaises(RefinementReadError) as raised:
                client.read_refinement(path)

            self.assertNotIn("do-not-echo", str(raised.exception))

    def test_read_refinement_rejects_oversized_json(self):
        with tempfile.TemporaryDirectory() as folder:
            path = Path(folder) / "oversized.json"
            path.write_bytes(b" " * (CLUSTER_REFINEMENT_JSON_MAX_BYTES + 1))
            client = TelemetryCourtHotFolder(folder)

            with self.assertRaises(RefinementReadError):
                client.read_refinement(path)

    def test_read_refinement_rejects_file_identity_changes_during_read(self):
        with tempfile.TemporaryDirectory() as folder:
            path = Path(folder) / "racing-refinement.json"
            path.write_text(json.dumps(minimal_refinement()), encoding="utf-8")
            client = TelemetryCourtHotFolder(folder)
            initial = path.stat()

            for field in ("st_dev", "st_ino", "st_size", "st_mtime_ns", "st_ctime_ns"):
                with self.subTest(field=field):
                    changed = copy_stat(initial, **{field: getattr(initial, field) + 1})
                    with patch(
                        "telemetry_court_client.os.fstat",
                        side_effect=[initial, changed],
                    ):
                        with self.assertRaises(RefinementReadError):
                            client.read_refinement(path)

    def test_read_refinement_rejects_byte_length_that_disagrees_with_stat(self):
        with tempfile.TemporaryDirectory() as folder:
            path = Path(folder) / "short-read-refinement.json"
            path.write_text(json.dumps(minimal_refinement()), encoding="utf-8")
            client = TelemetryCourtHotFolder(folder)
            initial = path.stat()
            inconsistent = copy_stat(initial, st_size=initial.st_size + 1)

            with patch(
                "telemetry_court_client.os.fstat",
                side_effect=[inconsistent, inconsistent],
            ):
                with self.assertRaises(RefinementReadError):
                    client.read_refinement(path)

    def test_finds_refinement_files_newest_first_and_filters_by_ids(self):
        with tempfile.TemporaryDirectory() as folder:
            older = Path(folder) / "older.json"
            newer = Path(folder) / "newer.json"
            older.write_text(
                json.dumps(
                    minimal_refinement(
                        refinement_id="refinement-older",
                        package_id="pkg-filtered",
                        case_id="case-filtered",
                        cluster_id="cluster-filtered",
                    ),
                ),
                encoding="utf-8",
            )
            newer.write_text(
                json.dumps(
                    minimal_refinement(
                        refinement_id="refinement-newer",
                        package_id="pkg-filtered",
                        case_id="case-filtered",
                        cluster_id="cluster-filtered",
                    ),
                ),
                encoding="utf-8",
            )
            set_mtime(older, 1_700_000_000)
            set_mtime(newer, 1_700_000_100)
            client = TelemetryCourtHotFolder(folder)

            results = client.find_refinements(
                package_id="pkg-filtered",
                case_id="case-filtered",
                cluster_id="cluster-filtered",
            )

            self.assertEqual(
                [result["filename"] for result in results],
                ["newer.json", "older.json"],
            )
            self.assertEqual(results[0]["refinement_id"], "refinement-newer")

    def test_find_refinements_ignores_hidden_and_non_json_files(self):
        with tempfile.TemporaryDirectory() as folder:
            hidden = Path(folder) / ".hidden.json"
            notes = Path(folder) / "notes.txt"
            hidden.write_text(json.dumps(minimal_refinement()), encoding="utf-8")
            notes.write_text(json.dumps(minimal_refinement()), encoding="utf-8")
            client = TelemetryCourtHotFolder(folder)

            self.assertEqual(client.find_refinements(), [])


def minimal_case_package():
    return {
        "schema_version": "case_package.v0.1",
        "package_id": "pkg-test-001",
        "case": {
            "case_id": "case-test-001",
        },
        "cluster": {
            "cluster_id": "cluster-test-001",
        },
    }


def minimal_refinement(
    refinement_id="refinement-test-001",
    package_id="pkg-test-001",
    case_id="case-test-001",
    cluster_id="cluster-test-001",
):
    return {
        "schema_version": "cluster_refinement.v0.1",
        "calculation_version": "cluster_refinement_calculation.v0.1",
        "refinement_id": refinement_id,
        "generated_at": "2026-06-24T00:00:00.000Z",
        "source_application": "telemetry_court",
        "format": "local_json",
        "case_package": {
            "schema_version": "case_package.v0.1",
            "package_id": package_id,
            "case_id": case_id,
            "cluster_id": cluster_id,
            "pipeline": {
                "run_id": "run-test-001",
                "upstream_tool": "approved-upstream-notebook",
                "generated_at": "2026-06-24T00:00:00.000Z",
            },
        },
        "compatibility": {
            "review_result_schema_version": "review_result.v0.1",
            "review_protocol_version": "telemetry_court_review.v0.1",
            "evaluation_report_schema_version": "evaluation_report.v0.1",
            "evaluation_report_calculation_version": "review_result_aggregation.v0.3",
        },
        "source_review_ids": ["review-test-001"],
        "source_reviews": [
            {
                "review_id": "review-test-001",
                "review_session_id": "review-session-test-001",
                "created_at": "2026-06-24T00:00:00.000Z",
            }
        ],
        "reviewer_count": 1,
        "prune_session_ids": ["session-test-001"],
        "session_exclusion_recommendations": [
            {
                "session_id": "session-test-001",
                "status": "recommended",
                "selected_count": 1,
                "qualifying_review_count": 1,
                "reviewer_count": 1,
                "source_review_ids": ["review-test-001"],
                "qualifying_source_review_ids": ["review-test-001"],
                "signals": {
                    "final_verdicts": ["needs_split"],
                    "recommended_actions": [],
                    "failure_modes": [],
                },
                "disagreement": {
                    "status": "unavailable",
                    "has_disagreement": None,
                    "selected_by_all_reviewers": None,
                    "competing_session_ids": [],
                    "reason": "At least two compatible source reviews are required.",
                },
            }
        ],
        "split_recommendations": [],
        "merge_recommendations": [],
        "uncertainty": {
            "status": "not_reported",
            "reviewer_count": 1,
            "uncertain_review_count": 0,
            "low_confidence_review_count": 0,
            "source_review_ids": [],
            "signals": {
                "final_verdicts": [],
                "recommended_actions": [],
                "confidence_levels": [],
            },
        },
        "disagreement": {
            "status": "unavailable",
            "reason": "At least two compatible source reviews are required.",
            "has_any_disagreement": None,
            "verdict": None,
            "recommended_action": None,
            "label_winner": None,
            "evidence_ratings": None,
            "evidence_ids": [],
            "session_exclusion": None,
            "split_recommendation": None,
            "merge_recommendation": None,
        },
    }


def valid_split_recommendation():
    return {
        "cluster_id": "cluster-test-001",
        "status": "recommended",
        "supporting_review_count": 1,
        "reviewer_count": 1,
        "source_review_ids": ["review-test-001"],
        "signals": {
            "final_verdicts": ["needs_split"],
            "recommended_actions": [],
            "failure_modes": [],
        },
        "details": {
            "reason_codes": ["mixed_behaviors"],
            "affected_session_ids": ["session-test-001"],
            "evidence_ids": ["evidence-test-001"],
        },
        "disagreement": {
            "status": "unavailable",
            "has_disagreement": None,
            "reason": "At least two compatible source reviews are required.",
        },
    }


def valid_merge_recommendation():
    return {
        "cluster_id": "cluster-test-001",
        "status": "recommended",
        "supporting_review_count": 1,
        "reviewer_count": 1,
        "source_review_ids": ["review-test-001"],
        "signals": {
            "final_verdicts": ["needs_merge"],
            "recommended_actions": [],
        },
        "target": {
            "status": "selected",
            "neighbor_cluster_ids": ["cluster-neighbor"],
            "reason_codes": ["shared_behavior"],
        },
        "disagreement": {
            "status": "unavailable",
            "has_disagreement": None,
            "reason": "At least two compatible source reviews are required.",
        },
    }


def copy_stat(file_stat, **changes):
    fields = ("st_mode", "st_dev", "st_ino", "st_size", "st_mtime_ns", "st_ctime_ns")
    values = {
        field: changes.get(field, getattr(file_stat, field))
        for field in fields
    }
    return SimpleNamespace(**values)


def set_mtime(path, epoch_seconds):
    os.utime(path, (epoch_seconds, epoch_seconds))


if __name__ == "__main__":
    unittest.main()
