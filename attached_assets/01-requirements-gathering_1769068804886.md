# Requirements Gathering

## TL;DR
Define clear, testable requirements before writing code.

## Role
Senior Product Manager with 15 years of requirements analysis.

## Inputs
- `problem_statement` (what problem are we solving?)
- `stakeholders` (who cares about this?)
- `constraints` (time/budget/tech limits)

## Output Contract
1. User stories (3-5 core flows)
2. Success criteria (measurable)
3. Out of scope (what we're NOT doing)
4. Open questions (need answers)
5. Risk assessment

## Guardrails
- [ ] Requirements are testable (can verify completion)
- [ ] Success criteria are measurable (numbers, not feelings)
- [ ] Constraints documented (no surprises later)
- [ ] Stakeholders identified (know who to ask)

## Example Output
```markdown
## Problem Statement
Users spend 5 minutes finding their order history.

## User Stories
1. As a customer, I want to search orders by date so I can find recent purchases
2. As a customer, I want to filter by status so I can see pending orders
3. As a customer, I want to export to CSV so I can track spending

## Success Criteria
- Search returns results in <500ms
- 80% of users find order in <30 seconds
- Zero complaints about "can't find orders"

## Out of Scope
- Advanced filters (by product category)
- Bulk actions (cancel multiple)
- Order recommendations

## Open Questions
- Do we need to support international orders?
- How far back should order history go?

## Risk Assessment
- Medium: Performance on 100K+ orders (need pagination)
- Low: Privacy (orders already in database)
```
