import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../services/api";
import { FaEdit, FaTrash, FaPlus, FaUsers } from "react-icons/fa";

const TeamProjects = () => {
  const { teamId } = useParams();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Create Modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [projectDescription, setProjectDescription] = useState("");
  const [projectDeadline, setProjectDeadline] = useState("");
  const [creating, setCreating] = useState(false);
  
  // Edit Modal
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [updating, setUpdating] = useState(false);
  
  // Delete Modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  
  const [teamDetails, setTeamDetails] = useState(null);
  const [taskCounts, setTaskCounts] = useState({});
  const [members, setMembers] = useState([]);
  const [membersLoading, setMembersLoading] = useState(false);
  
  const navigate = useNavigate();

  // Get user from localStorage
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  
  // Check if user can manage projects (admin or manager only)
  const canManage = ["admin", "manager"].includes(user?.role);

  // Fetch team members - CORRECTED ENDPOINT
  const fetchMembers = async () => {
    try {
      setMembersLoading(true);
      // Fixed: Use /team-members/${teamId} instead of /team-members/${teamId}/members
      const { data } = await API.get(`/team-members/${teamId}`);
      
      // Handle different response structures
      const membersData = data?.data || data || [];
      setMembers(membersData);
    } catch (err) {
      console.error("Failed to fetch members:", err);
      setMembers([]);
    } finally {
      setMembersLoading(false);
    }
  };

  // Fetch task counts for each project
  const fetchTaskCounts = async (projectsList) => {
    try {
      const counts = {};
      
      await Promise.all(
        projectsList.map(async (project) => {
          const projectId = project.id || project._id;
          try {
            const { data } = await API.get(`/tasks/project/${projectId}`);
            counts[projectId] = data?.data?.length || 0;
          } catch (err) {
            console.error(`Failed to fetch tasks for project ${projectId}:`, err);
            counts[projectId] = 0;
          }
        })
      );
      
      setTaskCounts(counts);
    } catch (err) {
      console.error("Failed to fetch task counts:", err);
    }
  };

  // Fetch team projects
  useEffect(() => {
    const fetchTeamProjects = async () => {
      try {
        setLoading(true);
        
        // Fetch team details
        try {
          const teamRes = await API.get(`/teams/${teamId}`);
          setTeamDetails(teamRes.data?.data || teamRes.data);
        } catch (err) {
          console.log("Could not fetch team details:", err);
        }
        
        // Fetch projects
        const { data } = await API.get(`/projects/team/${teamId}`);
        const projectsData = data?.data || [];
        
        setProjects(projectsData);
        setError(null);
        
        // Fetch task counts for projects
        if (projectsData.length > 0) {
          fetchTaskCounts(projectsData);
        }
        
      } catch (err) {
        console.error(err);
        setError(err.response?.data?.message || "Failed to fetch projects");
      } finally {
        setLoading(false);
      }
    };

    if (teamId) {
      fetchTeamProjects();
    }
  }, [teamId]);

  // Fetch members when component mounts - CORRECTED
  useEffect(() => {
    if (teamId) {
      fetchMembers();
    }
  }, [teamId]);

  // Create Project
  const handleCreateProject = async () => {
    if (!projectName.trim()) return;
    
    try {
      setCreating(true);
      const { data } = await API.post(
        "/projects",
        {
          name: projectName,
          description: projectDescription,
          deadline: projectDeadline || null,
          teamId,
        },
        { toastMessage: "Project created successfully" }
      );

      const newProject = data?.data || data;
      setProjects(prev => [newProject, ...prev]);
      
      // Fetch task count for the new project
      const projectId = newProject.id || newProject._id;
      try {
        const { data: taskData } = await API.get(`/tasks/project/${projectId}`);
        setTaskCounts(prev => ({
          ...prev,
          [projectId]: taskData?.data?.length || 0
        }));
      } catch (err) {
        console.error("Failed to fetch task count for new project:", err);
      }
      
      // Reset form
      setProjectName("");
      setProjectDescription("");
      setProjectDeadline("");
      setShowCreateModal(false);
    } catch (err) {
      console.error("Failed to create project:", err);
      alert(err.response?.data?.message || "Failed to create project");
    } finally {
      setCreating(false);
    }
  };

  // Edit Project
  const handleEditClick = (project) => {
    setEditingProject({
      id: project.id || project._id,
      name: project.name,
      description: project.description || "",
      deadline: project.deadline ? project.deadline.split('T')[0] : ""
    });
    setShowEditModal(true);
  };

  const handleUpdateProject = async () => {
    if (!editingProject?.name.trim()) return;
    
    try {
      setUpdating(true);
      const { data } = await API.put(
        `/projects/${editingProject.id}`,
        {
          name: editingProject.name,
          description: editingProject.description,
          deadline: editingProject.deadline || null,
        },
        { toastMessage: "Project updated successfully" }
      );

      const updatedProject = data?.data || data;
      setProjects(prev => 
        prev.map(p => (p.id === editingProject.id || p._id === editingProject.id) ? updatedProject : p)
      );
      
      setShowEditModal(false);
      setEditingProject(null);
    } catch (err) {
      console.error("Failed to update project:", err);
      alert(err.response?.data?.message || "Failed to update project");
    } finally {
      setUpdating(false);
    }
  };

  // Delete Project
  const handleDeleteClick = (projectId) => {
    setProjectToDelete(projectId);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      setDeleting(true);
      await API.delete(`/projects/${projectToDelete}`, {
        toastMessage: "Project deleted successfully",
      });
      
      setProjects(prev => prev.filter(p => (p.id !== projectToDelete && p._id !== projectToDelete)));
      
      // Remove task count for deleted project
      setTaskCounts(prev => {
        const newCounts = { ...prev };
        delete newCounts[projectToDelete];
        return newCounts;
      });
      
      setShowDeleteModal(false);
      setProjectToDelete(null);
    } catch (err) {
      console.error("Failed to delete project:", err);
      alert(err.response?.data?.message || "Failed to delete project");
    } finally {
      setDeleting(false);
    }
  };

  // Helper function to get avatar URL
  const getAvatarUrl = (avatar) => {
    if (!avatar) return null;
    if (avatar.startsWith('http')) return avatar;
    return `http://localhost:5001${avatar}`;
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(`/teams`)}
              className="text-2xl hover:text-indigo-600 transition"
            >
              ←
            </button>
            <h1 className="text-2xl font-bold">Team Projects</h1>
          </div>
        </div>
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          <p className="mt-4 text-gray-600">Loading projects...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => navigate(-1)}
            className="text-2xl hover:text-indigo-600 transition"
          >
            ←
          </button>
          <h1 className="text-2xl font-bold">Team Projects</h1>
        </div>
        <div className="bg-red-50 p-4 rounded-lg">
          <p className="text-red-600">Error: {error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-2 text-red-600 text-sm underline"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header with back button and conditional buttons */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(`/teams`)}
            className="text-2xl hover:text-indigo-600 transition transform hover:scale-110"
            title="Go back"
          >
            ←
          </button>
          <div>
            <h1 className="text-2xl font-bold">Team Projects</h1>
            {teamDetails && (
              <p className="text-sm text-gray-500 mt-1">
                Team: {teamDetails.name}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Members Button */}
          <button
            onClick={() => navigate(`/teams/${teamId}/members`)}
            className="bg-indigo-100 text-indigo-700 px-4 py-2 rounded-lg hover:bg-indigo-200 transition flex items-center gap-2 transform hover:scale-105"
            title="View team members"
          >
            <FaUsers className="text-indigo-600" />
            <span className="hidden sm:inline">Members ({members.length})</span>
            <span className="sm:hidden">{members.length}</span>
          </button>

          {/* Create Project Button - Only for admin/manager */}
          {canManage && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition flex items-center gap-2 transform hover:scale-105"
            >
              <FaPlus /> Create Project
            </button>
          )}
        </div>
      </div>
      
      {/* CREATE PROJECT MODAL */}
      {showCreateModal && canManage && (
        <div className="fixed inset-0 flex items-center justify-center z-50 animate-fadeIn">
          <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm" onClick={() => setShowCreateModal(false)}></div>
          <div className="relative bg-white rounded-2xl w-full max-w-md shadow-2xl animate-slideUp overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <span className="text-2xl">📊</span>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Create New Project</h2>
                  <p className="text-indigo-100 text-sm">Start a new project in this team</p>
                </div>
              </div>
              <button onClick={() => setShowCreateModal(false)} className="absolute top-4 right-4 text-white/80 hover:text-white">
                ✕
              </button>
            </div>
            <div className="p-6">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Project Name <span className="text-red-500">*</span>
                </label>
                <input
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  placeholder="e.g., Website Redesign"
                  className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-indigo-500"
                  autoFocus
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={projectDescription}
                  onChange={(e) => setProjectDescription(e.target.value)}
                  placeholder="Brief description..."
                  rows="3"
                  className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 resize-none"
                />
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Deadline
                </label>
                <input
                  type="date"
                  value={projectDeadline}
                  onChange={(e) => setProjectDeadline(e.target.value)}
                  className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div className="flex gap-3">
                <button onClick={() => setShowCreateModal(false)} className="flex-1 px-4 py-3 border rounded-lg hover:bg-gray-50">
                  Cancel
                </button>
                <button
                  onClick={handleCreateProject}
                  disabled={!projectName.trim() || creating}
                  className={`flex-1 px-4 py-3 rounded-lg flex items-center justify-center gap-2
                    ${!projectName.trim() || creating ? 'bg-gray-300 cursor-not-allowed' : 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700'}`}
                >
                  {creating ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div> : 'Create Project'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* EDIT PROJECT MODAL */}
      {showEditModal && editingProject && (
        <div className="fixed inset-0 flex items-center justify-center z-50 animate-fadeIn">
          <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm" onClick={() => setShowEditModal(false)}></div>
          <div className="relative bg-white rounded-2xl w-full max-w-md shadow-2xl animate-slideUp overflow-hidden">
            <div className="bg-gradient-to-r from-yellow-500 to-orange-500 px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <span className="text-2xl">✏️</span>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Edit Project</h2>
                  <p className="text-yellow-100 text-sm">Update project details</p>
                </div>
              </div>
              <button onClick={() => setShowEditModal(false)} className="absolute top-4 right-4 text-white/80 hover:text-white">
                ✕
              </button>
            </div>
            <div className="p-6">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Project Name <span className="text-red-500">*</span>
                </label>
                <input
                  value={editingProject.name}
                  onChange={(e) => setEditingProject({...editingProject, name: e.target.value})}
                  className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-yellow-500"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={editingProject.description}
                  onChange={(e) => setEditingProject({...editingProject, description: e.target.value})}
                  rows="3"
                  className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-yellow-500 resize-none"
                />
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Deadline
                </label>
                <input
                  type="date"
                  value={editingProject.deadline}
                  onChange={(e) => setEditingProject({...editingProject, deadline: e.target.value})}
                  className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-yellow-500"
                />
              </div>
              <div className="flex gap-3">
                <button onClick={() => setShowEditModal(false)} className="flex-1 px-4 py-3 border rounded-lg hover:bg-gray-50">
                  Cancel
                </button>
                <button
                  onClick={handleUpdateProject}
                  disabled={!editingProject.name.trim() || updating}
                  className={`flex-1 px-4 py-3 rounded-lg flex items-center justify-center gap-2
                    ${!editingProject.name.trim() || updating ? 'bg-gray-300 cursor-not-allowed' : 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white hover:from-yellow-600'}`}
                >
                  {updating ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div> : 'Update Project'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {showDeleteModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 animate-fadeIn">
          <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm" onClick={() => setShowDeleteModal(false)}></div>
          <div className="relative bg-white rounded-2xl w-full max-w-md shadow-2xl animate-slideUp overflow-hidden p-6">
            <div className="text-center">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-4xl">🗑️</span>
              </div>
              <h2 className="text-xl font-bold text-gray-800 mb-2">Delete Project?</h2>
              <p className="text-gray-500 mb-6">
                Are you sure you want to delete this project? This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 px-4 py-3 border rounded-lg hover:bg-gray-50"
                  disabled={deleting}
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  disabled={deleting}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 flex items-center justify-center gap-2"
                >
                  {deleting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Deleting...
                    </>
                  ) : (
                    'Delete Project'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Projects Grid or Empty State */}
      {projects.length === 0 ? (
        <div className="bg-white rounded-xl shadow p-12">
          <div className="flex flex-col items-center justify-center animate-fadeIn">
            <div className="relative mb-6">
              <div className="text-8xl animate-bounce-slow">📊</div>
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-indigo-100 rounded-full flex items-center justify-center animate-pulse">
                <span className="text-indigo-600 text-sm">0</span>
              </div>
            </div>
            
            <h3 className="text-xl font-semibold text-gray-700 mb-2 animate-slideUp">
              No projects yet!
            </h3>
            
            <p className="text-gray-500 text-center max-w-sm mb-8 animate-slideUp animation-delay-200">
              {canManage 
                ? "Create your first project to start tracking work."
                : "There are no projects in this team yet."}
            </p>
            
            {canManage && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition transform hover:scale-105 flex items-center gap-2"
              >
                <span>✨</span> Create Your First Project
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project, index) => (
            <div
              key={project.id || project._id}
              className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 group"
            >
              {/* Clickable area for navigation (except buttons) */}
              <div 
                onClick={() => navigate(`/projects/${project.id || project._id}?teamId=${teamId}`)}
                className="p-6 cursor-pointer"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center text-white text-xl font-bold">
                    {project.name?.charAt(0).toUpperCase()}
                  </div>
                  
                  {/* Action buttons - Only for admin/manager */}
                  {canManage && (
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditClick(project);
                        }}
                        className="p-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition transform hover:scale-110"
                        title="Edit project"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteClick(project.id || project._id);
                        }}
                        className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition transform hover:scale-110"
                        title="Delete project"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  )}
                </div>

                <h2 className="text-lg font-semibold mb-2 group-hover:text-indigo-600 transition">
                  {project.name}
                </h2>
                
                {project.description && (
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {project.description}
                  </p>
                )}

                <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                  <span className="flex items-center gap-1">
                    <span>📊</span>
                    <span>{taskCounts[project.id || project._id] || 0} tasks</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <FaUsers className="text-indigo-500" />
                    <span>{members.length} members</span>
                  </span>
                </div>

                <div className="border-t pt-4">
                  <p className="text-sm text-gray-500 flex items-center gap-1">
                    <span>📅</span>
                    Deadline: {project.deadline 
                      ? new Date(project.deadline).toLocaleDateString() 
                      : 'No deadline set'}
                  </p>
                </div>
              </div>

              {/* View button at bottom */}
              <div className="px-6 pb-6">
                <div 
                  onClick={() => navigate(`/projects/${project.id || project._id}?teamId=${teamId}`)}
                  className="text-indigo-600 text-sm font-medium flex items-center gap-1 group-hover:translate-x-1 transition-transform cursor-pointer"
                >
                  View Project <span>→</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TeamProjects;