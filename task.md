Use these as separate Gemini prompts for each page. I’m keeping the design language consistent with your app: dark neutral UI, amber accent, clean spacing, modern dashboard feel, responsive layout, and no generic boilerplate.

1. Task Management Overview Prompt

Create a modern Task Management Overview page for a manager dashboard. The page should look premium, dark themed, and production-ready for a web app.

Design requirements:
- Use a dark dashboard style with neutral backgrounds, subtle borders, and amber accent color.
- Include a top summary area with 4 compact stat cards: Total Tasks, Pending, In Progress, Completed.
- Add a workload snapshot section showing team load balance and overdue task count.
- Add a recent activity feed for task updates.
- Include a quick actions area with buttons for Create Task, Smart Assign, Generate Insights, and View Templates.
- Keep layout responsive for desktop and mobile.
- Make it feel like a real enterprise dashboard, not a generic template.

Output needed:
- Page structure
- Section layout
- Visual hierarchy
- Spacing and card style
- Suggested component breakdown

2. Tasks List Page Prompt

Create a Task List page for a manager dashboard showing all tasks in a clean, data-heavy interface.

Design requirements:
- Dark theme with strong table/card hierarchy.
- Include search, filter, sort, and status chips.
- Filters should include status, priority, assignee, and due date.
- Show tasks in a table or dense list with columns for title, assignee, priority, status, due date, effort, and actions.
- Add action buttons for View, Edit, Delete, and Assign.
- Include pagination and empty state.
- Make it highly usable for managing many tasks.
- Keep it responsive and readable.

Output needed:
- Table/list layout
- Filter bar layout
- Row action design
- Empty/loading state design
- Mobile adaptation

3. Create and Assign Task Page Prompt

Create a Create Task and Assign Task page for a manager dashboard. This should feel like a focused workflow screen.

Design requirements:
- Use a split layout or step-based flow.
- Left side: task creation form with title, description, effort, priority, due date, mandatory toggle.
- Right side: assignment panel with employee list, workload preview, and smart assign suggestion.
- Include a Smart Assign button that highlights AI-recommended employee.
- Show helper text for each field.
- Use a dark UI with amber primary buttons and subtle green/red status hints.
- Make the email and task data areas very clear and professional.
- Support both manual assignment and AI-assisted assignment.

Output needed:
- Form layout
- Assignment panel layout
- Smart assign interaction design
- Validation and error state design
- Responsive behavior

4. AI Task Assistant Page Prompt

Create an AI Assistant page for task management in a manager dashboard. This page should showcase AI features clearly and professionally.

Design requirements:
- Dark modern dashboard with a strong AI-focused visual identity.
- Include 5 AI feature cards:
  - Smart Task Assignment
  - Task Priority Suggestion
  - Deadline Suggestion
  - Performance Insights
  - Task Breakdown
- Each card should have a short explanation and an action button.
- Add a preview panel where AI output is displayed in a clean structured format.
- Include a prompt input or task input form on the left side.
- Add a result panel on the right side with recommendation details.
- Make it feel intelligent but practical, not flashy or gimmicky.
- Keep the layout responsive.

Output needed:
- Page layout
- AI cards design
- Result preview panel
- Action workflow
- Suggested component structure

5. Performance Insights Page Prompt

Create a Performance Insights page for a manager dashboard that turns task and employee data into clear recommendations.

Design requirements:
- Dark analytics dashboard style.
- Include charts or visual blocks for task completion trends, overdue tasks, workload spread, and employee performance.
- Add an insights section with readable recommendation cards such as:
  - Team overloaded
  - Employee underutilized
  - High priority tasks delayed
  - Top performers by task type
- Show AI-generated recommendations in a polished report style.
- Include date range filters and department filters.
- Use amber for emphasis and green/red for positive/negative signals.
- Keep it clean, data-rich, and executive-friendly.

Output needed:
- Analytics layout
- Chart placement
- Insight card design
- Filter bar design
- Responsive behavior

6. Task Templates Page Prompt

Create a Task Templates page for a manager dashboard where managers can reuse common task structures.

Design requirements:
- Dark dashboard UI with a template gallery or list.
- Each template card should show title, category, default effort, common assignee type, and a short description.
- Include actions for Use Template, Edit Template, Delete Template, and Generate with AI.
- Add a Create Template button in the top right.
- Include a section for AI-generated task breakdown templates.
- Make the page feel organized, reusable, and efficient.
- Responsive layout is required.

Output needed:
- Template gallery/list layout
- Card design
- Top action bar
- Empty state
- Mobile version

7. Employee Dashboard Prompt

Create an Employee Dashboard page for employees to view and manage their assigned tasks.

Design requirements:
- Dark themed employee-focused dashboard.
- Top summary cards for Assigned Tasks, In Progress, Completed, Overdue.
- Main task list with status, due date, priority, and action buttons.
- Add a personal workload card and task progress chart.
- Include a “Today’s Tasks” or “Priority Tasks” section.
- Include task detail drawer or modal design.
- Make it simple, clear, and motivating for the employee.
- Keep it mobile friendly.

Output needed:
- Dashboard layout
- Task list design
- Progress visuals
- Task detail view
- Responsive structure

Recommended flow:
1. Generate the Manager Task Management pages first.
2. Then generate the Employee Dashboard.
3. After that, ask Gemini to create matching React component structure for each page.

If you want, I can next give you:
1. one master Gemini prompt for the entire Task module, or
2. separate prompts written specifically for React component generation instead of design mockups.













<!-- ------------------ Main Idea --------------------- -->
I’m checking the current task and AI surfaces so I can map your requested features onto the existing dashboard structure and tell you whether one tab or multiple tabs is the better fit.

Read [](file:///d%3A/web_projects/smart-employee-pulse/backend/routes/tasks.js)

Read [](file:///d%3A/web_projects/smart-employee-pulse/wellbeing-frontend/src/pages/ManagerDashboardPage.tsx)

Read [](file:///d%3A/web_projects/smart-employee-pulse/backend/controllers/taskController.js#1-1), lines 1 to 260

Read [](file:///d%3A/web_projects/smart-employee-pulse/backend/routes/ai.js)

Read [](file:///d%3A/web_projects/smart-employee-pulse/backend/services/aiService.js#1-1), lines 1 to 260

I’ve confirmed the backend already has task and AI routes, while the frontend still shows a placeholder Tasks tab. I’m checking the sidebar and existing dashboard patterns so I can recommend the cleanest tab structure.

Read [](file:///d%3A/web_projects/smart-employee-pulse/wellbeing-frontend/src/components/navigation/ManagerSidebar.tsx)

Searched for files matching `smart-employee-pulse` · `wellbeing-frontend/src/components/dashboard/tasks/**/*`, no matches

Searched for files matching `smart-employee-pulse` · `backend/controllers/*task*`, 1 match

Searched for files matching `smart-employee-pulse` · `backend/models/Task.js`, 1 match

I’ve confirmed there is no task frontend yet, and the sidebar already assumes multiple task-related pages. I’m reading the task model and the rest of the controller so the recommended structure matches the actual data shape and backend behavior.

Read [](file:///d%3A/web_projects/smart-employee-pulse/backend/controllers/taskController.js#260-260), lines 260 to 459

Read [](file:///d%3A/web_projects/smart-employee-pulse/backend/models/Task.js)

Read [](file:///d%3A/web_projects/smart-employee-pulse/backend/services/aiSuggestionService.js)

Read [](file:///d%3A/web_projects/smart-employee-pulse/backend/services/workloadService.js)

**Recommendation**

Use one main Tasks module in the manager dashboard, but split it into multiple internal tabs or subroutes. Do not put all of this into one giant screen.

Best structure:
- Tasks Overview
- Create / Assign Task
- AI Assistant
- Insights / Analytics
- Templates / Breakdown

This fits your current sidebar design because ManagerSidebar.tsx already treats Tasks as one top-level area with subitems. It also matches the current dashboard shell in ManagerDashboardPage.tsx, where the Tasks route is still a placeholder.

**Why multiple internal tabs is better**
- One tab is too crowded once you add AI, breakdowns, assignments, and insights.
- Separate internal tabs keep the manager flow clear and faster to use.
- It gives you room to grow into Employee Dashboard later without redesigning everything.

**How I would structure it**
- All Tasks: list, search, filter, status, due date, edit, delete
- Create / Assign: create task form, assign employee, smart assign toggle
- AI Assistant: priority suggestion, deadline suggestion, task breakdown, recommended assignee
- Insights: performance insights, workload balance, overdue tasks, team bottlenecks
- Templates: reusable task templates and AI-generated breakdowns

**What already exists in backend**
Your backend already has a good start:
- Task flow in taskController.js
- Task routes in tasks.js
- AI task routes in ai.js
- AI logic in aiService.js
- Simple workload suggestion logic in aiSuggestionService.js
- Workload calculation in workloadService.js
- Task schema in Task.js

So the main gap is not AI itself. The gap is the manager frontend and a few missing manager CRUD endpoints.

**Backend changes needed**
- Add manager task list with pagination and filters.
- Add update task endpoint.
- Add delete task endpoint.
- Add task detail endpoint for manager editing.
- Add task validation and service layer separation if you want it cleaner.
- Reuse the existing AI routes for suggestions instead of hardcoding AI inside every form.
- Add optional endpoints for:
  - smart assign
  - task priority suggestion
  - deadline suggestion
  - task breakdown
  - performance insights

**Frontend changes needed**
- Build a real Tasks page under the manager dashboard.
- Add a tab layout or subroute layout inside the Tasks section.
- Create components for:
  - TaskList
  - TaskForm
  - TaskAssignPanel
  - TaskAiAssistantPanel
  - TaskInsightsPanel
  - TaskTemplatePanel
- Add a task detail drawer or modal for quick edit.
- Add loading, error, empty, and success states.
- Connect the AI actions as optional helper buttons, not mandatory steps.

**Best way to use AI**
I would not make AI the only way to work with tasks. That would slow the manager down and make the workflow fragile.

Use AI as assistance:
- Smart Task Assignment button
- Suggest Priority button
- Suggest Deadline button
- Break Down Task button
- Generate Insights button

That gives you real value without blocking basic task management if AI fails or is disabled.

**Best extra features**
These would add more value than trying to do too much AI first:
- Task templates for repeated work
- Bulk task assignment
- Overdue alerts
- Status history / audit log
- Task comments or notes
- Attachment support
- Priority badges and SLA timers
- Employee workload preview before assignment
- Task dependency support for complex work

**Build order I recommend**
1. Task management shell in the manager dashboard
2. Task CRUD and list UI
3. Assign task flow
4. AI helper actions
5. Insights and analytics
6. Employee dashboard after task workflow is stable

**My recommendation in one line**
Build one Tasks module with multiple internal tabs, not separate top-level tabs.

If you want, next I can give you the exact page/component structure for the Tasks module and the backend endpoint list before we start implementation.