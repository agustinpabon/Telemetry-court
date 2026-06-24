# Issue: Interactive UI Split & Merge Recommendations

Type: AFK
Status: active
Priority: p1
Milestone: Milestone 4

## Validation outcome
Introduces interactive visual buttons next to neighbor boundaries and candidate labels in the UI. This allows human reviewers to record explicit split or merge recommendations for the cluster, which are then exported as `split_recommendations` and `merge_recommendations` in the refinement recipe.

## Why this matters
Deciding whether a cluster is too broad or mixed in Python requires manually looking at distance metrics and guessing. Visual buttons in the UI let analysts capture their human intuition about cluster shape immediately and pass it back to Python.

## Contract impact
- **CasePackage**: No impact.
- **ReviewResult**: Captures and maps the recommendations into the `split_recommendations` and `merge_recommendations` arrays in the exported [ReviewResultV01](file:///Users/agus/Documents/Telemetry%20court/lib/reviewResultV01.ts#L32).
- **EvaluationReport**: Aggregates these recommendations across reviewers to highlight cluster purity issues.

## Scope

### In scope
- Modify `components/arena/LabelDuelPanel.tsx` and `components/arena/VerdictPanel.tsx` to display split and merge controls.
- When UMAP neighbor clusters are shown, add a "Propose Merge" button that references the neighbor's cluster ID.
- Add a "Propose Split" button with options to specify which sub-behaviors or sessions should be separated.
- Save these inputs in the component's review state and map them during JSON export.

### Out of scope
- Automatically splitting or merging the clusters inside the Next.js frontend (these are recommendations for the upstream Python environment).

## Evidence and provenance impact
Preserves analyst feedback about topology boundary errors, linking them to specific case IDs.

## Acceptance criteria
- [ ] Visual split/merge controls are present next to the candidate label duel and neighborhood listings.
- [ ] Reviewers can select a target neighbor cluster for a merge recommendation.
- [ ] The split recommendation allows describing the target split boundary.
- [ ] The exported `ReviewResult` JSON includes these selections in the `split_recommendations` and `merge_recommendations` schema fields.
- [ ] Layout renders correctly on both mobile and desktop.

## Required checks
- [ ] `npm test`
- [ ] `npm run lint`
- [ ] `npm run build`

## Work type
- [x] `AFK`
- [ ] `human-in-the-loop`

## Blocked by
None.
