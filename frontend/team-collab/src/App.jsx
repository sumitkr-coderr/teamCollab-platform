import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./layout/Layout";
import Login from "./pages/Login";
import Register from "./pages/Register";
import PrivateRoute from "./components/PrivateRoute";
import Dashboard from "./pages/Dashboard";
import TeamProjects from "./pages/TeamProjects";
import Teams from "./pages/Teams";
import ProjectTasks from "./pages/ProjectTasks";
import AllProjects from "./pages/AllProjects";
import MyTasks from "./pages/MyTasks";
import NotificationsPage from "./pages/NotificationsPage";
import TeamMembers from "./pages/TeamMembers";
import HelpCenter from "./pages/HelpCenter";
import Documentation from "./pages/Documentation";
import Footer from "./layout/Footer";

// toasts
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { SocketProvider } from "./services/SocketContext";

// Import animations CSS
import "./index.css";

function App() {
  return (
    <SocketProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes - No Layout, with Footer */}
          <Route path="/login" element={
            <div className="flex flex-col min-h-screen">
              <Login />
              <Footer />
            </div>
          } />
          
          <Route path="/register" element={
            <div className="flex flex-col min-h-screen">
              <Register />
              <Footer />
            </div>
          } />

          {/* Public info pages (optional) */}
          <Route path="/about" element={
            <div className="flex flex-col min-h-screen bg-gray-50">
              <div className="flex-1 p-6">
                <h1 className="text-3xl font-bold text-gray-800">About Us</h1>
                <p className="mt-4 text-gray-600">Your about page content here...</p>
              </div>
              <Footer />
            </div>
          } />

          <Route path="/privacy" element={
            <div className="flex flex-col min-h-screen bg-gray-50">
              <div className="flex-1 p-6">
                <h1 className="text-3xl font-bold text-gray-800">Privacy Policy</h1>
                <p className="mt-4 text-gray-600">Your privacy policy content here...</p>
              </div>
              <Footer />
            </div>
          } />

          <Route path="/terms" element={
            <div className="flex flex-col min-h-screen bg-gray-50">
              <div className="flex-1 p-6">
                <h1 className="text-3xl font-bold text-gray-800">Terms of Service</h1>
                <p className="mt-4 text-gray-600">Your terms of service content here...</p>
              </div>
              <Footer />
            </div>
          } />

          {/* Protected Routes - With Layout (Layout already includes Footer) */}
          <Route
            path="/"
            element={
              <PrivateRoute>
                <Layout />
              </PrivateRoute>
            }
          >
            <Route index element={<Dashboard />} />
            
            {/* Team Routes */}
            <Route path="teams">
              <Route index element={<Teams />} />
              <Route path=":teamId" element={<TeamProjects />} />
              <Route path=":teamId/members" element={<TeamMembers />} />
            </Route>

            {/* Project Routes */}
            <Route path="projects">
              <Route index element={<AllProjects />} />
              <Route path=":projectId" element={<ProjectTasks />} />
            </Route>

            {/* Other Routes */}
            <Route path="mytasks" element={<MyTasks />} />
            <Route path="notifications" element={<NotificationsPage />} />
            
            {/* Catch-all for dashboard (optional) */}
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="help" element={<HelpCenter />} />
            <Route path="docs" element={<Documentation />} />
          </Route>

          {/* 404 Not Found Route */}
          <Route path="*" element={
            <div className="flex flex-col min-h-screen bg-gray-50">
              <div className="flex-1 flex items-center justify-center p-6">
                <div className="text-center">
                  <h1 className="text-6xl font-bold text-gray-800 mb-4">404</h1>
                  <p className="text-xl text-gray-600 mb-6">Page not found</p>
                  <a 
                    href="/" 
                    className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                  >
                    Go Home
                  </a>
                </div>
              </div>
              <Footer />
            </div>
          } />
        </Routes>
      </BrowserRouter>
      <ToastContainer 
        position="top-right" 
        autoClose={3000} 
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
    </SocketProvider>
  );
}

export default App;