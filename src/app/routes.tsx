import React from "react";
import { createBrowserRouter, Outlet, Navigate } from "react-router";
import { Toaster } from "sonner";
import { DataProvider } from "./context/DataContext";
import { Layout } from "./components/Layout";
import { RequireAuth } from "./components/RequireAuth";
import { LoginPage } from "./pages/Login";
import { RouteErrorPage } from "./pages/RouteErrorPage";

// Páginas carregadas sob demanda: o aluno não baixa o código do admin
// (scanner de QR, gráficos etc.) e o primeiro carregamento fica mais leve.
const page =
  <K extends string>(
    loader: () => Promise<Record<K, React.ComponentType>>,
    name: K,
  ) =>
  async () => ({ Component: (await loader())[name] });

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
    <RequireAuth allowedRoles={["student"]}>
      <Layout>
        <Outlet />
      </Layout>
    </RequireAuth>
  );
}

function AdminLayout() {
  return (
    <RequireAuth allowedRoles={["admin", "teacher"]}>
      <Layout>
        <Outlet />
      </Layout>
    </RequireAuth>
  );
}

export const router = createBrowserRouter([
  {
    errorElement: <RouteErrorPage />,
    element: <Root />,
    hydrateFallbackElement: (
      <div className="p-8 text-center text-gray-500">Carregando...</div>
    ),
    children: [
      { path: "/", element: <LoginPage /> },
      {
        errorElement: <RouteErrorPage />,
        element: <StudentLayout />,
        children: [
          {
            path: "student",
            lazy: page(
              () => import("./pages/StudentDashboard"),
              "StudentDashboard",
            ),
          },
          {
            path: "student/card",
            lazy: page(() => import("./pages/StudentCard"), "StudentCard"),
          },
        ],
      },
      {
        errorElement: <RouteErrorPage />,
        element: <AdminLayout />,
        children: [
          {
            path: "admin",
            lazy: page(
              () => import("./pages/AdminDashboard"),
              "AdminDashboard",
            ),
          },
          {
            path: "admin/students",
            lazy: page(() => import("./pages/AdminStudents"), "AdminStudents"),
          },
          {
            path: "admin/students/print-qrcodes",
            lazy: page(() => import("./pages/PrintQRCodes"), "PrintQRCodes"),
          },
          {
            path: "admin/students/:id/card",
            lazy: page(
              () => import("./pages/AdminStudentCard"),
              "AdminStudentCard",
            ),
          },
          {
            path: "admin/classes",
            lazy: page(() => import("./pages/AdminClasses"), "AdminClasses"),
          },
          {
            path: "admin/notifications",
            lazy: page(
              () => import("./pages/AdminNotifications"),
              "AdminNotifications",
            ),
          },
        ],
      },
      { path: "*", element: <Navigate to="/" replace /> },
    ],
  },
]);
