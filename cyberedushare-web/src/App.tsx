import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./hooks/useAuth";
import { getRoleHomePath } from "./utils/auth";
import ProtectedRoute from "./components/shared/ProtectedRoute";

// Auth pages
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import VerifyOtpPage from "./pages/auth/VerifyOtpPage";
import ForgotPasswordPage from "./pages/auth/ForgotPasswordPage";
import VerifyResetOtpPage from "./pages/auth/VerifyResetOtpPage";
import ResetPasswordPage from "./pages/auth/ResetPasswordPage";

// Admin pages
import AdminLayout          from "./pages/admin/AdminLayout";
import AdminDashboard       from "./pages/admin/AdminDashboard";
import AdminUsers           from "./pages/admin/AdminUsers";
import AdminRoleAssignment  from "./pages/admin/AdminRoleAssignment";
import AdminLogs            from "./pages/admin/AdminLogs";
import AdminIntegrations    from "./pages/admin/AdminIntegrations";
import AdminSystemSettings  from "./pages/admin/AdminSystemSettings";
import AdminSettings        from "./pages/admin/AdminSettings";
import AdminContent         from "./pages/admin/AdminContent";
import AdminLabs            from "./pages/admin/AdminLabs";
import AdminChallenges      from "./pages/admin/AdminChallenges";
import AdminQA              from "./pages/admin/AdminQA";
import AdminProjects        from "./pages/admin/AdminProjects";
import AdminNotifications   from "./pages/admin/AdminNotifications";

// Faculty pages
import FacultyLayout     from "./pages/faculty/FacultyLayout";
import FacultyDashboard  from "./pages/faculty/FacultyDashboard";
import FacultyMyContent  from "./pages/faculty/FacultyMyContent";
import FacultyLabs       from "./pages/faculty/FacultyLabs";
import FacultyChallenges from "./pages/faculty/FacultyChallenges";
import FacultyAnalytics  from "./pages/faculty/FacultyAnalytics";
import FacultySettings   from "./pages/faculty/FacultySettings";
import FacultyUpload     from "./pages/faculty/FacultyUpload";
import FacultyCourses    from "./pages/faculty/FacultyCourses";

// Moderator pages
import ModeratorLayout    from "./pages/moderator/ModeratorLayout";
import ModeratorDashboard from "./pages/moderator/ModeratorDashboard";
import ModeratorReview    from "./pages/moderator/ModeratorReview";
import ModeratorFlagged   from "./pages/moderator/ModeratorFlagged";
import ModeratorHistory   from "./pages/moderator/ModeratorHistory";
import ModeratorSettings  from "./pages/moderator/ModeratorSettings";

// Student pages
import StudentLayout       from "./pages/student/StudentLayout";
import StudentHome         from "./pages/student/StudentHome";
import StudentSearch       from "./pages/student/StudentSearch";
import StudentUpload       from "./pages/student/StudentUpload";
import StudentQA           from "./pages/student/StudentQA";
import StudentProjects     from "./pages/student/StudentProjects";
import StudentLabs         from "./pages/student/StudentLabs";
import StudentChallenges   from "./pages/student/StudentChallenges";
import StudentPerformance  from "./pages/student/StudentPerformance";
import StudentNotifications from "./pages/student/StudentNotifications";
import StudentSettings     from "./pages/student/StudentSettings";

// Root redirect
const RootRedirect = () => {
  const { isLoggedIn, user } = useAuth();
  if (!isLoggedIn) return <Navigate to="/login" replace />;
  return <Navigate to={getRoleHomePath(user!.role)} replace />;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Root */}
          <Route path="/" element={<RootRedirect />} />

          {/* Auth */}
          <Route path="/login"             element={<LoginPage />} />
          <Route path="/register"          element={<RegisterPage />} />
          <Route path="/verify-otp"        element={<VerifyOtpPage />} />
          <Route path="/forgot-password"   element={<ForgotPasswordPage />} />
          <Route path="/verify-reset-otp"  element={<VerifyResetOtpPage />} />
          <Route path="/reset-password"    element={<ResetPasswordPage />} />

          {/* Admin */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index                        element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard"             element={<AdminDashboard />} />
            <Route path="users"                 element={<AdminUsers />} />
            <Route path="users/:id/role"        element={<AdminRoleAssignment />} />
            <Route path="logs"                  element={<AdminLogs />} />
            <Route path="integrations"          element={<AdminIntegrations />} />
            <Route path="system-settings"       element={<AdminSystemSettings />} />
            <Route path="settings"              element={<AdminSettings />} />
            {/* Legacy routes — keep for backward compat */}
            <Route path="content"               element={<AdminContent />} />
            <Route path="labs"                  element={<AdminLabs />} />
            <Route path="challenges"            element={<AdminChallenges />} />
            <Route path="qa"                    element={<AdminQA />} />
            <Route path="projects"              element={<AdminProjects />} />
            <Route path="notifications"         element={<AdminNotifications />} />
          </Route>

          {/* Faculty */}
          <Route
            path="/faculty"
            element={
              <ProtectedRoute allowedRoles={["faculty", "admin"]}>
                <FacultyLayout />
              </ProtectedRoute>
            }
          >
            <Route index             element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard"  element={<FacultyDashboard />} />
            <Route path="my-content" element={<FacultyMyContent />} />
            <Route path="labs"       element={<FacultyLabs />} />
            <Route path="challenges" element={<FacultyChallenges />} />
            <Route path="analytics"  element={<FacultyAnalytics />} />
            <Route path="settings"   element={<FacultySettings />} />
            <Route path="upload"     element={<FacultyUpload />} />
            <Route path="courses"    element={<FacultyCourses />} />
          </Route>

          {/* Moderator */}
          <Route
            path="/moderator"
            element={
              <ProtectedRoute allowedRoles={["moderator", "admin"]}>
                <ModeratorLayout />
              </ProtectedRoute>
            }
          >
            <Route index              element={<Navigate to="queue" replace />} />
            <Route path="queue"       element={<ModeratorDashboard />} />
            <Route path="review/:id"  element={<ModeratorReview />} />
            <Route path="flagged"     element={<ModeratorFlagged />} />
            <Route path="history"     element={<ModeratorHistory />} />
            <Route path="settings"    element={<ModeratorSettings />} />
          </Route>

          {/* Student */}
          <Route
            path="/student"
            element={
              <ProtectedRoute allowedRoles={["student", "faculty", "moderator", "admin"]}>
                <StudentLayout />
              </ProtectedRoute>
            }
          >
            <Route index                element={<Navigate to="home" replace />} />
            <Route path="home"          element={<StudentHome />} />
            <Route path="search"        element={<StudentSearch />} />
            <Route path="upload"        element={<StudentUpload />} />
            <Route path="qa"            element={<StudentQA />} />
            <Route path="projects"      element={<StudentProjects />} />
            <Route path="labs"          element={<StudentLabs />} />
            <Route path="challenges"    element={<StudentChallenges />} />
            <Route path="performance"   element={<StudentPerformance />} />
            <Route path="notifications" element={<StudentNotifications />} />
            <Route path="settings"      element={<StudentSettings />} />
          </Route>

          {/* 404 */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;