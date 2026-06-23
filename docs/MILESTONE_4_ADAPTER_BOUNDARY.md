# Milestone 4 - Adapter Boundary Spec

This document defines the interface boundary between upstream clustering/labeling pipelines and Telemetry Court for Milestone 4. It establishes the rules, contracts, and sanitization boundaries required before implementing any adapter code.

---

## 1. Adapter Boundary Overview

Telemetry Court is designed to be an evidence-based human-in-the-loop validation bench. It evaluates whether AI-generated interpretations of telemetry clusters are supported by the evidence, but it does **not** run or execute the telemetry processing or machine learning code.

```text
+--------------------------------------+
|          Upstream Environment        |
|  - Raw Telemetry / Restricted Logs   |
|  - Embedding, UMAP, HDBSCAN          |
|  - Toponymy / DataMapPlot Naming     |
|  - Upstream Notebooks & Pipelines    |
+--------------------------------------+
                   |
                   |  (Sanitized CasePackage JSON)
                   v
+--------------------------------------+
|          Telemetry Court             |
|  - CasePackage Validation            |
|  - Blind Human Review                |
|  - Verdicts & Recommended Actions    |
|  - ReviewResult Export               |
|  - EvaluationReport Aggregation      |
|  - cluster_refinement.v0.1 Export   |
+--------------------------------------+
                   |
                   |  (cluster_refinement.v0.1 JSON)
                   v
+--------------------------------------+
|          Upstream Environment        |
|  - Python / Pandas Refinement        |
|  - Outlier Pruning / Reruns          |
+--------------------------------------+
```

### Ownership Division
* **Upstream notebook or pipeline owns:**
  * Raw telemetry ingestion, parsing, sessionization, and filtering.
  * Vector embedding calculation, low-dimensional projection (e.g., UMAP, t-SNE).
  * Clustering execution (e.g., HDBSCAN, K-Means).
  * AI-generated label generation, prompt formulation, and cluster naming via tools like Toponymy.
  * Cluster map rendering and coordinate calculations (e.g., DataMapPlot).
  * Complete reruns of embeddings or clustering based on feedback.
* **Telemetry Court owns:**
  * Validation of imported `CasePackage` JSON.
  * UI/UX for blind human reviews.
  * Verdicts, evidence classification, and recommended action recording.
  * Export/import of reviewer `ReviewResult` and `ReviewResultBundle` files.
  * Aggregation of compatible review results into an `EvaluationReport`.
  * Export of the `cluster_refinement.v0.1` JSON recipe.
* **Data Transit Constraints:**
  * **No raw telemetry crosses the boundary.** Only sanitized, aggregated, or synthetic summaries, representative session summaries, and audit references are sent from upstream to Telemetry Court.

---

## 2. Producer-Side Mapping

Upstream producers must map their internal clustering outputs to the versioned `CasePackage v0.1` contract format. The table below maps upstream concepts to their corresponding fields in `CasePackageV01`:

| Upstream Concept | CasePackageV01 Concept / Path | Validation & Structural Requirements |
| :--- | :--- | :--- |
| **Schema Version** | `schema_version` | String literal, must be exactly `"case_package.v0.1"`. |
| **Case & Package ID** | `package_id`, `case.case_id` | Stable unique strings prefixed with `pkg-` and `case-` respectively. |
| **Dataset Provenance** | `dataset` | Object containing `dataset_id`, `dataset_name`, `dataset_type` (e.g., `"cloudtrail"`), `data_classification`, `source_environment`, and `approved_use`. |
| **Pipeline Metadata** | `pipeline` | Object containing `pipeline_id` (or `run_id`), `upstream_tool` name, `embedding_model` identifier, `clustering_method`, `generated_at` timestamp, and `config_summary`. |
| **Sanitization Metadata** | `sanitization` | Object describing the `status` with a `CasePackageSanitizationStatusV01` value such as `"synthetic"`, `"sanitized"`, `"approved_internal"`, `"aggregate_only"`, or `"redacted"`, the `method` used, `redaction_notes`, and a valid `review_approval` block for non-synthetic data when runtime validation requires it. |
| **Cluster Identity** | `cluster` | Object containing a stable `cluster_id` (prefixed with `cluster-`), `cluster_name` or `upstream_cluster_label`, and `cluster_size` (total elements in cluster). |
| **Candidate/Generated Label** | `candidate_labels` | Array of label objects, each carrying a unique `label_id`, the `label` text string, `source` (e.g., `"ai_generated"`), and `linked_claim_ids`. |
| **Label Description & Claims** | `claims` | Array of claim objects containing `claim_id` (prefixed with `claim-`), the claim text, `claim_type`, `linked_label_ids`, `linked_evidence_ids`, and optional `evidence_status` (`"linked"` when evidence exists or `"missing_evidence_declared"` only when the absence of evidence is explicit). |
| **Evidence Items** | `evidence_items` | Array of evidence objects with stable `evidence_id`, `title`, `summary`, `evidence_type` (e.g., `"derived_table"`), `content` (structured or unstructured), and `provenance_reference`. |
| **Representative Sessions** | `representative_sessions` | Array of session objects with stable `session_id`, `title`, `summary` of features, `cluster_membership` scores, and `flags` containing `"representative"` or `"borderline"`. |
| **Outliers & Impostors** | `outlier_impostor_candidates` | Its own array of candidate objects. Each candidate may reference a `session_id` and/or `evidence_id`; related representative sessions may use flags such as `"outlier_candidate"` or `"impostor_candidate"`. |
| **Neighbor Clusters** | `neighbor_clusters` | Array of neighbor objects referencing adjacent `cluster_id`s, distance/similarity scores, and reasons why they are relevant. |
| **Topology Coordinates** | `cluster.embedding_map` | Object containing optional `map_id`, `map_tool` (e.g., `"datamapplot"`), `coordinate_space`, and `coordinates` with `x` and `y` float values plus optional `z`. |
| **Model/Prompt Run Metadata** | `pipeline.prompt` | Object capturing the `prompt_id` and a `prompt_summary` or template snippet used for LLM cluster labeling. |

---

## 3. Refinement Consumer Expectations

Once reviews are completed, Telemetry Court generates a `cluster_refinement.v0.1` JSON recipe file. Upstream notebook/Python/Pandas workflows consume this recipe to refine their datasets and retrain their pipelines.

### Consumer Workflow Steps
1. **Read exported refinement JSON**: Parse the `cluster_refinement.v0.1` schema fields.
2. **Prune session IDs**: Exclude or filter out rows corresponding to the session IDs listed in `prune_session_ids` from the clustering dataset.
3. **Split recommendations**: Treat `split_recommendations` as analyst-approved indicators that the cluster is impure. The upstream pipeline should split the cluster (e.g., by adjusting clustering density parameters or performing a sub-clustering step) rather than applying an automatic split.
4. **Merge recommendations**: Treat `merge_recommendations` as analyst-approved hints that two clusters should be combined (e.g., by lowering distance thresholds or merging the topics).
5. **Rerun embedding/clustering**: Execute the clustering pipeline externally in the upstream environment with the updated dataset and parameters.
6. **Preserve audit/provenance links**: When creating a new iteration of a `CasePackage`, carry forward the `refinement_id`, `source_review_ids`, and, where useful, the `source_reviews` summaries in the new package's `provenance` metadata to ensure complete auditability of the refinement loop.

### Illustrative Python / Pandas Pseudocode (Non-Executable Spec)

```python
import json
import pandas as pd

# 1. Load the dataset currently under refinement
df = pd.read_parquet("upstream_telemetry_dataset.parquet")

# 2. Read the exported refinement recipe from Telemetry Court
with open("cluster_refinement_export.json", "r") as f:
    recipe = json.load(f)

# Assert schema version compatibility
assert recipe["schema_version"] == "cluster_refinement.v0.1"

# 3. Apply session exclusions (pruning) based on reviewer feedback
prune_ids = recipe.get("prune_session_ids", [])
if prune_ids:
    print(f"Pruning {len(prune_ids)} sessions from upstream dataset.")
    df = df[~df["session_id"].isin(prune_ids)]

# 4. Inspect split and merge recommendations
for split_rec in recipe.get("split_recommendations", []):
    cluster_id = split_rec["cluster_id"]
    print(f"Analyst recommended split for: {cluster_id}")
    # Conceptual: Run sub-clustering or increase HDBSCAN min_cluster_size locally

for merge_rec in recipe.get("merge_recommendations", []):
    cluster_id = merge_rec["cluster_id"]
    print(f"Analyst recommended merge for: {cluster_id}")
    # Conceptual: Merge with closest neighbor clusters documented in the recipe

# 5. Rerun the clustering pipeline externally
# df['new_cluster_id'] = rerun_clustering_pipeline(df)

# 6. Export new dataset and log refinement provenance
# save_refinement_run_metadata(
#     run_id="run-upstream-refinement-002",
#     source_refinement_id=recipe["refinement_id"],
#     source_review_ids=recipe["source_review_ids"],
#     source_reviews=recipe.get("source_reviews", [])
# )
```

---

## 4. Provenance and Sanitization Rules

To protect production environments and telemetry sources, the following rules apply:

* **No Restricted Raw Logs**: CasePackages must not contain raw unredacted logs, personal data (PII), credentials, API keys, or raw system events.
* **Approved / Synthetic / Sanitized Postures Only**: Packages must be explicitly classified with a valid `CasePackageSanitizationStatusV01` posture, for example:
  1. `synthetic`: Invented data for testing and demos.
  2. `sanitized`: Real data transformed to remove sensitive fields, using aggregated metrics or opaque summaries.
  3. `approved_internal`, `aggregate_only`, or `redacted`: Non-synthetic data postures permitted only for a specific approved review context, with approval metadata when runtime validation requires it.
* **No Unrestricted Copying**: Keep source telemetry within the authorized environment. Transfer only the approved `CasePackage` JSON.
* **Stable Opaque IDs**: Use stable, generated, opaque identifiers (e.g., `session-a8b9c2...`) rather than sensitive database primary keys or username values.
* **Claim-to-Evidence Traceability**: Every claim generated by the labeling tool must map to one or more `evidence_id`s when evidence exists. Claims should use `evidence_status: "linked"` for linked evidence or `evidence_status: "missing_evidence_declared"` only when the package explicitly declares that evidence is absent.
* **Reproducibility**: The `CasePackage` must preserve enough pipeline metadata (embedding model, clustering method, parameters, prompt hash) to allow the upstream pipeline run to be reproduced or traced back to its specific execution history.

---

## 5. Non-Goals

The following functions are out of scope for the Telemetry Court adapter boundary and must not be implemented:

* **No Toponymy, DataMapPlot, UMAP, HDBSCAN, or ACME4 execution inside Telemetry Court**: These tools run exclusively upstream.
* **No Live Dataset Ingestion or Raw Access**: Telemetry Court will not query live databases or retrieve raw logs.
* **No Backend, Database Persistence, or Auth**: Review Result storage and evaluation aggregation remain local/file-based for the current architecture.
* **No Fabricated Pilot Data or Public Real-Data Fixtures**: All local test fixtures must remain synthetic.
* **No Runtime UI Changes**: This specification does not introduce new UI elements, layouts, or interactive components to the application.
