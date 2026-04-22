A FAANG-level employee dashboard should feel like a work command center, not a task list. It should answer 3 questions in under 5 seconds:

1. What needs my attention now?
2. What can block me later today?
3. How am I performing and improving?

**What It Should Have**
1. Priority Inbox
- Today’s must-do items ranked by SLA risk, business impact, and dependency criticality
- Clear labels: due soon, blocked, waiting review, at risk
- One-click actions: Accept, Start, Request help, Escalate

2. My Work Pipeline
- Kanban-style personal flow: Pending, In Progress, Review Pending, Done
- Task cards show effort, confidence, risk, blocker count, required skills
- Drag-and-drop with policy checks before state change

3. Smart Focus Panel
- “Best next task” recommendation with explainability
- Why this task now: deadline pressure, low context-switch cost, skill match
- “If skipped, likely impact” prediction

4. Blockers and Dependencies Console
- Dependency tree per task
- Blocked-by and blocking-others visibility
- Quick unblock actions: ping owner, request reassignment, propose split

5. Calendar + Capacity Strip
- Daily timeline with planned effort vs available focus hours
- Context-switch heatmap for the day
- Auto-suggested work plan (deep work blocks + meetings)

6. Performance and Growth
- Throughput trend, acceptance-to-completion time, quality score
- Skill utilization radar and skill-gap suggestions
- Coaching hints from completed task history

7. Collaboration and Signals
- Mentions, approvals pending, manager notes, peer comments
- Team pulse mini-view: teammates overloaded/available
- Smart notifications (important only, batched)

8. Wellbeing and Sustainability
- Workload stress indicator (healthy / elevated / critical)
- Overtime risk warnings
- Recommendations: defer low-impact tasks, request support

**FAANG-Level UI Structure (Desktop)**
1. Top Bar (sticky)
- Left: context selector (My Tasks / Team Context / Learning)
- Center: global search and command palette
- Right: notifications, profile, quick actions

2. Hero Decision Band (first fold)
- 3 cards: Next Best Action, Today SLA Risk, Capacity Status
- Big visual confidence + risk badges

3. Main 2-Column Workspace
- Left column (65%): My Work Pipeline + Task Detail Drawer
- Right column (35%): Focus Panel, Blockers Console, Notifications

4. Bottom Insight Row
- Performance trends, skill growth, workload forecast

**Mobile Structure**
1. First screen: Next Best Action + Today’s top 3 tasks
2. Tabbed navigation: Work, Blockers, Calendar, Insights
3. Swipe actions on task cards (start, pause, escalate, complete)
4. Sticky mini-capacity indicator at top

**Visual Language (Not Generic)**
1. Information-dense dark-neutral canvas with warm risk accents
2. Typography hierarchy focused on scan speed
3. Status colors tied to semantics:
- Red: urgent risk
- Amber: near-risk
- Cyan: dependency/waiting
- Green: healthy/progress
4. Motion:
- Staggered card reveal on load
- Subtle transition when task state changes
- No decorative animation noise

**Interaction Standards**
1. Every AI suggestion must include “Why” and “Override reason” support
2. Every state change must show policy validation result
3. Every high-risk alert must have an action button
4. Keyboard-first productivity:
- Quick open task
- Change state
- Add blocker
- Reassign/escalate

**Data Blocks for MVP v1**
1. My active tasks
2. Policy warnings
3. Ranked “next best task”
4. Dependency and blocker graph
5. Daily capacity estimation
6. Personal performance trend (last 30 days)

If you want, next I can give you a concrete screen-by-screen wireframe spec with exact component tree, spacing grid, and token-based color system so you can implement it directly in your frontend.



---------------------- Steps ---------------------
I’ll map your current frontend/dashboard structure first, then I’ll give a concrete Step 1 implementation slice you can execute immediately without breaking existing flows.

Searched for files matching `**/wellbeing-frontend/src/**/*{Dashboard,dashboard}*.{tsx,jsx}`, 1 match

Searched for files matching `**/wellbeing-frontend/src/**/*employee*.{tsx,jsx,ts}`, 5 matches

Searched for regex `tab=tasks|section=|employee|manager|/dashboard` (`**/wellbeing-frontend/src/**/*.{tsx,jsx,ts}`), 20 results

Perfect. We’ll build this in vertical slices so each step is usable and doesn’t break your current manager flow.

Current baseline in your repo:
1. Manager dashboard exists at ManagerDashboardPage.tsx.
2. Task intelligence components already exist under TaskCreatePage.tsx.
3. Employee task backend actions exist (`my-tasks`, `accept`, `reject`, `complete`) in tasks.js.

**Step-by-step implementation plan**
1. Step 1: Employee Dashboard Shell + Role Routing
- Add Employee layout and landing page.
- Add role-aware route guard so employee never sees manager shell by default.
- Add top-level sections: `Focus`, `Pipeline`, `Signals`, `Insights`.

2. Step 2: Real Task Inbox (from backend)
- Fetch `/tasks/my-tasks`.
- Show grouped lists: `Pending`, `In Progress`, `Review Pending`.
- Add quick actions: Accept, Reject, Complete (wired to existing APIs).

3. Step 3: Smart Focus Panel
- “Best Next Task” engine on frontend using due date, priority, effort, blocked flags.
- Explainability chips: “Why now”.
- CTA buttons to start/escalate.

4. Step 4: Blockers + Dependency Console
- Add blocker model and dependency references in task detail drawer.
- Actions: mark blocked, unblock request, ping owner.

5. Step 5: Signals and Insights
- Throughput trend, completion latency, overload indicator.
- Personal weekly scorecard + SLA risk warning strip.

6. Step 6: FAANG polish pass
- Keyboard shortcuts, command palette actions, skeleton loaders, retry patterns, empty/error states, mobile-first responsive tuning.

**Start now with Step 1 (implementation slice)**
Create these files first:
1. wellbeing-frontend/src/pages/EmployeeDashboardPage.tsx (new)
2. wellbeing-frontend/src/components/layouts/EmployeeLayout.tsx (new)
3. wellbeing-frontend/src/components/dashboard/employee/EmployeeDashboardShell.tsx (new)
4. Update router file (where manager routes are declared) to add employee dashboard route.

Step 1 UI structure:
1. Header band
- Greeting + current date
- Capacity badge (`Healthy`, `Elevated`, `Critical`)
- Global quick action (`Start Focus Session`)

2. 2-column body
- Left (65%): `My Pipeline` placeholder cards
- Right (35%): `Smart Focus`, `Signals`, `Notifications`

3. Mobile
- Stack cards with sticky tab switcher: `Focus | Pipeline | Signals | Insights`

Step 1 acceptance criteria:
1. Employee login lands on employee dashboard route.
2. Manager login still lands on manager dashboard unchanged.
3. Responsive shell works on desktop/mobile without overflow.
4. No API calls yet in Step 1 (structure-only, safe rollout).

If you want, next I’ll give exact drop-in code for Step 1 files and router wiring in one shot.