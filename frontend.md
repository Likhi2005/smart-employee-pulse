Updated memory file [](file:///c%3A/Users/lenovo/AppData/Roaming/Code/User/workspaceStorage/af84188eacfdde7dea228a194caf80bf/GitHub.copilot-chat/memory-tool/memories/ZWFmNzk0ZjQtNjk1Yi00Mzc1LThiN2YtM2Q0NmZlMmE5NGU3/workpulse_progress.md)

Perfect! Here's a **comprehensive component list** for the WorkPulse AI frontend:

---

# **FRONTEND COMPONENTS BREAKDOWN**

## **1. ATOMIC/CORE COMPONENTS** (Reusable Building Blocks)

### **Form Elements**

| Component | Purpose | Key Props | Usage |
|-----------|---------|-----------|-------|
| **Input** | Text, email, password fields | `type`, `label`, `placeholder`, `error`, `value`, `onChange` | Auth forms, task creation |
| **Button** | Primary, secondary, danger buttons | `variant`, `size`, `loading`, `disabled`, `onClick` | All CTAs |
| **Select** | Dropdown selector | `options`, `value`, `onChange`, `disabled`, `label` | Priority, department selection |
| **Checkbox** | Toggle option | `checked`, `onChange`, `label`, `disabled` | Mandatory task, terms |
| **Radio** | Single choice from group | `options`, `value`, `onChange`, `name` | Role selection, filters |
| **Textarea** | Multi-line text | `rows`, `placeholder`, `value`, `onChange`, `maxLength` | Task description, feedback |
| **DatePicker** | Calendar date selection | `value`, `onChange`, `minDate`, `disabled`, `format` | Due dates |
| **TimePicker** | Time selection | `value`, `onChange`, `format` | Deadline time |

---

### **Display Components**

| Component | Purpose | Key Props | Usage |
|-----------|---------|-----------|-------|
| **Card** | Container with shadow/border | `children`, `className`, `onClick`, `hoverEffect` | Dashboard cards, task cards |
| **Badge** | Small label/tag | `text`, `variant` (success/warning/danger), `icon` | Priority badges, status tags |
| **Avatar** | User profile picture | `src`, `name`, `size`, `onClick` | User avatars, leaderboard |
| **ProgressBar** | Visual progress indicator | `value`, `max`, `color`, `label`, `showLabel` | Workload progress |
| **ProgressRing** | Circular progress | `value`, `max`, `size`, `color` | Percentage indicators |
| **Chip** | Small interactive tag | `label`, `onRemove`, `icon`, `variant` | Employee tags, filters |
| **Divider** | Visual separator | `horizontal`, `text`, `className` | Section dividers |
| **Tag** | Non-removable label | `text`, `variant`, `icon` | Status, category tags |

---

### **Feedback Components**

| Component | Purpose | Key Props | Usage |
|-----------|---------|-----------|-------|
| **Toast** | Notification message | `type`, `message`, `duration`, `onClose` | Success/error messages |
| **Alert** | Warning/info/error box | `type`, `title`, `message`, `onClose`, `action` | Form validation, API errors |
| **Modal** | Dialog overlay | `open`, `onClose`, `title`, `children`, `size` | Confirmations, forms |
| **Tooltip** | Hover help text | `text`, `position`, `delay` | Help indicators |
| **LoadingSpinner** | Loading indicator | `size`, `color` | Data fetching |
| **Skeleton** | Loading placeholder | `width`, `height`, `count`, `circle` | Skeleton screens |
| **EmptyState** | No data message | `icon`, `title`, `subtitle`, `action` | Empty lists, no tasks |

---

### **Navigation Components**

| Component | Purpose | Key Props | Usage |
|-----------|---------|-----------|-------|
| **Navbar** | Top navigation bar | `user`, `onLogout`, `showNotifications` | Top of every page |
| **Sidebar** | Left menu navigation | `items`, `active`, `onSelect`, `collapsed` | Main nav menu |
| **Breadcrumb** | Page path indicator | `items`, `onClick` | Page hierarchy |
| **Tabs** | Tab switcher | `items`, `active`, `onChange` | Dashboard tabs, filters |
| **Pagination** | Page navigation | `current`, `total`, `onPage`, `pageSize` | Large lists |
| **DropdownMenu** | Contextual menu | `items`, `trigger`, `onSelect` | User menu, actions |

---

## **2. LAYOUT COMPONENTS**

| Component | Purpose | Key Props | Usage |
|-----------|---------|-----------|-------|
| **MainLayout** | Page wrapper with nav/sidebar | `children`, `hideSidebar` | All pages |
| **Container** | Content wrapper | `maxWidth`, `children` | Page content |
| **Grid** | Responsive grid layout | `cols`, `gap`, `children` | Dashboard cards |
| **Flex** | Flexbox wrapper | `direction`, `justify`, `align`, `gap`, `children` | Layout utility |
| **Section** | Page section wrapper | `title`, `subtitle`, `children`, `action` | Dashboard sections |
| **SidePanel** | Collapsible side panel | `title`, `open`, `onClose`, `children` | Filters, details |

---

## **3. AUTH COMPONENTS**

### **Pages**

| Component | Purpose | Integrations |
|-----------|---------|---|
| **LoginPage** | User login form | `useAuth`, `useNavigate`, API call |
| **RegisterCompanyPage** | Company registration | `useAuth`, `useNavigate`, API call |
| **ChangePasswordPage** | Password change form | `useAuth`, API call |
| **ForgotPasswordPage** | Password reset request | API call, email verification |

### **Sub-components**

| Component | Purpose | Key Props |
|-----------|---------|-----------|
| **LoginForm** | Email + password form | `onSubmit`, `loading`, `error` |
| **RegisterForm** | Company + manager details | `onSubmit`, `loading`, `error` |
| **PasswordStrengthMeter** | Password strength indicator | `password` |
| **OTPInput** | One-time password field | `length`, `value`, `onChange` |
| **SocialLoginButton** | OAuth login option | `provider`, `onClick` |

---

## **4. DASHBOARD COMPONENTS**

### **Manager Dashboard**

| Component | Purpose | Key Props | Data Source |
|-----------|---------|-----------|---|
| **ManagerDashboard** | Main manager page | `companyId` | Context |
| **WorkloadStatusGrid** | Team workload cards | `employees`, `onClick` | API: `/api/dashboard/manager` |
| **WorkloadCard** | Single employee workload | `employee`, `onClick` | Card - Shows name, workload, status |
| **QuickStatsPanel** | Task statistics | `stats` | Task counts |
| **AlertsPanel** | Workload alerts | `alerts` | Overload/underutilized warnings |
| **TaskFeedWidget** | Recent tasks list | `tasks` | Last 5 tasks |
| **TeamLeaderboardWidget** | Top performers preview | `leaderboard` | Top 5 employees |
| **ManagerActionBar** | Quick action buttons | `onCreateTask`, `onSmartAssign`, `onViewInsights` | 3 main CTAs |

### **Employee Dashboard**

| Component | Purpose | Key Props | Data Source |
|-----------|---------|-----------|---|
| **EmployeeDashboard** | Main employee page | `userId` | Context |
| **WorkloadStatus** | Personal workload display | `workload`, `threshold` | User data |
| **WorkloadProgressBar** | Workload progress visualization | `current`, `max` | Calculation |
| **MyTasksList** | Employee's tasks | `tasks`, `onTaskAction` | API: `/api/tasks/my-tasks` |
| **PerformanceCard** | Points, rank, stats | `performance` | Leaderboard data |
| **LeaderboardPreview** | Top 5 leaderboard | `leaderboard`, `userRank` | API: `/api/dashboard/employee` |

---

## **5. TASK COMPONENTS**

### **Task Management**

| Component | Purpose | Key Props |
|-----------|---------|-----------|
| **TaskList** | List of tasks (manager or employee) | `tasks`, `variant` ("manager"/"employee"), `onTaskAction` |
| **TaskCard** | Single task in list | `task`, `onAccept`, `onReject`, `onComplete`, `onView` |
| **TaskDetail** | Full task information | `taskId`, `onClose` |
| **TaskActions** | Accept/Reject/Complete buttons | `task`, `onAccept`, `onReject`, `onComplete` |
| **TaskFilters** | Filter by status, priority | `onFilterChange`, `activeFilters` |
| **TaskSort** | Sort options | `onSort`, `activeSort` |

### **Task Creation & Assignment**

| Component | Purpose | Key Props |
|-----------|---------|-----------|
| **CreateTaskModal** | Create new task form | `open`, `onClose`, `onSubmit`, `loading` |
| **CreateTaskForm** | Task form fields | `onSubmit`, `loading`, `error` |
| **PriorityDetectionToggle** | Enable AI priority detection | `enabled`, `onChange` |
| **PriorityDetectionResult** | Show AI-detected priority | `result` |
| **AssignTaskModal** | Assign task to employee | `open`, `onClose`, `taskId`, `onSubmit` |
| **SmartAssignModal** | AI-powered assignment with recommendations | `open`, `onClose`, `taskId`, `onAssign`, `loading` |
| **SmartAssignCard** | Top AI recommendation display | `recommendation` |
| **AlternativeAssignments** | Show alternative employees | `alternatives`, `onSelect` |

---

## **6. WORKLOAD COMPONENTS**

| Component | Purpose | Key Props |
|-----------|---------|-----------|
| **WorkloadChart** | Bar/line chart of team workload | `data`, `type`, `height` |
| **WorkloadDistribution** | Distribution analysis view | `distribution` |
| **WorkloadMetrics** | Stats: avg, min, max, stdDev | `metrics` |
| **WorkloadTimeline** | Workload trend over time | `timelineData` |
| **CapacityAssessment** | Can employee take more work? | `employee`, `taskEffort` |
| **WorkloadComparison** | Compare workloads between employees | `employees` |
| **UtilizationGauge** | Team utilization percentage | `utilization` |

---

## **7. AI COMPONENTS**

| Component | Purpose | Key Props |
|-----------|---------|-----------|
| **AIInsightsPanel** | Performance insights display | `insights` |
| **InsightCard** | Single insight | `title`, `description`, `recommendation`, `icon` |
| **TaskBreakdownModal** | AI-suggested task breakdown | `open`, `onClose`, `breakdown`, `onCreateSubtasks` |
| **SubtaskList** | List of AI-suggested subtasks | `subtasks` |
| **PriorityPredictionBadge** | Show AI-predicted priority | `priority`, `confidence` |
| **SkillMatchScore** | Employee → Task skill match | `score` |

---

## **8. LEADERBOARD COMPONENTS**

| Component | Purpose | Key Props |
|-----------|---------|-----------|
| **LeaderboardPage** | Full leaderboard page | None |
| **LeaderboardTable** | Ranked table of scores | `leaderboard`, `userRank` |
| **LeaderboardRow** | Single leaderboard entry | `rank`, `user`, `points`, `tasks`, `isCurrentUser` |
| **RankBadge** | Rank indicator (🥇🥈🥉) | `rank` |
| **PointsDisplay** | Points with trend | `points`, `change`, `trending` |
| **LeaderboardFilters** | Filter by period, department | `onFilter` |
| **AchievementBadges** | Unlock badges display | `achievements` |

---

## **9. NOTIFICATION COMPONENTS**

| Component | Purpose | Key Props |
|-----------|---------|-----------|
| **NotificationCenter** | List of all notifications | `notifications`, `onClear` |
| **NotificationItem** | Single notification | `notification`, `onRead`, `onDelete` |
| **NotificationBell** | Icon with unread count | `count`, `onClick` |
| **NotificationDropdown** | Dropdown menu of recent notifications | `notifications`, `onViewAll` |

---

## **10. USER MANAGEMENT COMPONENTS**

| Component | Purpose | Key Props |
|-----------|---------|-----------|
| **CreateEmployeeModal** | Manager creates employee | `open`, `onClose`, `onSubmit`, `loading` |
| **CreateEmployeeForm** | Employee details form | `onSubmit`, `loading` |
| **EmployeeList** | List of all company employees | `employees`, `onSelect`, `onDelete` |
| **EmployeeCard** | Employee card with actions | `employee`, `onEdit`, `onRemove`, `onClick` |
| **EmployeeDetailModal** | View/edit employee details | `open`, `onClose`, `employee`, `onSave` |
| **UserProfile** | Current user profile page | None |
| **UserProfileCard** | User info card | `user`, `onEdit` |
| **ChangePasswordModal** | Password change form | `open`, `onClose`, `onSubmit` |

---

## **11. SPECIALIZED COMPONENTS**

### **WorkPlay Zone (Mini-games)**

| Component | Purpose | Key Props |
|-----------|---------|-----------|
| **WorkPlayZone** | Games hub page | None |
| **GameCard** | Game option card | `game`, `bestScore`, `onClick` |
| **ReactionGame** | Reaction time game | `onComplete` |
| **QuizGame** | Quiz game | `onComplete` |
| **GameResults** | Show game score result | `score`, `points`, `onPlayAgain` |
| **GameLeaderboard** | High scores for single game | `gameId`, `scores` |

---

## **12. SETTINGS & ADMIN**

| Component | Purpose | Key Props |
|-----------|---------|-----------|
| **SettingsPage** | Settings hub | None |
| **DarkModeToggle** | Light/dark mode switcher | `enabled`, `onChange` |
| **LanguageSelector** | Language selection | `current`, `onChange` |
| **NotificationSettings** | Notification preferences | `settings`, `onSave` |
| **CompanySettings** | Company info management | `company`, `onSave` |
| **SecuritySettings** | Password, two-factor auth | None |

---

## **13. HOOKS (Custom React Hooks)**

| Hook | Purpose | Returns |
|------|---------|---------|
| **useAuth** | Authentication state & methods | `user`, `login`, `logout`, `register`, `isLoading` |
| **useTasks** | Tasks CRUD operations | `tasks`, `createTask`, `assignTask`, `completeTask`, `loading`, `error` |
| **useWorkload** | Workload calculations | `teamWorkload`, `myWorkload`, `distribution` |
| **useAI** | AI service calls | `detectPriority`, `smartAssign`, `getInsights`, `breakdownTask` |
| **useNotification** | Toast/alert notifications | `showToast`, `showAlert`, `dismissAll` |
| **useDarkMode** | Dark mode toggle | `isDark`, `toggle` |
| **usePagination** | Pagination logic | `page`, `nextPage`, `prevPage`, `goToPage` |
| **useDebounce** | Debounce hook for search | `debouncedValue` |
| **useFetch** | Generic data fetching | `data`, `loading`, `error`, `refetch` |
| **useLocalStorage** | Browser local storage | `value`, `setValue` |

---

## **14. CONTEXT (Global State)**

| Context | Purpose | Values |
|---------|---------|--------|
| **AuthContext** | User auth state | `user`, `token`, `role`, `companyId`, `login`, `logout` |
| **TaskContext** | Tasks state | `tasks`, `selectedTask`, `createTask`, `updateTask`, `deleteTask` |
| **NotificationContext** | Notifications state | `notifications`, `addNotification`, `removeNotification` |
| **WorkloadContext** | Workload calculations | `teamWorkload`, `myWorkload`, `updateWorkload` |
| **UIContext** | UI state (dark mode, etc) | `isDarkMode`, `sidebarOpen`, `toggleDarkMode` |

---

## **15. PAGES (Full Page Routes)**

| Page | Route | Auth Required | Role |
|------|-------|---|---|
| **LoginPage** | `/login` | ❌ | Public |
| **RegisterPage** | `/register` | ❌ | Public |
| **ChangePasswordPage** | `/change-password` | ✅ | New Employee |
| **ManagerDashboard** | `/dashboard` | ✅ | Manager |
| **EmployeeDashboard** | `/dashboard` | ✅ | Employee |
| **CreateTaskPage** | `/tasks/create` | ✅ | Manager |
| **TaskDetailPage** | `/tasks/:taskId` | ✅ | Both |
| **TaskListPage** | `/tasks` | ✅ | Both |
| **AssignTaskPage** | `/tasks/:taskId/assign` | ✅ | Manager |
| **WorkloadPage** | `/workload` | ✅ | Manager |
| **LeaderboardPage** | `/leaderboard` | ✅ | Both |
| **AIInsightsPage** | `/insights` | ✅ | Manager |
| **EmployeeListPage** | `/employees` | ✅ | Manager |
| **WorkPlayZonePage** | `/games` | ✅ | Both |
| **SettingsPage** | `/settings` | ✅ | Both |
| **ProfilePage** | `/profile` | ✅ | Both |
| **NotFoundPage** | `/404` | ❌ | All |

---

## **16. SERVICES (API Integration)**

| Service | Purpose | Key Methods |
|---------|---------|---|
| **authService** | Auth API calls | `login`, `register`, `logout`, `changePassword`, `getMe` |
| **taskService** | Task API calls | `createTask`, `assignTask`, `getTasks`, `getTaskDetail`, `completeTask`, `acceptTask`, `rejectTask` |
| **workloadService** | Workload API calls | `getMyWorkload`, `getTeamWorkload`, `getDistribution` |
| **aiService** | AI API calls | `detectPriority`, `smartAssign`, `getBreakdown`, `getInsights` |
| **dashboardService** | Dashboard API calls | `getManagerDashboard`, `getEmployeeDashboard` |
| **leaderboardService** | Leaderboard API calls | `getLeaderboard`, `getTopPerformers` |
| **userService** | User management API | `createEmployee`, `getEmployees`, `updateUser`, `deleteUser` |
| **api** | Axios instance | `get`, `post`, `put`, `delete` (with auth interceptor) |

---

## **COMPONENT COUNT SUMMARY**

```
Category                  Count
─────────────────────────────
Atomic/Core              ~20
Layout                   ~6
Auth                     ~8
Dashboard                ~10
Tasks                    ~14
Workload                 ~8
AI                       ~7
Leaderboard             ~7
Notifications           ~4
Users                   ~7
WorkPlay Zone           ~5
Settings                ~5
─────────────────────────────
TOTAL COMPONENTS:       ~102
```

---

## **FILE STRUCTURE**

```
wellbeing-frontend/src/
├── components/
│   ├── Atomic/
│   │   ├── Button.jsx
│   │   ├── Input.jsx
│   │   ├── Card.jsx
│   │   ├── Badge.jsx
│   │   ├── Modal.jsx
│   │   └── ... (20 components)
│   │
│   ├── Layout/
│   │   ├── Navbar.jsx
│   │   ├── Sidebar.jsx
│   │   ├── MainLayout.jsx
│   │   └── ... (6 components)
│   │
│   ├── Auth/
│   │   ├── LoginForm.jsx
│   │   ├── RegisterForm.jsx
│   │   ├── ChangePasswordForm.jsx
│   │   └── ... (8 components)
│   │
│   ├── Dashboard/
│   │   ├── ManagerDashboard/
│   │   ├── EmployeeDashboard/
│   │   └── ... (10 components)
│   │
│   ├── Tasks/
│   │   ├── TaskList.jsx
│   │   ├── TaskCard.jsx
│   │   ├── CreateTaskModal.jsx
│   │   ├── SmartAssignModal.jsx
│   │   └── ... (14 components)
│   │
│   ├── Workload/
│   ├── AI/
│   ├── Leaderboard/
│   ├── Notifications/
│   ├── Users/
│   ├── Games/
│   └── Settings/
│
├── pages/
│   ├── LoginPage.jsx
│   ├── RegisterPage.jsx
│   ├── DashboardPage.jsx
│   ├── TasksPage.jsx
│   ├── LeaderboardPage.jsx
│   └── ... (17 pages)
│
├── hooks/
│   ├── useAuth.js
│   ├── useTasks.js
│   ├── useWorkload.js
│   ├── useAI.js
│   └── ... (9 hooks)
│
├── context/
│   ├── AuthContext.jsx
│   ├── TaskContext.jsx
│   ├── NotificationContext.jsx
│   └── ... (5 contexts)
│
├── services/
│   ├── api.js
│   ├── authService.js
│   ├── taskService.js
│   ├── aiService.js
│   └── ... (7 services)
│
├── utils/
│   ├── constants.js
│   ├── formatters.js
│   ├── validators.js
│   └── helpers.js
│
├── styles/
│   ├── globals.css
│   ├── themes.css
│   └── animations.css
│
├── App.jsx
└── main.jsx
```

---

## **PRIORITY BUILD ORDER**

**Tier 1 (Must have first):**
- Button, Input, Card, Modal (Atomic)
- Navbar, Sidebar, MainLayout (Layout)
- LoginForm, RegisterForm (Auth)
- useAuth hook, AuthContext

**Tier 2 (Core features):**
- TaskCard, TaskList, TaskFilters
- ManagerDashboard, EmployeeDashboard
- WorkloadCard, WorkloadChart

**Tier 3 (Enhanced features):**
- SmartAssignModal, PriorityDetection
- AIInsightsPanel, Leaderboard

**Tier 4 (Polish):**
- Games, Settings, Notifications
- Dark mode, animations

---

## **READY TO START?**

Which component should we build first?

**Option A:** Start with **Atomic Components** (Button, Input, Card, Modal)  
**Option B:** Start with **Auth Pages** (Login, Register) - More visible  
**Option C:** Start with **Project Setup** (Vite, Tailwind, folder structure) first

I recommend **Option C → B → A** (setup → auth → atoms → pages)

Which would you prefer? 🚀