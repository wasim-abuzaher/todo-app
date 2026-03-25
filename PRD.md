# Product Requirements Document — Todo App

## 1. Executive Summary

This product is a collaborative todo application that enables users to organize tasks into lists, enrich them with priorities, due dates, tags, and subtasks, and share lists with others for real-time collaboration. It targets individuals and small teams who need a clean, fast task management tool accessible from any device.

The core value proposition is combining rich personal productivity features (drag-and-drop reordering, full-text search, filtering) with frictionless collaboration (share via link, role-based access, live sync) — all in a modern, responsive web interface.

**MVP Goal:** Deliver a fully functional, authenticated todo application with rich task management features and real-time collaborative list sharing, deployed as a web app backed by Supabase.

---

## 2. Target Users

**Personal Productivity User**
- Manages daily tasks, projects, and checklists
- Wants quick capture, easy organization, and cross-device access
- Values keyboard shortcuts, fast interactions, and clean UI
- Pain points: existing tools are either too simple (no subtasks/tags) or too complex (project management overkill)

**Small Team Collaborator**
- Shares task lists with 2-5 people (roommates, small teams, family)
- Needs shared visibility into who's doing what
- Wants to share a list quickly via link without requiring the recipient to already have an account
- Pain points: coordinating via chat is messy, dedicated project tools are heavyweight

---

## 3. MVP Scope

### Core Functionality
- ✅ Create, edit, delete todo items
- ✅ Organize todos into named lists
- ✅ Mark todos complete/incomplete
- ✅ Set priority levels (low, medium, high)
- ✅ Assign due dates
- ✅ Add custom tags/labels to todos
- ✅ Create subtasks/checklists within a todo
- ✅ Drag-and-drop reorder todos within a list
- ✅ Full-text search across all todos (Cmd+K)
- ✅ Filter by status, priority, due date, and tags
- ✅ Sort by position, due date, priority, creation date, or title

### Authentication
- ✅ Email/password sign up and sign in
- ✅ OAuth sign in (Google, GitHub)
- ✅ Persistent sessions — access from any device
- ✅ Sign out

### Collaboration
- ✅ Share a list via generated link
- ✅ Role-based access: Viewer (read-only) and Editor (full CRUD)
- ✅ Real-time sync — collaborators see changes instantly
- ✅ Active collaborator presence indicators
- ✅ Accept invite flow (works for new and existing users)
- ✅ List owner can manage collaborators and revoke access

### UI/UX
- ✅ Responsive layout (desktop sidebar + mobile sheet navigation)
- ✅ Dark/light mode
- ✅ Toast notifications for actions and errors
- ✅ Inline editing for quick task capture
- ✅ Slide-in detail panel (Sheet) for editing full todo properties

### Data & Storage
- ✅ Supabase Postgres with row-level security
- ✅ Server-side full-text search index (tsvector)
- ✅ Auto-updating timestamps

### Out of Scope (Future)
- ❌ Native mobile apps (iOS/Android)
- ❌ Recurring/repeating todos
- ❌ File attachments on todos
- ❌ Comments/discussion on individual todos
- ❌ Todo assignment to specific collaborators
- ❌ Activity history / audit log
- ❌ Calendar view
- ❌ Notifications (email/push) for due dates or collaborator changes
- ❌ Offline support / PWA
- ❌ Import/export (CSV, JSON)
- ❌ Public (unauthenticated) list viewing

---

## 4. User Stories

1. **As a user, I want to sign up and sign in**, so that my todos are saved and accessible from any device.
   - *Example:* User signs up with email on their laptop, signs in on their phone, and sees all their lists.

2. **As a user, I want to create and organize todo lists**, so that I can group related tasks together.
   - *Example:* User creates lists named "Groceries", "Work Tasks", and "Weekend Projects".

3. **As a user, I want to quickly add a todo with just a title**, so that I can capture tasks without friction.
   - *Example:* User types "Buy milk" into the inline input at the top of the Groceries list and presses Enter.

4. **As a user, I want to enrich a todo with priority, due date, tags, and subtasks**, so that I can plan and track detailed work.
   - *Example:* User clicks a todo to open the detail panel, sets priority to High, due date to Friday, adds tag "urgent", and creates subtasks "Draft outline" and "Review with team".

5. **As a user, I want to drag and drop todos to reorder them**, so that I can prioritize visually.
   - *Example:* User grabs the drag handle on "Buy milk" and moves it above "Buy eggs".

6. **As a user, I want to search across all my todos**, so that I can quickly find a specific task.
   - *Example:* User presses Cmd+K, types "quarterly report", and sees matching todos across all lists.

7. **As a user, I want to share a list with someone via a link**, so that we can collaborate on tasks together.
   - *Example:* User opens the Share dialog on "Groceries", generates an Editor link, and texts it to their roommate. The roommate clicks the link, signs up, and can now add/complete items.

8. **As a list owner, I want to control who has access and what role they have**, so that I can protect my lists.
   - *Example:* User shares a "Meeting Notes" list as Viewer-only so colleagues can see but not modify the checklist.

---

## 5. Core Architecture & Patterns

### High-Level Architecture

```
Browser (React SPA)
  ↕ Supabase JS Client (PostgREST + Realtime WebSocket)
Supabase
  ├── Auth (email/password, OAuth)
  ├── Postgres (tables, RLS, functions, full-text search)
  └── Realtime (Postgres changes + Presence)
```

No custom backend server. The React app talks directly to Supabase via the JS client. Row-level security policies enforce authorization at the database level.

### State Management

| Concern | Solution |
|---|---|
| Server state (todos, lists, tags) | TanStack Query v5 — queries, mutations, optimistic updates |
| Authentication | React Context wrapping `supabase.auth.onAuthStateChange` |
| Filters & sort | URL search params via React Router `useSearchParams` |
| Real-time sync | Supabase Realtime → invalidate TanStack Query cache |
| Local UI (open panels, sidebar) | React `useState` |

### Key Patterns

- **Optimistic updates** for high-frequency mutations (toggle completion, reorder) — update cache immediately, rollback on error
- **Cache invalidation on Realtime** — Supabase channel events trigger `queryClient.invalidateQueries`, keeping the approach simple and consistent
- **Fractional/gapped integer positioning** for drag-and-drop — positions use integer gaps (1000, 2000, 3000); insert between by averaging; renormalize when gaps shrink below 1
- **SECURITY DEFINER functions** for operations that cross permission boundaries (e.g., accepting an invite before the user has list access)

### Directory Structure

```
src/
├── main.tsx, App.tsx, index.css, vite-env.d.ts
├── lib/          supabase.ts, utils.ts, constants.ts
├── types/        database.ts (generated), todo.ts, index.ts
├── hooks/        use-auth, use-todo-lists, use-todos, use-subtasks,
│                 use-tags, use-search, use-realtime, use-sharing, use-filters
├── providers/    auth-provider, query-provider, theme-provider
├── pages/        auth-page, dashboard-page, list-page, invite-page, not-found-page
└── components/
    ├── ui/       (shadcn/ui primitives)
    ├── layout/   app-layout, sidebar, header, mobile-nav
    ├── auth/     auth-form, auth-guard, user-menu
    ├── lists/    list-card, list-form, list-actions
    ├── todos/    todo-item, todo-form, todo-detail, todo-list,
    │             todo-filters, todo-sort, draggable-todo-list
    ├── subtasks/ subtask-item, subtask-list
    ├── tags/     tag-badge, tag-picker, tag-manager
    ├── sharing/  share-dialog, collaborator-list, accept-invite
    └── search/   search-command
```

---

## 6. Features

### 6.1 Todo CRUD
- **Create:** Inline input at top of list (title only), press Enter to submit. Detail panel for adding all properties.
- **Read:** Todos displayed as compact rows — checkbox, title, priority badge, tag badges, due date indicator, subtask count, drag handle.
- **Update:** Click todo title to open Sheet detail panel. Edit title, description, priority, due date, tags, subtasks inline.
- **Delete:** Via kebab dropdown menu on each todo. Confirmation dialog for destructive action.
- **Toggle complete:** Checkbox click. Optimistically updates UI. Sets `completed_at` timestamp.
- **Acceptance criteria:** All CRUD operations persist to Supabase, reflect immediately in UI, and survive page refresh.

### 6.2 List Management
- **Create:** "New List" button in sidebar opens dialog with name + optional description.
- **Rename/Edit:** Via list actions dropdown or inline edit in header.
- **Delete:** Via list actions dropdown with confirmation. Cascades to all todos, subtasks, tags, and shares.
- **Acceptance criteria:** Lists appear in sidebar navigation, clicking navigates to `/lists/:listId`.

### 6.3 Priority
- Three levels: Low (green), Medium (yellow), High (red).
- Set via Select dropdown in todo detail panel.
- Shown as colored Badge on todo item row.
- Filterable and sortable.

### 6.4 Due Dates
- Set via Calendar + Popover date picker in detail panel.
- Display on todo item row with color coding: gray (future), orange (within 2 days), red (overdue).
- Filterable: overdue, today, this week, no date.
- Sortable by due date.

### 6.5 Tags
- User-defined labels with custom colors, scoped per user.
- TagPicker in detail panel: searchable list via Command component, "Create new" inline.
- Many-to-many: a todo can have multiple tags, a tag can be on multiple todos.
- Shown as colored TagBadge chips on todo item row.
- Filterable by tag.

### 6.6 Subtasks
- Nested checklist items within a todo.
- Add/edit/delete/toggle in detail panel.
- Subtask completion count displayed on todo item row (e.g., "2/5").
- Ordered by position within the todo.

### 6.7 Drag-and-Drop Reorder
- Grip handle icon on each todo item row.
- Drag within a list to reorder.
- Optimistic reorder — UI updates immediately, positions persisted in batch.
- Uses @dnd-kit for accessible, performant drag-and-drop.
- Disabled for viewers on shared lists.

### 6.8 Search
- Global full-text search via Cmd+K (Ctrl+K on Windows/Linux).
- Command palette UI (shadcn Command component).
- Searches across title and description using Postgres tsvector index.
- Results grouped by list. Clicking a result navigates to the list and selects the todo.

### 6.9 Filtering & Sorting
- Filter bar below list header with dropdowns/toggles.
- Filters: status (all/active/completed), priority (low/medium/high), due (overdue/today/this-week/no-date), tag.
- Sort: manual position (default), due date, priority, created date, title (alphabetical).
- Filter/sort state stored in URL search params — shareable and bookmarkable.
- Applied client-side on fetched todo list.

### 6.10 Collaboration
- **Share dialog:** Owner opens from list actions/header. Generate link with role (viewer/editor). Copy to clipboard. Manage existing collaborators (change role, revoke).
- **Invite flow:** Recipient opens link → `/invite/:token`. If not logged in, shown auth form first. After auth, invite is accepted, `list_shares` row created, redirected to list.
- **Real-time sync:** All collaborators on a list see changes live via Supabase Realtime. Cache invalidation triggers automatic refetch.
- **Presence:** Active collaborators shown as avatar badges in the list header.
- **Permission UI:** Viewers see read-only UI — no add/edit/delete controls, no drag handles, no checkboxes.
- **Invite expiry:** Share links expire after 7 days by default.

---

## 7. Technology Stack

| Category | Technology | Version |
|---|---|---|
| Framework | React | 19.x |
| Build tool | Vite | 6.x |
| Language | TypeScript | 5.x |
| UI components | shadcn/ui (Radix UI) | latest |
| Styling | Tailwind CSS | 4.x (Vite plugin) |
| Backend/DB/Auth | Supabase (Postgres) | JS client v2.x |
| Data fetching | TanStack Query | 5.x |
| Routing | React Router | 7.x |
| Drag-and-drop | @dnd-kit/core + sortable | latest |
| Date utilities | date-fns | 4.x |
| Icons | lucide-react | latest |
| Toasts | sonner | latest |
| Command palette | cmdk (via shadcn) | latest |
| Form validation | zod + react-hook-form | latest |

**Not using:** Redux/Zustand (TanStack Query suffices), Axios (Supabase client handles API), CSS-in-JS (Tailwind covers styling), separate Postgres client (Supabase JS talks to PostgREST).

---

## 8. UI/UX Specification

### Key Screens

**Auth Page (`/auth`)**
- Centered card with tabs: "Sign In" / "Sign Up"
- Email + password fields, submit button
- OAuth buttons (Google, GitHub) below a divider
- Redirects to dashboard on success

**Dashboard (`/`)**
- Sidebar: list navigation (scrollable), "New List" button, user menu at bottom
- Main area: grid of list cards showing name, description preview, todo count, shared indicator
- Responsive: sidebar collapses to Sheet on mobile

**List View (`/lists/:listId`)**
- Header: list name (editable), filter/sort controls, share button, collaborator avatars
- Inline "Add a todo" input at top
- Todo list with compact rows, drag handles
- Clicking a todo opens Sheet detail panel from right (does not navigate away)

**Invite Page (`/invite/:token`)**
- If unauthenticated: auth form with context ("Sign in to accept this invite")
- If authenticated: list preview, role info, accept/decline buttons

### Interaction Patterns

- **Inline creation:** Type title + Enter for instant todo creation
- **Sheet detail panel:** Slide-in from right for editing full properties — list stays visible behind
- **Cmd+K search:** Global keyboard shortcut opens command palette overlay
- **Optimistic feedback:** Toggle/reorder happen instantly; errors show toast and rollback
- **Toast notifications:** Success/error feedback for all mutations via sonner

### Responsive Design
- Desktop: persistent sidebar (240px) + main content
- Tablet: collapsible sidebar
- Mobile: sidebar hidden, accessible via hamburger → Sheet overlay; todo detail is full-screen Sheet

### Accessibility
- shadcn/ui (Radix UI) provides WCAG-compliant keyboard navigation, focus management, and ARIA attributes out of the box
- @dnd-kit provides keyboard-accessible drag-and-drop
- Color is never the sole indicator — priority and due date also use text labels/icons
- Dark/light mode via CSS variables

---

## 9. Data Model

### Entities

**TodoList**
| Field | Type | Notes |
|---|---|---|
| id | UUID | PK, auto-generated |
| owner_id | UUID | FK → auth.users |
| name | TEXT | Required |
| description | TEXT | Optional |
| position | INTEGER | For ordering lists in sidebar |
| created_at | TIMESTAMPTZ | Auto |
| updated_at | TIMESTAMPTZ | Auto (trigger) |

**Todo**
| Field | Type | Notes |
|---|---|---|
| id | UUID | PK |
| list_id | UUID | FK → todo_lists (CASCADE) |
| created_by | UUID | FK → auth.users |
| title | TEXT | Required |
| description | TEXT | Optional |
| completed | BOOLEAN | Default false |
| completed_at | TIMESTAMPTZ | Set when completed |
| priority | TEXT | 'low' / 'medium' / 'high' |
| due_date | DATE | Optional |
| position | INTEGER | For drag-and-drop order |
| fts | TSVECTOR | Generated from title + description |
| created_at | TIMESTAMPTZ | Auto |
| updated_at | TIMESTAMPTZ | Auto (trigger) |

**Subtask**
| Field | Type | Notes |
|---|---|---|
| id | UUID | PK |
| todo_id | UUID | FK → todos (CASCADE) |
| title | TEXT | Required |
| completed | BOOLEAN | Default false |
| position | INTEGER | Order within todo |
| created_at | TIMESTAMPTZ | Auto |

**Tag**
| Field | Type | Notes |
|---|---|---|
| id | UUID | PK |
| owner_id | UUID | FK → auth.users |
| name | TEXT | UNIQUE per owner |
| color | TEXT | Hex color, default #6b7280 |
| created_at | TIMESTAMPTZ | Auto |

**TodoTag** (join table)
| Field | Type | Notes |
|---|---|---|
| todo_id | UUID | FK → todos (CASCADE) |
| tag_id | UUID | FK → tags (CASCADE) |
| | | Composite PK |

**ListShare**
| Field | Type | Notes |
|---|---|---|
| id | UUID | PK |
| list_id | UUID | FK → todo_lists (CASCADE) |
| shared_with | UUID | FK → auth.users |
| role | TEXT | 'viewer' / 'editor' |
| created_at | TIMESTAMPTZ | Auto |
| | | UNIQUE(list_id, shared_with) |

**ShareInvite**
| Field | Type | Notes |
|---|---|---|
| id | UUID | PK |
| list_id | UUID | FK → todo_lists (CASCADE) |
| token | TEXT | UNIQUE, random 32-byte hex |
| role | TEXT | 'viewer' / 'editor' |
| created_by | UUID | FK → auth.users |
| expires_at | TIMESTAMPTZ | Default now() + 7 days |
| created_at | TIMESTAMPTZ | Auto |

### Row-Level Security

Access is determined by two helper functions:
- `has_list_access(list_id, user_id)` — true if user owns the list OR has a `list_shares` row
- `has_editor_access(list_id, user_id)` — true if user owns the list OR has a `list_shares` row with `role = 'editor'`

Every table has RLS enabled. SELECT uses `has_list_access`. INSERT/UPDATE/DELETE use `has_editor_access` (except `todo_lists` and `list_shares` which only the owner can modify).

---

## 10. Success Criteria

### MVP Definition
The MVP is complete when a user can sign up, manage rich todos across multiple lists, and share lists with collaborators who see changes in real-time.

### Functional Requirements
- ✅ User can sign up, sign in (email + OAuth), and sign out
- ✅ User can create, rename, and delete todo lists
- ✅ User can create, edit, delete, and toggle todos
- ✅ User can set priority, due date, tags, and subtasks on a todo
- ✅ User can drag-and-drop reorder todos
- ✅ User can search todos globally via Cmd+K
- ✅ User can filter and sort todos by status, priority, due date, tag
- ✅ User can share a list via link with viewer or editor role
- ✅ Collaborators see changes in real-time
- ✅ Viewers cannot modify shared list content
- ✅ RLS enforces permissions at the database level regardless of UI state

### Quality Indicators
- UI responds to interactions within 100ms (optimistic updates)
- Real-time sync delivers changes within 1-2 seconds
- App works on latest Chrome, Firefox, Safari, and Edge
- Fully responsive from 320px (mobile) to 1920px+ (desktop)
- No data loss — all mutations persist to Supabase Postgres

### Performance Targets
- Initial page load (after auth): < 2s on 3G
- Todo toggle/reorder: < 100ms perceived (optimistic)
- Search results: < 500ms
- Vite dev server HMR: < 200ms

---

## 11. Implementation Phases

### Phase 1: Project Setup
**Goal:** Working dev environment with full tooling configured.

- ✅ TypeScript configuration (tsconfig files)
- ✅ Tailwind CSS v4 via Vite plugin
- ✅ shadcn/ui initialized with core components
- ✅ React Router v7 with route stubs
- ✅ Supabase client configured with env vars
- ✅ TanStack Query provider wired
- ✅ Path alias (`@` → `src/`)
- ✅ Database migration files created

**Validation:** `npm run dev` serves a styled page. Routes navigate. Supabase client instantiates without errors.

### Phase 2: Auth + Core CRUD
**Goal:** Authenticated users can manage lists and todos.

- ✅ Auth provider with session management
- ✅ Sign up / sign in page (email + OAuth)
- ✅ Auth guard protecting app routes
- ✅ App layout with sidebar navigation
- ✅ List CRUD (create, rename, delete)
- ✅ Todo CRUD (create, edit, delete, toggle)
- ✅ Generated Supabase types + domain types

**Validation:** Full sign-up → create list → add/edit/toggle/delete todos → sign out → sign in → data persists.

### Phase 3: Rich Features
**Goal:** Full productivity feature set.

- ✅ Priority levels with colored badges
- ✅ Due date picker with color-coded indicators
- ✅ Tags (create, assign, display, filter)
- ✅ Subtasks with completion tracking
- ✅ Drag-and-drop reorder with @dnd-kit
- ✅ Cmd+K global search
- ✅ Filter bar (status, priority, due date, tag)
- ✅ Sort options (position, due date, priority, date, title)

**Validation:** Each feature works independently and in combination. Filters persist in URL. Drag-and-drop positions persist after refresh.

### Phase 4: Collaboration
**Goal:** Shared lists with roles and real-time sync.

- ✅ Share dialog with link generation and role selection
- ✅ Invite acceptance page and flow
- ✅ Real-time sync via Supabase Realtime
- ✅ Presence indicators for active collaborators
- ✅ Permission-aware UI (viewer restrictions)
- ✅ RLS policies enforced and tested
- ✅ Dark/light mode theme

**Validation:** Share list → accept in second browser → both users edit → changes sync live → viewer cannot modify.

---

## 11.5 Phase 5: Collaborator Visibility & Access Management

**Goal:** List owners can see who a list is shared with (by email) and revoke access.

### Requirements
- Share dialog shows collaborator **email addresses** (not UUIDs)
- Owner can **change a collaborator's role** (viewer ↔ editor)
- Owner can **remove a collaborator** to revoke access
- Email resolution uses a `SECURITY DEFINER` RPC function joining `list_shares` with `auth.users` — no schema changes to `list_shares`

### Implementation
- New migration: `get_list_collaborators(p_list_id)` function returns shares enriched with email
- `useListShares` hook calls the RPC instead of querying the table directly
- `CollaboratorList` component displays email and meaningful avatar initials
- Existing `useUpdateShareRole` and `useRemoveCollaborator` mutations remain unchanged

**Validation:** Open share dialog → see collaborator emails → change role → remove collaborator → verify access revoked.

---

## 12. Future Considerations

### Post-MVP Enhancements
- **Recurring todos** — daily/weekly/monthly repeats with auto-creation
- **Todo assignment** — assign individual todos to collaborators
- **Comments** — discussion threads on individual todos
- **Activity log** — audit trail of who changed what and when
- **Notifications** — email/push alerts for due dates, collaborator changes, and mentions

### Potential Integrations
- **Calendar sync** — export due dates to Google Calendar / iCal
- **Slack/Discord** — bot notifications for list activity
- **Import/Export** — CSV, JSON, Todoist/Trello import

### Advanced Features
- **Calendar view** — visualize todos by due date on a calendar
- **Offline support** — PWA with service worker, sync on reconnect
- **Mobile apps** — React Native or Capacitor wrappers
- **Templates** — reusable list templates (e.g., "Weekly Groceries")
- **Smart lists** — auto-generated views (all overdue, today's tasks, high priority across lists)

---

## 13. Risks & Mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| **RLS policy bugs** allow unauthorized data access | High | Write integration tests against Supabase with multiple user roles. Manually verify each policy. RLS is the last line of defense regardless of UI bugs. |
| **Real-time sync conflicts** when two users edit the same todo simultaneously | Medium | Last-write-wins at the field level (Postgres UPDATE). TanStack Query refetch on Realtime event ensures both clients converge. No CRDT complexity needed for MVP. |
| **Supabase free tier limits** (500MB DB, 50K monthly active users, 2GB bandwidth) | Low | Sufficient for MVP and early growth. Monitor usage. Upgrade to Pro ($25/mo) when approaching limits. |
| **shadcn/ui + Tailwind v4 compatibility** — Tailwind v4 is new and shadcn may have edge cases | Medium | Pin known-good versions. Test shadcn component installation early in Phase 1. Fall back to Tailwind v3 if critical issues arise. |
| **Drag-and-drop position drift** — integer positions can collide with heavy reordering | Low | Use gapped integers (increments of 1000). Renormalize positions in a batch update when gaps shrink below 1. This is a well-known solved pattern. |

---

## Assumptions

- The user will create a Supabase project and configure OAuth providers (Google, GitHub) in the Supabase dashboard manually.
- The app will be deployed as a static SPA (e.g., Vercel, Netlify) — no SSR required.
- The initial target is modern evergreen browsers; no IE11 support.
- English-only for MVP; no internationalization.
