import React, { useContext } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import SignIn from './components/auth/SignIn';
import SignUp from './components/auth/SignUp';
import Dashboard from './components/Dashboard';
import ProjectPage from './components/ProjectPage';
import UsersList from './components/UsersList';
import TaskCommentsPage from './components/TaskCommentsPage';
import UserProjectsView from './components/UserProjectsView';
import ProjectPageViewClient from './components/ProjectPageViewClient';

import { AuthContext, AuthProvider } from './context/AuthContext';

function PrivateRoute({ children }) {
  const { user } = useContext(AuthContext);
  return user ? children : <Navigate to="/signin" />;
}

// Компонент для корневого маршрута
function RootRedirect() {
  const { user } = useContext(AuthContext);

  if (!user) return null; // или спиннер загрузки

  if (user.role === 'CLIENT') {
    return <Navigate to="/users" replace />;
  }

  // Для разработчика показываем дашборд
  return <Dashboard />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />

          <Route path="/" element={
            <PrivateRoute>
              <RootRedirect />
            </PrivateRoute>
          } />

          <Route path="/user/:username/projects" element={
            <PrivateRoute>
              <UserProjectsView />
            </PrivateRoute>
          } />

          <Route path="/project/:projectName" element={
            <PrivateRoute>
              <ProjectPage />
            </PrivateRoute>
          } />

          <Route path="/user/:username/project/:projectName" element={
            <PrivateRoute>
              <ProjectPageViewClient />
            </PrivateRoute>
          } />

          <Route path="/project/:projectName/task/:taskId" element={
            <PrivateRoute>
              <TaskCommentsPage />
            </PrivateRoute>
          } />

          <Route path="/users" element={
            <PrivateRoute>
              <UsersList />
            </PrivateRoute>
          } />

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
