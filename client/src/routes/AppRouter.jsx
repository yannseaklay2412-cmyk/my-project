import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LandingPage from '../pages/LandingPage.jsx';
import AuthPage from '../pages/AuthPage.jsx';
import ProjectFeedPage from '../pages/ProjectFeedPage.jsx';
import CreateProjectPage from '../pages/CreateProjectPage.jsx';
import ProjectDetailPage from '../pages/ProjectDetailPage.jsx';
import ProjectDashboardPage from '../pages/ProjectDashboardPage.jsx';
import ProjectChatPage from '../pages/ProjectChatPage.jsx';
import ResourcesPage from '../pages/ResourcesPage.jsx';
import ShareResourcePage from '../pages/ShareResourcePage.jsx';
import ProfilePage from '../pages/ProfilePage.jsx';
import ProfileEditPage from '../pages/ProfileEditPage.jsx';
import NotFoundPage from '../pages/NotFoundPage.jsx';

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<AuthPage />} />
        <Route path="/signup" element={<AuthPage />} />
        <Route path="/projects" element={<ProjectFeedPage />} />
        <Route path="/projects/new" element={<CreateProjectPage />} />
        <Route path="/projects/:id" element={<ProjectDetailPage />} />
        <Route path="/projects/:id/dashboard" element={<ProjectDashboardPage />} />
        <Route path="/projects/:id/chat" element={<ProjectChatPage />} />
        <Route path="/resources" element={<ResourcesPage />} />
        <Route path="/resources/new" element={<ShareResourcePage />} />
        <Route path="/u/:userId" element={<ProfilePage />} />
        <Route path="/profile/edit" element={<ProfileEditPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}
