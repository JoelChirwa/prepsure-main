import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import { AuthProvider } from "./context/AuthContext";
import { StudentAuthProvider } from "./context/StudentAuthContext";

import Layout from "./components/Layout";
import HomeRoute from "./components/HomeRoute";
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import HelpFeedback from "./pages/HelpFeedback";
import Experiments from "./pages/Experiments";
import ExperimentDetail from "./pages/ExperimentDetail";
import OhmsLawSimulation from "./pages/OhmsLawSimulation";

import StudentRegister from "./pages/StudentRegister";
import StudentDashboard from "./pages/StudentDashboard";
import StudentProtectedRoute from "./components/StudentProtectedRoute";
import SavedExperiments from "./pages/SavedExperiments";
import StudentProfile from "./pages/StudentProfile";
import StudentSettings from "./pages/StudentSettings";
import StudentAchievements from "./pages/StudentAchievements";
import Quizzes from "./pages/Quizzes";
import Resources from "./pages/Resources";

import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminExperiments from "./pages/admin/AdminExperiments";
import AdminExperimentForm from "./pages/admin/AdminExperimentForm";
import AdminQuizzes from "./pages/admin/AdminQuizzes";
import AdminQuizForm from "./pages/admin/AdminQuizForm";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminFeedback from "./pages/admin/AdminFeedback";
import AdminSimulations from "./pages/admin/AdminSimulations";
import QuizAttempt from "./pages/QuizAttempt";
import MockExams from "./pages/MockExams";
import MockExamAttempt from "./pages/MockExamAttempt";
import ProtectedAdminRoute from "./components/admin/ProtectedAdminRoute";

import "./styles/global.css";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <StudentAuthProvider>
          <Routes>
            {/* Public landing page */}
            <Route path="/" element={<HomeRoute />} />
            <Route path="/help-feedback" element={<HelpFeedback />} />

            {/* Authentication */}
            <Route path="/login" element={<Login />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/student/register" element={<StudentRegister />} />
            <Route path="/simulate/ohms-law" element={<OhmsLawSimulation />} />

            {/* Student-only pages */}
            <Route element={<StudentProtectedRoute />}>
              <Route element={<Layout role="student" />}>
                <Route path="/student" element={<StudentDashboard />} />
                <Route path="/profile" element={<StudentProfile />} />
                <Route path="/settings" element={<StudentSettings />} />
                <Route path="/achievements" element={<StudentAchievements />} />
                <Route path="/experiments" element={<Experiments />} />
                <Route
                  path="/experiments/:id"
                  element={<ExperimentDetail />}
                />
                <Route
                  path="/saved-experiments"
                  element={<SavedExperiments />}
                />
                <Route path="/quizzes" element={<Quizzes />} />
                <Route path="/quizzes/attempts/:attemptId" element={<QuizAttempt />} />
                <Route path="/quizzes/:id" element={<QuizAttempt />} />
                <Route path="/mock-exams" element={<MockExams />} />
                <Route path="/mock-exams/attempts/:attemptId" element={<MockExamAttempt />} />
                <Route path="/resources" element={<Resources />} />
              </Route>
            </Route>

            {/* Admin-only pages */}
            <Route element={<ProtectedAdminRoute />}>
              <Route path="/admin" element={<Layout role="admin" />}>
                <Route index element={<AdminDashboard />} />
                <Route path="experiments" element={<AdminExperiments />} />
                <Route path="quizzes" element={<AdminQuizzes />} />
                <Route path="users" element={<AdminUsers />} />
                <Route path="feedback" element={<AdminFeedback />} />
                <Route path="simulations" element={<AdminSimulations />} />
                <Route path="quizzes/new" element={<AdminQuizForm />} />
                <Route path="quizzes/:id/edit" element={<AdminQuizForm />} />
                <Route
                  path="experiments/new"
                  element={<AdminExperimentForm />}
                />
                <Route
                  path="experiments/:id/edit"
                  element={<AdminExperimentForm />}
                />
              </Route>
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </StudentAuthProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
