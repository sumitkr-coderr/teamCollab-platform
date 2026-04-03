import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

const AllProjects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        const { data } = await API.get("/projects");
        setProjects(data.data || data || []);
      } catch (error) {
        console.error("Failed to fetch projects:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        <p className="mt-4 text-gray-600">Loading projects...</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Projects</h1>
        <button
          onClick={() => navigate("/projects/new")}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition flex items-center gap-2"
        >
          <span>+</span> New Project
        </button>
      </div>

      {projects.length === 0 ? (
        <div className="bg-white rounded-xl shadow p-12">
          <div className="flex flex-col items-center justify-center animate-fadeIn">
            {/* Animated project icon */}
            <div className="relative mb-6">
              <div className="text-8xl animate-bounce-slow">📁</div>
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-indigo-100 rounded-full flex items-center justify-center animate-pulse">
                <span className="text-indigo-600 text-sm">0</span>
              </div>
            </div>
            
            {/* No projects message with animation */}
            <h3 className="text-xl font-semibold text-gray-700 mb-2 animate-slideUp">
              No projects yet!
            </h3>
            
            <p className="text-gray-500 text-center max-w-sm mb-8 animate-slideUp animation-delay-200">
              Get started by creating your first project. Projects help you organize your work and collaborate with your team.
            </p>
            
            {/* Animated illustration */}
            <div className="grid grid-cols-3 gap-4 mb-8 animate-float">
              <div className="w-16 h-16 bg-indigo-50 rounded-lg flex items-center justify-center">
                <span className="text-2xl">📋</span>
              </div>
              <div className="w-16 h-16 bg-indigo-50 rounded-lg flex items-center justify-center">
                <span className="text-2xl">🚀</span>
              </div>
              <div className="w-16 h-16 bg-indigo-50 rounded-lg flex items-center justify-center">
                <span className="text-2xl">🎯</span>
              </div>
            </div>

            {/* Create project button */}
            <button
              onClick={() => navigate("/projects/new")}
              className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition transform hover:scale-105 flex items-center gap-2"
            >
              <span>✨</span> Create Your First Project
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project, index) => (
            <div
              key={project.id}
              className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 cursor-pointer"
              onClick={() => navigate(`/projects/${project.id}`)}
              style={{
                animation: `slideUp 0.5s ease-out ${index * 0.1}s both`
              }}
            >
              {/* Project icon based on name or default */}
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center text-white text-xl font-bold">
                  {project.name?.charAt(0).toUpperCase() || "📁"}
                </div>
                
                {/* Status badge (if you have status field) */}
                {project.status && (
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    project.status === 'active' ? 'bg-green-100 text-green-600' :
                    project.status === 'completed' ? 'bg-blue-100 text-blue-600' :
                    'bg-gray-100 text-gray-600'
                  }`}>
                    {project.status}
                  </span>
                )}
              </div>

              <h2 className="font-semibold text-lg mb-2 text-gray-800">
                {project.name}
              </h2>

              <p className="text-sm text-gray-500 mb-4 line-clamp-2">
                {project.description || "No description provided"}
              </p>

              {/* Team info */}
              <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                <span className="text-lg">👥</span>
                <span>{project.team?.name || "No team assigned"}</span>
              </div>

              {/* Project stats (if available) */}
              <div className="flex items-center justify-between text-xs text-gray-400 border-t pt-4">
                <div className="flex items-center gap-1">
                  <span>📅</span>
                  <span>
                    {project.createdAt 
                      ? new Date(project.createdAt).toLocaleDateString()
                      : "Recently"}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <span>👥</span>
                  <span>{project.membersCount || 0} members</span>
                </div>
              </div>

              {/* View button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/projects/${project.id}`);
                }}
                className="mt-4 text-indigo-600 text-sm font-medium hover:text-indigo-700 transition flex items-center gap-1"
              >
                View Project <span>→</span>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AllProjects;