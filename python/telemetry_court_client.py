"""Lightweight Hot-Folder helpers for Telemetry Court notebook workflows.

This module writes already-approved CasePackage-shaped JSON into a local
Telemetry Court Hot-Folder and reads Telemetry Court cluster refinement exports.
It intentionally does not run clustering, embedding, naming, Toponymy, ACME4,
or raw telemetry ingestion.
"""

from __future__ import annotations

import json
import math
import os
import re
import tempfile
from collections.abc import Mapping, Sequence
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

CASE_PACKAGE_SCHEMA_VERSION = "case_package.v0.1"
CLUSTER_REFINEMENT_SCHEMA_VERSION = "cluster_refinement.v0.1"
CLUSTER_REFINEMENT_CALCULATION_VERSION = "cluster_refinement_calculation.v0.1"
HOT_FOLDER_ENV_VAR = "TELEMETRY_COURT_HOT_FOLDER"

_SAFE_FRAGMENT_PATTERN = re.compile(r"[^A-Za-z0-9._-]+")
_REQUIRED_REFINEMENT_FIELDS = {
    "schema_version",
    "refinement_id",
    "generated_at",
    "case_package",
    "source_review_ids",
    "prune_session_ids",
    "split_recommendations",
    "merge_recommendations",
    "uncertainty",
    "disagreement",
}


class TelemetryCourtHotFolderError(Exception):
    """Base exception for Telemetry Court Hot-Folder helper failures."""


class HotFolderPathError(TelemetryCourtHotFolderError):
    """Raised when a configured Hot-Folder path is missing or unusable."""


class CasePackageShapeError(TelemetryCourtHotFolderError):
    """Raised when input is not minimally CasePackage-shaped JSON."""


class UnsafeFilenameError(TelemetryCourtHotFolderError):
    """Raised when a filename override could escape or hide from the Hot-Folder."""


class HotFolderWriteError(TelemetryCourtHotFolderError):
    """Raised when a CasePackage cannot be written safely."""


class RefinementReadError(TelemetryCourtHotFolderError):
    """Raised when a refinement file cannot be read as JSON."""


class RefinementSchemaError(TelemetryCourtHotFolderError):
    """Raised when a JSON file is not a cluster_refinement.v0.1 artifact."""


class TelemetryCourtHotFolder:
    """Small file-contract helper for a configured Telemetry Court Hot-Folder."""

    def __init__(self, hot_folder_path: str | os.PathLike[str]) -> None:
        self.hot_folder_path = Path(hot_folder_path).expanduser()

    @classmethod
    def from_env(
        cls,
        env_var: str = HOT_FOLDER_ENV_VAR,
        env: Mapping[str, str | None] | None = None,
    ) -> "TelemetryCourtHotFolder":
        environ = os.environ if env is None else env
        configured_path = (environ.get(env_var) or "").strip()
        if not configured_path:
            raise HotFolderPathError(
                f"Hot-Folder is not configured. Set {env_var} to a local folder path."
            )
        return cls(configured_path)

    def write_case_package(
        self,
        case_package: Mapping[str, Any] | str,
        *,
        filename: str | os.PathLike[str] | None = None,
        dry_run: bool = False,
        overwrite: bool = False,
    ) -> dict[str, Any]:
        """Write a minimally validated CasePackage object to the Hot-Folder.

        The input must already be approved/sanitized and CasePackage-shaped.
        This helper checks identity fields only; the Telemetry Court app remains
        the full runtime validator.
        """

        payload = _coerce_json_object(
            case_package,
            error_type=CasePackageShapeError,
            label="CasePackage",
        )
        identity = _extract_case_package_identity(payload)
        output_filename = (
            _validate_filename_override(filename)
            if filename is not None
            else _derive_case_package_filename(identity)
        )
        output_path = self.hot_folder_path / output_filename
        _assert_top_level_path_in_folder(
            self.hot_folder_path,
            output_path,
            UnsafeFilenameError,
        )
        json_text = _stable_json(payload, error_type=CasePackageShapeError)
        size_bytes = len(json_text.encode("utf-8"))
        exists = output_path.exists()
        result = {
            "path": str(output_path),
            "filename": output_filename,
            "schema_version": identity["schema_version"],
            "package_id": identity["package_id"],
            "case_id": identity["case_id"],
            "cluster_id": identity["cluster_id"],
            "dry_run": dry_run,
            "written": False,
            "exists": exists,
            "would_overwrite": bool(exists and overwrite),
            "size_bytes": size_bytes,
        }

        if dry_run:
            return result

        _require_existing_folder(self.hot_folder_path)
        if output_path.exists() and not overwrite:
            raise HotFolderWriteError(
                f"Refusing to overwrite existing Hot-Folder file: {output_filename}"
            )

        _atomic_write_text(output_path, json_text)
        written_stat = output_path.stat()
        return {
            **result,
            "written": True,
            "exists": True,
            "modified_at": _format_timestamp(written_stat.st_mtime),
            "size_bytes": written_stat.st_size,
        }

    def find_refinements(
        self,
        *,
        package_id: str | None = None,
        case_id: str | None = None,
        cluster_id: str | None = None,
        newest_first: bool = True,
    ) -> list[dict[str, Any]]:
        """Find top-level cluster_refinement.v0.1 JSON files in the Hot-Folder."""

        folder_path = _require_existing_folder(self.hot_folder_path)
        candidates: list[dict[str, Any]] = []

        for path in folder_path.iterdir():
            if not _is_visible_json_file(path):
                continue

            try:
                refinement = self.read_refinement(path)
                file_stat = path.stat()
            except TelemetryCourtHotFolderError:
                continue
            except OSError:
                continue

            identity = _extract_refinement_identity(refinement)
            if package_id is not None and identity.get("package_id") != package_id:
                continue
            if case_id is not None and identity.get("case_id") != case_id:
                continue
            if cluster_id is not None and identity.get("cluster_id") != cluster_id:
                continue

            candidates.append(
                {
                    "modified_at_ns": file_stat.st_mtime_ns,
                    "filename": path.name,
                    "candidate": {
                        "path": str(path),
                        "filename": path.name,
                        "modified_at": _format_timestamp(file_stat.st_mtime),
                        "modified_at_timestamp": file_stat.st_mtime,
                        "size_bytes": file_stat.st_size,
                        "schema_version": refinement["schema_version"],
                        "refinement_id": refinement.get("refinement_id"),
                        "package_id": identity.get("package_id"),
                        "case_id": identity.get("case_id"),
                        "cluster_id": identity.get("cluster_id"),
                    },
                }
            )

        if newest_first:
            sorted_candidates = sorted(
                candidates,
                key=lambda item: (-item["modified_at_ns"], item["filename"]),
            )
        else:
            sorted_candidates = sorted(
                candidates,
                key=lambda item: (item["modified_at_ns"], item["filename"]),
            )

        return [item["candidate"] for item in sorted_candidates]

    def read_refinement(
        self,
        path: str | os.PathLike[str] | Mapping[str, Any],
    ) -> dict[str, Any]:
        """Read and minimally verify a cluster_refinement.v0.1 JSON file."""

        refinement_path = _coerce_refinement_path(path)
        if not refinement_path.is_absolute() and refinement_path.parent == Path("."):
            refinement_path = self.hot_folder_path / refinement_path

        _assert_top_level_path_in_folder(
            self.hot_folder_path,
            refinement_path,
            RefinementReadError,
        )
        if not _is_visible_json_file(refinement_path):
            raise RefinementReadError(
                f"Refinement path must be a visible top-level .json file: {refinement_path.name}"
            )

        try:
            raw_text = refinement_path.read_text(encoding="utf-8")
        except OSError as error:
            raise RefinementReadError(
                f"Could not read refinement JSON file: {refinement_path}"
            ) from error

        refinement = _coerce_json_object(
            raw_text,
            error_type=RefinementReadError,
            label="cluster refinement",
        )
        _validate_refinement_shape(refinement, refinement_path)
        return refinement


def _coerce_json_object(
    value: Mapping[str, Any] | str,
    *,
    error_type: type[TelemetryCourtHotFolderError],
    label: str,
) -> dict[str, Any]:
    if isinstance(value, str):
        try:
            parsed = json.loads(value)
        except json.JSONDecodeError as error:
            raise error_type(f"{label} JSON could not be parsed: {error.msg}") from error
    elif isinstance(value, Mapping):
        parsed = _to_json_compatible(value, error_type=error_type, path="$")
    else:
        raise error_type(f"{label} must be a JSON object or JSON object string.")

    if not isinstance(parsed, dict):
        raise error_type(f"{label} must be a JSON object.")

    return parsed


def _to_json_compatible(
    value: Any,
    *,
    error_type: type[TelemetryCourtHotFolderError],
    path: str,
) -> Any:
    if isinstance(value, Mapping):
        return {
            _string_key(key, error_type=error_type, path=path): _to_json_compatible(
                nested_value,
                error_type=error_type,
                path=f"{path}.{key}",
            )
            for key, nested_value in value.items()
        }

    if isinstance(value, str) or value is None or isinstance(value, bool):
        return value

    if isinstance(value, int):
        return value

    if isinstance(value, float):
        if not math.isfinite(value):
            raise error_type(f"{path} must be finite JSON number.")
        return value

    if isinstance(value, Sequence) and not isinstance(value, (bytes, bytearray)):
        return [
            _to_json_compatible(item, error_type=error_type, path=f"{path}[]")
            for item in value
        ]

    raise error_type(f"{path} contains a value that cannot be written as JSON.")


def _string_key(
    key: Any,
    *,
    error_type: type[TelemetryCourtHotFolderError],
    path: str,
) -> str:
    if not isinstance(key, str):
        raise error_type(f"{path} contains a non-string JSON object key.")
    return key


def _extract_case_package_identity(payload: Mapping[str, Any]) -> dict[str, str]:
    schema_version = _require_string(
        payload,
        "schema_version",
        "$.schema_version",
        CasePackageShapeError,
    )
    if schema_version != CASE_PACKAGE_SCHEMA_VERSION:
        raise CasePackageShapeError(
            f"Unsupported CasePackage schema_version: {schema_version!r}"
        )

    package_id = _require_string(
        payload,
        "package_id",
        "$.package_id",
        CasePackageShapeError,
    )
    case = _require_mapping(payload, "case", "$.case", CasePackageShapeError)
    case_id = _require_string(case, "case_id", "$.case.case_id", CasePackageShapeError)
    cluster = _require_mapping(
        payload,
        "cluster",
        "$.cluster",
        CasePackageShapeError,
    )
    cluster_id = _require_string(
        cluster,
        "cluster_id",
        "$.cluster.cluster_id",
        CasePackageShapeError,
    )

    return {
        "schema_version": schema_version,
        "package_id": package_id,
        "case_id": case_id,
        "cluster_id": cluster_id,
    }


def _require_mapping(
    payload: Mapping[str, Any],
    key: str,
    path: str,
    error_type: type[TelemetryCourtHotFolderError],
) -> Mapping[str, Any]:
    value = payload.get(key)
    if not isinstance(value, Mapping):
        raise error_type(f"{path} must be an object.")
    return value


def _require_string(
    payload: Mapping[str, Any],
    key: str,
    path: str,
    error_type: type[TelemetryCourtHotFolderError],
) -> str:
    value = payload.get(key)
    if not isinstance(value, str) or not value.strip():
        raise error_type(f"{path} must be a non-empty string.")
    return value


def _validate_filename_override(filename: str | os.PathLike[str]) -> str:
    raw_filename = os.fspath(filename)
    path = Path(raw_filename)

    if (
        not raw_filename
        or raw_filename in {".", ".."}
        or path.is_absolute()
        or "/" in raw_filename
        or "\\" in raw_filename
        or path.name != raw_filename
        or raw_filename.startswith(".")
        or path.suffix.lower() != ".json"
    ):
        raise UnsafeFilenameError(
            "Filename override must be a visible .json filename without path separators."
        )

    return raw_filename


def _derive_case_package_filename(identity: Mapping[str, str]) -> str:
    package_fragment = _safe_filename_fragment(identity["package_id"])
    case_fragment = _safe_filename_fragment(identity["case_id"])
    return f"case-package-{package_fragment}__{case_fragment}.json"


def _safe_filename_fragment(value: str) -> str:
    fragment = _SAFE_FRAGMENT_PATTERN.sub("-", value.strip())
    fragment = re.sub(r"-+", "-", fragment).strip("._-")
    if not fragment:
        return "unnamed"
    return fragment[:80]


def _assert_top_level_path_in_folder(
    folder_path: Path,
    candidate_path: Path,
    error_type: type[TelemetryCourtHotFolderError],
) -> None:
    resolved_folder = folder_path.expanduser().resolve(strict=False)
    resolved_candidate = candidate_path.expanduser().resolve(strict=False)

    if resolved_candidate.parent != resolved_folder:
        raise error_type("Path must be a top-level file inside the Hot-Folder.")


def _require_existing_folder(folder_path: Path) -> Path:
    try:
        if folder_path.is_dir():
            return folder_path
    except OSError as error:
        raise HotFolderPathError(
            f"Configured Hot-Folder could not be inspected: {folder_path}"
        ) from error

    raise HotFolderPathError(
        f"Configured Hot-Folder does not exist or is not a directory: {folder_path}"
    )


def _stable_json(
    payload: Mapping[str, Any],
    *,
    error_type: type[TelemetryCourtHotFolderError],
) -> str:
    try:
        return f"{json.dumps(payload, ensure_ascii=False, indent=2, sort_keys=True, allow_nan=False)}\n"
    except (TypeError, ValueError) as error:
        raise error_type("Object could not be serialized as stable UTF-8 JSON.") from error


def _atomic_write_text(output_path: Path, text: str) -> None:
    temp_file_path = None
    try:
        with tempfile.NamedTemporaryFile(
            "w",
            encoding="utf-8",
            dir=output_path.parent,
            prefix=f".{output_path.name}.",
            suffix=".tmp",
            delete=False,
        ) as temp_file:
            temp_file.write(text)
            temp_file.flush()
            os.fsync(temp_file.fileno())
            temp_file_path = Path(temp_file.name)

        os.replace(temp_file_path, output_path)
    except OSError as error:
        raise HotFolderWriteError(
            f"Could not write CasePackage JSON to Hot-Folder: {output_path.name}"
        ) from error
    finally:
        if temp_file_path is not None and temp_file_path.exists():
            try:
                temp_file_path.unlink()
            except OSError:
                pass


def _is_visible_json_file(path: Path) -> bool:
    return path.is_file() and not path.name.startswith(".") and path.suffix.lower() == ".json"


def _coerce_refinement_path(path: str | os.PathLike[str] | Mapping[str, Any]) -> Path:
    if isinstance(path, Mapping):
        candidate_path = path.get("path")
        if not isinstance(candidate_path, (str, os.PathLike)):
            raise RefinementReadError("Refinement candidate must include a path string.")
        return Path(candidate_path)

    return Path(path)


def _validate_refinement_shape(
    refinement: Mapping[str, Any],
    refinement_path: Path,
) -> None:
    schema_version = refinement.get("schema_version")
    if schema_version != CLUSTER_REFINEMENT_SCHEMA_VERSION:
        raise RefinementSchemaError(
            f"Unsupported refinement schema_version in {refinement_path.name}: {schema_version!r}"
        )

    missing_fields = sorted(_REQUIRED_REFINEMENT_FIELDS - refinement.keys())
    if missing_fields:
        raise RefinementSchemaError(
            f"Refinement {refinement_path.name} is missing required fields: {', '.join(missing_fields)}"
        )

    case_package = refinement.get("case_package")
    if not isinstance(case_package, Mapping):
        raise RefinementSchemaError(
            f"Refinement {refinement_path.name} must include a case_package object."
        )


def _extract_refinement_identity(refinement: Mapping[str, Any]) -> dict[str, str | None]:
    case_package = refinement.get("case_package")
    if not isinstance(case_package, Mapping):
        return {"package_id": None, "case_id": None, "cluster_id": None}

    return {
        "package_id": _optional_string(case_package.get("package_id")),
        "case_id": _optional_string(case_package.get("case_id")),
        "cluster_id": _optional_string(case_package.get("cluster_id")),
    }


def _optional_string(value: Any) -> str | None:
    return value if isinstance(value, str) and value else None


def _format_timestamp(epoch_seconds: float) -> str:
    return datetime.fromtimestamp(epoch_seconds, tz=timezone.utc).isoformat()
