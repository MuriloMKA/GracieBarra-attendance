import React from 'react';
import { createBrowserRouter, Outlet, Navigate } from 'react-router';
import { Toaster } from 'sonner';
import { DataProvider } from './context/DataContext';
import { Layout } from './components/Layout';
import { RequireAuth } from './components/RequireAuth';
import { LoginPage } from './pages/Login';
import { StudentDashboard } from './pages/StudentDashboard';
import { StudentCard } from './pages/StudentCard';
import { AdminDashboard } from './pages/AdminDashboard';
import { AdminStudents } from './pages/AdminStudents';
import { AdminStudentCard } from './pages/AdminStudentCard';

function Root() {
  return (
    <DataProvider>
      <Toaster position="top-right" richColors />
      <Outlet />
    </DataProvider>
  );
}

function StudentLayout() {
  return (
    <RequireAuth allowedRoles={['student']}>
      <Layout>
        <Outlet />
      </Layout>
    </RequireAuth>
  );
}

function AdminLayout() {
  return (
    <RequireAuth allowedRoles={['admin']}>
      <Layout>
        <Outlet />
      </Layout>
    </RequireAuth>
  );
}

export const router = createBrowserRouter([
  {
    element: <Root />,
    children: [
      { path: '/', element: <LoginPage /> },
      {
        element: <StudentLayout />,
        children: [
          { path: 'student', element: <StudentDashboard /> },
          { path: 'student/card', element: <StudentCard /> },
        ],
      },
      {
        element: <AdminLayout />,
        children: [
          { path: 'admin', element: <AdminDashboard /> },
          { path: 'admin/students', element: <AdminStudents /> },
          { path: 'admin/students/:id/card', element: <AdminStudentCard /> },
        ],
      },
      { path: '*', element: <Navigate to="/" replace /> },
    ],
  },
]);