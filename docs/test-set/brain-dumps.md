# Brain dumps for the test set

Real messages from the owner, typed the way they really type, each with what Taper should do with it.
These become the scored test cases described in `docs/handoff.md` (step 4).
Dates are worked out from the day the message was sent.

## 1. The week ahead

**Sent:** Friday 27 November 2026

> I want you to write down my to do list for this week I have a quiz on thursday i have a presentation with my two group members on monday and we have a meeting at 4 pm today on zoom, i also need to finish and submit my document for my project proposal for my thing by december 15th also remind me that on the 3rd registration for next semester opens

**Should produce five things, all on one school tree (planted if missing):**

| What | Kind | When | Details to keep |
|---|---|---|---|
| Quiz | Task (prepare for it) | Thursday 3 December | |
| Group presentation | Task | Monday 30 November | With two group members |
| Group meeting | Event | Today, 27 November, 4 pm | On Zoom; likely the same group as the presentation |
| Finish and submit the project proposal document | Task, big | By 15 December | "my thing" is vague: worth one gentle question about which project |
| Registration for next semester opens | Reminder only, not a task | 3 December | Should not count as something to finish |

**Should not:** drop any of the five, merge the meeting into the presentation, treat the registration as a task, or ask more than one question.

**Notes:** the quiz and registration land on the same day. The phrase "for my thing" is the kind of detail that gets lost.
