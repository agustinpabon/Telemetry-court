import json
import os
import sys
import tempfile
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from telemetry_court_client import (  # noqa: E402
    CasePackageShapeError,
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

    def test_read_refinement_rejects_paths_outside_hot_folder(self):
        with tempfile.TemporaryDirectory() as folder:
            with tempfile.TemporaryDirectory() as outside_folder:
                path = Path(outside_folder) / "outside.json"
                path.write_text(json.dumps(minimal_refinement()), encoding="utf-8")
                client = TelemetryCourtHotFolder(folder)

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
        "source_review_ids": [],
        "prune_session_ids": [],
        "split_recommendations": [],
        "merge_recommendations": [],
        "uncertainty": {
            "status": "not_reported",
        },
        "disagreement": {
            "status": "unavailable",
        },
    }


def set_mtime(path, epoch_seconds):
    os.utime(path, (epoch_seconds, epoch_seconds))


if __name__ == "__main__":
    unittest.main()
