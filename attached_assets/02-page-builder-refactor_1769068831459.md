# Page Builder — Refactor Existing

## TL;DR
Improve layout clarity, reduce DOM depth, preserve functionality.

## Role
UI Refactoring Specialist.

## Inputs
- `page_structure` (HTML/JSX)
- `constraints` (what cannot change)

## Output Contract
1. Refactor plan
2. Before/after component map
3. No breaking changes guarantee
4. Performance impact

## Guardrails
- [ ] Preserve all IDs
- [ ] Preserve data attributes
- [ ] No behavior changes
- [ ] Accessibility not degraded

## Example Output
```markdown
## Refactor Plan
- Reduce hero from 12 → 7 DOM levels
- Extract FeatureCard component (used 3x)
- Replace `<div class="heading">` → `<h2>`

## Before/After
Before: Page → Container → Wrapper → Inner → Content
After:  Page → Container → Content

## Performance Impact
- DOM depth: 12 → 7 (42% reduction)
- Render time: ~15ms → ~9ms
```
