# CollabHub Project Architecture & Context

## Project Overview
CollabHub is an academic project collaboration platform connecting university students across campuses to discover projects, find teammates, share resources, and collaborate.

## Architecture

### Frontend (`client/`)
- **Stack**: React, Vite, Tailwind CSS, React Router v6.
- **Key Pages & Routes**:
  - `/projects`: Project feed with live search, status filtering, school/university filtering, tag filtering, and sorting (`Newest`, `Oldest`, `School (A-Z)`, `Most active`).
  - `/projects/:id`: Project details, dynamic owner info, team members, tech stack, discussion comments, and dynamic profile link (`/u/:userId`).
  - `/projects/new`: Project creation flow.
  - `/u/:userId`: User profile displaying name, school, year, major, bio, skills, GitHub link, and owned projects. Distinguishes own profile (`currentUser.id === userId`) vs public profile. Shows "Edit profile" only on own profile.
  - `/profile/edit`: Edit bio, school, year, major, skills, and GitHub URL.
  - `/resources`: Shared student learning resources with voting.
- **Components**:
  - `ProjectCard`: Feed card where author avatar/name click navigates directly to `/u/:userId`.
  - `SelectPill`: Reusable pill-styled select dropdown for filters and sorting.
  - `CollaborationRequestModal`: Modal dialog allowing authenticated students to request joining a project with role, message, skills tags, and portfolio URL.

### Backend (`Backend/`)
- **Stack**: Node.js, Express, Socket.io, PostgreSQL (`pg`).
- **Layered Structure**:
  - `routes/` -> `controllers/` -> `services/` -> `models/` -> `config/db.js`.
- **Database**:
  - PostgreSQL connection pool in `Backend/src/config/db.js` (`postgresql://postgres:123@localhost:5432/CollabHub`).
- **Key API Routes**:
  - `GET /api/projects/saved`: Get saved projects for current authenticated user.
  - `POST /api/projects/:id/save`: Save or toggle saved project for current user.
  - `DELETE /api/projects/:id/save`: Remove saved project for current user.
  - `GET /api/projects`: List projects with `owner_id`, `owner_name`, `owner_university`, `created_at`, `status`, `tech_tags`.
  - `GET /api/projects/:id`: Fetch single project by ID with owner metadata.
  - `POST /api/projects`: Create project (authenticated).
  - `POST /api/projects/:projectId/requests`: Submit a collaboration request.
  - `GET /api/projects/:projectId/requests/my-status`: Check current user's request status.
  - `GET /api/users/:id`: Public user profile by ID.
  - `GET /api/me`: Current authenticated user.
  - `PATCH /api/profile`: Update user profile.
  - `POST /api/login` & `POST /api/Createuser`: Auth endpoints.
  - `GET /api/notifications`: Get user notifications and unread count.
  - `PATCH /api/notifications/:id/read`: Mark notification as read.
  - `PATCH /api/notifications/read-all`: Mark all notifications as read.

## Database Schema (`CollabHub` on PostgreSQL)
- **`users`**: `id`, `full_name`, `email`, `password_hash`, `is_verified`, `university`, `year`, `major`, `bio`, `github_url`, `skills`, `created_at`, `updated_at`.
- **`projects`**: `id`, `owner_id`, `title`, `description`, `problem`, `status`, `tech_tags`, `github_url`, `created_at`, `updated_at`.
- **`saved_projects`**: `id`, `user_id`, `project_id`, `created_at`.
- **`notifications`**: `id`, `user_id`, `sender_id`, `project_id`, `type`, `title`, `message`, `link`, `is_read`, `created_at`.
- **`project_members`**: `id`, `project_id`, `user_id`, `role`, `joined_at`.
- **`collaboration_requests`**: `id`, `project_id`, `requester_id`, `message`, `preferred_role`, `skills`, `portfolio_url`, `status`, `created_at`.
- **`comments`**: `id`, `project_id`, `user_id`, `body`, `created_at`.
- **`messages`**: `id`, `project_id`, `user_id`, `body`, `created_at`.
- **`resources`**: `id`, `user_id`, `name`, `url`, `description`, `category`, `created_at`.
- **`resource_votes`**: `id`, `resource_id`, `user_id`, `created_at`.
