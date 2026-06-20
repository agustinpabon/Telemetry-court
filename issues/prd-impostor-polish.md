# PRD: Impostor Decision Polish

Status: complete

## Problem Statement

The ranked impostor comparison is structurally clearer than the former orbit, but it still feels denser and less intentional than the adjacent Label Duel step. A direct visit with no label winner also presents missing state as ordinary decision context, which breaks workflow trust.

## Solution

Polish the existing ranked comparison without changing its model: inherit the Label Duel winner on the happy path, guard the missing-label path, compress each session into a scannable comparison row, make the full row interactive, strengthen metric contrast, and use the sticky detail panel and footer to explain both the current strongest signal and the reviewer's recorded choice.

## User Stories

1. As a reviewer, I want to see the label I selected in Label Duel, so that the two steps feel continuous.
2. As a reviewer who reaches Impostor without a selected label, I want a clear recovery state, so that I do not mistake missing context for a valid review.
3. As a reviewer, I want all five sessions to be easy to scan, so that I can compare them without excessive scrolling.
4. As a reviewer, I want the whole session row to be clickable and keyboard accessible, so that selecting an option is effortless.
5. As a reviewer, I want outlier risk and cluster match to be visually comparable, so that the weakest fit is easy to reason about.
6. As a reviewer, I want the strongest current signal identified without preselection, so that guidance does not replace my judgment.
7. As a reviewer, I want the detail panel to explain the actual leading candidate before selection, so that the initial state is useful.
8. As a reviewer, I want immediate confirmation and verdict impact after selection, so that I trust the choice was recorded.
9. As a reviewer, I want the footer to restate my chosen session and outlier risk, so that I can confirm the decision before continuing.
10. As a mobile reviewer, I want the comparison and detail states to reflow without horizontal scrolling, so that the workflow remains usable on a narrow viewport.

## Implementation Decisions

- Preserve the descending outlier-risk ranking with lower cluster match as the tie-breaker.
- Treat the seeded strongest candidate as advisory presentation only; never preselect it.
- Guard a missing or invalid Label Duel winner with an explicit return path instead of rendering normal comparison content.
- Keep each session as one semantic button so pointer and keyboard behavior share the same interaction target.
- Use restrained neutral surfaces, the existing olive focus token for selection, and semantic color only where it clarifies metrics or state.
- Keep the workflow's existing reducer and review schema unchanged.

## Testing Decisions

- Test observable component output through the rendered public interface.
- Cover the missing-label guard, inherited label context, ranked initial state, strongest-candidate guidance, selected footer confirmation, and alternate-choice warning.
- Reuse the server-rendered integration tests already used for Label Duel and Impostor behavior.
- Verify the complete route flow and responsive interaction in a real browser after automated checks.

## Out of Scope

- Changing session scores, evidence data, verdict logic, export schema, or the rest of the product.
- Auto-selecting the strongest candidate.
- Adding dependencies or a new visualization.

## Further Notes

This is a flagship workflow polish pass. Copy should remain plainspoken and uncertainty-preserving.
