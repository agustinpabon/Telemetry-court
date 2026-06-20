# Polish the Impostor decision interface

Type: AFK
Status: complete

## Parent

`issues/prd-impostor-polish.md`

## What to build

Deliver one complete Impostor workflow refinement that preserves the ranked five-session comparison while fixing Label Duel continuity, reducing comparison density, making each row a strong interaction target, strengthening metric legibility, expanding decision guidance, and confirming the selected session before the verdict.

## Acceptance criteria

- [x] The happy path shows the selected Label Duel winner and uses “Review status” and “Fit check” language.
- [x] A missing or invalid label winner produces a guarded recovery state and blocks impostor selection and continuation.
- [x] Five sessions remain ordered by outlier risk and fit into a lighter, more scannable ranked list.
- [x] Every session row is fully clickable, keyboard accessible, and has clear default, hover, focus, recommended, and selected states.
- [x] The strongest option uses a subtle “Strongest signal” treatment and is never preselected.
- [x] Outlier-risk and cluster-match metrics use consistent, higher-contrast bars and labels.
- [x] The initial sticky panel names the current strongest candidate and explains the decision criteria.
- [x] The selected panel explains verdict impact and warns neutrally when another option has stronger evidence.
- [x] The selected footer names the session and its outlier risk before enabling continuation.
- [x] Desktop and mobile layouts have no horizontal overflow or excessive empty space.
- [x] Tests, typecheck, lint, build, detector, and browser workflow verification pass.

## Final polish addendum

- [x] Reduced visual weight across the hero, summary strip, ranked cards, and decision panel.
- [x] Made the strongest candidate treatment more intentional without auto-selection.
- [x] Clarified non-strongest selections in the right panel and footer.
- [x] Kept footer selection copy compact on desktop and intentionally wrapped on mobile.
- [x] Reverified desktop and mobile overflow, CTA state, and Label Duel continuity.
- [x] Removed desktop footer truncation, stabilized CTA alignment, widened the hero copy lane, and gave session metrics more room to scan.

## Blocked by

None - can start immediately.
