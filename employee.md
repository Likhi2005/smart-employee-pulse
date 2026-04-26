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