"""Strict consumer validation for Telemetry Court cluster refinement v0.1."""

from __future__ import annotations

from collections.abc import Mapping
from typing import Any


class ClusterRefinementValidationError(ValueError):
    pass


TOP_LEVEL_FIELDS = {
    "schema_version",
    "calculation_version",
    "refinement_id",
    "generated_at",
    "source_application",
    "format",
    "case_package",
    "compatibility",
    "source_review_ids",
    "source_reviews",
    "reviewer_count",
    "prune_session_ids",
    "session_exclusion_recommendations",
    "split_recommendations",
    "merge_recommendations",
    "uncertainty",
    "disagreement",
}
CASE_PACKAGE_FIELDS = {
    "schema_version", "package_id", "package_revision", "case_id", "cluster_id", "pipeline",
}
COMPATIBILITY = {
    "review_result_schema_version": "review_result.v0.1",
    "review_protocol_version": "telemetry_court_review.v0.1",
    "evaluation_report_schema_version": "evaluation_report.v0.1",
    "evaluation_report_calculation_version": "review_result_aggregation.v0.3",
}
SPLIT_REASONS = {
    "boundary_sessions", "conflicting_evidence", "low_coherence", "mixed_behaviors",
}
MERGE_REASONS = {"ambiguous_boundary", "neighbor_evidence_overlap", "shared_behavior"}
SPLIT_SIGNAL_VALUES = {
    "final_verdicts": {"cluster_impure", "needs_split"},
    "recommended_actions": {"split_cluster"},
    "failure_modes": {"cluster_seems_mixed"},
}
MERGE_SIGNAL_VALUES = {
    "final_verdicts": {"needs_merge"}, "recommended_actions": {"merge_cluster"},
}


def validate_cluster_refinement_v01(value: Mapping[str, Any]) -> None:
    """Validate the compatibility and actionable-recommendation boundary."""

    _keys(value, TOP_LEVEL_FIELDS, "$")
    _exact(value, "schema_version", "cluster_refinement.v0.1", "$.schema_version")
    _exact(
        value,
        "calculation_version",
        "cluster_refinement_calculation.v0.1",
        "$.calculation_version",
    )
    _exact(value, "source_application", "telemetry_court", "$.source_application")
    _exact(value, "format", "local_json", "$.format")
    _string(value, "refinement_id", "$.refinement_id")
    _string(value, "generated_at", "$.generated_at")

    case_package = _object(value, "case_package", "$.case_package")
    _keys(case_package, CASE_PACKAGE_FIELDS, "$.case_package", optional={"package_revision"})
    _exact(case_package, "schema_version", "case_package.v0.1", "$.case_package.schema_version")
    for field in ("package_id", "case_id", "cluster_id"):
        _string(case_package, field, f"$.case_package.{field}")
    if "package_revision" in case_package:
        _string(case_package, "package_revision", "$.case_package.package_revision")
    pipeline = _object(case_package, "pipeline", "$.case_package.pipeline")
    for field in ("run_id", "upstream_tool", "generated_at"):
        _string(pipeline, field, f"$.case_package.pipeline.{field}")

    compatibility = _object(value, "compatibility", "$.compatibility")
    _keys(compatibility, set(COMPATIBILITY), "$.compatibility")
    for field, expected in COMPATIBILITY.items():
        _exact(compatibility, field, expected, f"$.compatibility.{field}")

    source_review_ids = _ids(value, "source_review_ids", "$.source_review_ids", nonempty=True)
    source_reviews = _records(value, "source_reviews", "$.source_reviews")
    metadata_ids: list[str] = []
    for index, source_review in enumerate(source_reviews):
        path = f"$.source_reviews[{index}]"
        _keys(
            source_review,
            {"review_id", "review_session_id", "created_at"},
            path,
            optional={"review_session_id", "created_at"},
        )
        metadata_ids.append(_string(source_review, "review_id", f"{path}.review_id"))
    _sorted_unique(metadata_ids, "$.source_reviews review_id values", nonempty=True)
    if metadata_ids != source_review_ids:
        _fail("$.source_reviews review_id values must match $.source_review_ids.")

    reviewer_count = _integer(value, "reviewer_count", "$.reviewer_count")
    if reviewer_count == 0 or reviewer_count != len(source_review_ids):
        _fail("$.reviewer_count must equal the positive source review count.")
    source_id_set = set(source_review_ids)

    recommended_ids = _validate_session_recommendations(
        value,
        reviewer_count,
        source_id_set,
    )
    prune_ids = _ids(value, "prune_session_ids", "$.prune_session_ids")
    if prune_ids != recommended_ids:
        _fail("$.prune_session_ids must equal the sorted recommended session IDs.")

    _validate_cluster_recommendations(
        value,
        "split_recommendations",
        str(case_package["cluster_id"]),
        reviewer_count,
        source_id_set,
    )
    _validate_cluster_recommendations(
        value,
        "merge_recommendations",
        str(case_package["cluster_id"]),
        reviewer_count,
        source_id_set,
    )
    _object(value, "uncertainty", "$.uncertainty")
    _object(value, "disagreement", "$.disagreement")

def _validate_session_recommendations(
    artifact: Mapping[str, Any],
    reviewer_count: int,
    source_review_ids: set[str],
) -> list[str]:
    recommendations = _records(
        artifact,
        "session_exclusion_recommendations",
        "$.session_exclusion_recommendations",
    )
    session_ids: list[str] = []
    recommended_ids: list[str] = []
    fields = {
        "session_id",
        "status",
        "selected_count",
        "qualifying_review_count",
        "reviewer_count",
        "source_review_ids",
        "qualifying_source_review_ids",
        "signals",
        "disagreement",
    }
    for index, recommendation in enumerate(recommendations):
        path = f"$.session_exclusion_recommendations[{index}]"
        _keys(recommendation, fields, path)
        session_id = _string(recommendation, "session_id", f"{path}.session_id")
        session_ids.append(session_id)
        status = _enum(
            recommendation,
            "status",
            {"recommended", "not_recommended"},
            f"{path}.status",
        )
        selected_count = _integer(recommendation, "selected_count", f"{path}.selected_count")
        qualifying_count = _integer(
            recommendation,
            "qualifying_review_count",
            f"{path}.qualifying_review_count",
        )
        if _integer(recommendation, "reviewer_count", f"{path}.reviewer_count") != reviewer_count:
            _fail(f"{path}.reviewer_count must match $.reviewer_count.")
        selected_sources = _ids(
            recommendation,
            "source_review_ids",
            f"{path}.source_review_ids",
            nonempty=True,
        )
        qualifying_sources = _ids(
            recommendation,
            "qualifying_source_review_ids",
            f"{path}.qualifying_source_review_ids",
        )
        if not set(selected_sources).issubset(source_review_ids):
            _fail(f"{path}.source_review_ids contains an unknown review ID.")
        if not set(qualifying_sources).issubset(set(selected_sources)):
            _fail(f"{path}.qualifying_source_review_ids must be a source subset.")
        if selected_count != len(selected_sources) or qualifying_count != len(qualifying_sources):
            _fail(f"{path} review counts must match their source ID arrays.")
        expected_status = "recommended" if qualifying_sources else "not_recommended"
        if status != expected_status:
            _fail(f"{path}.status is inconsistent with qualifying source reviews.")
        _signals(recommendation, f"{path}.signals", SPLIT_SIGNAL_VALUES)
        _object(recommendation, "disagreement", f"{path}.disagreement")
        if status == "recommended":
            recommended_ids.append(session_id)
    _sorted_unique(session_ids, "session recommendation IDs")
    return recommended_ids


def _validate_cluster_recommendations(
    artifact: Mapping[str, Any],
    field: str,
    cluster_id: str,
    reviewer_count: int,
    source_review_ids: set[str],
) -> list[Mapping[str, Any]]:
    path = f"$.{field}"
    recommendations = _records(artifact, field, path)
    cluster_ids: list[str] = []
    for index, recommendation in enumerate(recommendations):
        item_path = f"{path}[{index}]"
        extra = "details" if field == "split_recommendations" else "target"
        _keys(
            recommendation,
            {
                "cluster_id",
                "status",
                "supporting_review_count",
                "reviewer_count",
                "source_review_ids",
                "signals",
                extra,
                "disagreement",
            },
            item_path,
            optional={"details"} if field == "split_recommendations" else set(),
        )
        item_cluster_id = _string(recommendation, "cluster_id", f"{item_path}.cluster_id")
        cluster_ids.append(item_cluster_id)
        if item_cluster_id != cluster_id:
            _fail(f"{item_path}.cluster_id must match $.case_package.cluster_id.")
        _enum(recommendation, "status", {"recommended"}, f"{item_path}.status")
        supporting_count = _integer(
            recommendation,
            "supporting_review_count",
            f"{item_path}.supporting_review_count",
        )
        if (
            _integer(
                recommendation,
                "reviewer_count",
                f"{item_path}.reviewer_count",
            )
            != reviewer_count
        ):
            _fail(f"{item_path}.reviewer_count must match $.reviewer_count.")
        sources = _ids(
            recommendation,
            "source_review_ids",
            f"{item_path}.source_review_ids",
            nonempty=True,
        )
        if supporting_count != len(sources) or not set(sources).issubset(source_review_ids):
            _fail(f"{item_path} must reference exactly its supporting source reviews.")
        if field == "split_recommendations":
            _signals(recommendation, f"{item_path}.signals", SPLIT_SIGNAL_VALUES)
            if "details" in recommendation:
                _validate_split_details(recommendation, item_path)
        else:
            _signals(recommendation, f"{item_path}.signals", MERGE_SIGNAL_VALUES)
            _validate_merge_target(recommendation, item_path)
        _object(recommendation, "disagreement", f"{item_path}.disagreement")
    _sorted_unique(cluster_ids, f"{path} cluster IDs")
    return recommendations


def _validate_split_details(recommendation: Mapping[str, Any], path: str) -> None:
    details = _object(recommendation, "details", f"{path}.details")
    _keys(details, {"reason_codes", "affected_session_ids", "evidence_ids"}, f"{path}.details")
    if not _ids(
        details,
        "reason_codes",
        f"{path}.details.reason_codes",
        allowed=SPLIT_REASONS,
    ):
        _fail(f"{path}.details.reason_codes must not be empty.")
    _ids(details, "affected_session_ids", f"{path}.details.affected_session_ids")
    _ids(details, "evidence_ids", f"{path}.details.evidence_ids")


def _validate_merge_target(recommendation: Mapping[str, Any], path: str) -> None:
    target = _object(recommendation, "target", f"{path}.target")
    status = target.get("status")
    if status == "selected":
        _keys(target, {"status", "neighbor_cluster_ids", "reason_codes"}, f"{path}.target")
        _ids(target, "neighbor_cluster_ids", f"{path}.target.neighbor_cluster_ids", nonempty=True)
        if not _ids(
            target,
            "reason_codes",
            f"{path}.target.reason_codes",
            allowed=MERGE_REASONS,
        ):
            _fail(f"{path}.target.reason_codes must not be empty.")
        return
    if status == "unavailable":
        _keys(target, {"status", "neighbor_cluster_ids", "reason"}, f"{path}.target")
        if _ids(target, "neighbor_cluster_ids", f"{path}.target.neighbor_cluster_ids"):
            _fail(f"{path}.target neighbor IDs must be empty when unavailable.")
        _string(target, "reason", f"{path}.target.reason")
        return
    _fail(f"{path}.target.status must be selected or unavailable.")


def _signals(
    recommendation: Mapping[str, Any], path: str, fields: Mapping[str, set[str]],
) -> None:
    signals = _object(recommendation, "signals", path)
    _keys(signals, set(fields), path)
    for field, allowed in fields.items():
        _ids(signals, field, f"{path}.{field}", allowed=allowed)


def _keys(
    value: Mapping[str, Any], allowed: set[str], path: str, *,
    optional: set[str] | None = None,
) -> None:
    optional = optional or set()
    unknown = sorted(set(value) - allowed)
    missing = sorted((allowed - optional) - set(value))
    if unknown:
        _fail(f"{path} contains unsupported fields.")
    if missing:
        _fail(f"{path} is missing required fields: {', '.join(missing)}.")


def _object(payload: Mapping[str, Any], field: str, path: str) -> Mapping[str, Any]:
    value = payload.get(field)
    if not isinstance(value, Mapping):
        _fail(f"{path} must be an object.")
    return value


def _records(payload: Mapping[str, Any], field: str, path: str) -> list[Mapping[str, Any]]:
    value = payload.get(field)
    if not isinstance(value, list) or any(not isinstance(item, Mapping) for item in value):
        _fail(f"{path} must be an array of objects.")
    return value


def _string(payload: Mapping[str, Any], field: str, path: str) -> str:
    value = payload.get(field)
    if not isinstance(value, str) or not value.strip():
        _fail(f"{path} must be a non-empty string.")
    return value


def _exact(payload: Mapping[str, Any], field: str, expected: str, path: str) -> None:
    if payload.get(field) != expected:
        _fail(f"{path} must be exactly {expected!r}.")


def _integer(payload: Mapping[str, Any], field: str, path: str) -> int:
    value = payload.get(field)
    if isinstance(value, bool) or not isinstance(value, int) or value < 0:
        _fail(f"{path} must be a non-negative integer.")
    return value


def _enum(payload: Mapping[str, Any], field: str, allowed: set[str], path: str) -> str:
    value = payload.get(field)
    if not isinstance(value, str) or value not in allowed:
        _fail(f"{path} must be one of: {', '.join(sorted(allowed))}.")
    return value


def _ids(
    payload: Mapping[str, Any], field: str, path: str, *, nonempty: bool = False,
    allowed: set[str] | None = None,
) -> list[str]:
    value = payload.get(field)
    if not isinstance(value, list) or any(not isinstance(item, str) for item in value):
        _fail(f"{path} must be an array of strings.")
    _sorted_unique(value, path, nonempty=nonempty)
    if allowed is not None and any(item not in allowed for item in value):
        _fail(f"{path} contains an unsupported value.")
    return value


def _sorted_unique(values: list[str], path: str, *, nonempty: bool = False) -> None:
    if nonempty and not values:
        _fail(f"{path} must not be empty.")
    if any(not value.strip() for value in values):
        _fail(f"{path} must contain non-empty strings.")
    if values != sorted(values):
        _fail(f"{path} must be sorted lexicographically.")
    if len(values) != len(set(values)):
        _fail(f"{path} must not contain duplicate IDs.")


def _fail(message: str) -> None:
    raise ClusterRefinementValidationError(message)
