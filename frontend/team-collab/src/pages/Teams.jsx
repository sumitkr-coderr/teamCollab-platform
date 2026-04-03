import { useEffect, useState } from "react";
import API from "../services/api";
import { useNavigate } from "react-router-dom";
import { FaEdit, FaTrash, FaUsers, FaProjectDiagram } from "react-icons/fa";

const Teams = () => {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [teamName, setTeamName] = useState("");
  const [creating, setCreating] = useState(false);
  
  // Store counts for each team
  const [projectCounts, setProjectCounts] = useState({});
  const [memberCounts, setMemberCounts] = useState({});
  const [fetchingCounts, setFetchingCounts] = useState(false);
  
  // Edit Modal
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingTeam, setEditingTeam] = useState(null);
  const [updating, setUpdating] = useState(false);
  
  // Delete Modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [teamToDelete, setTeamToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  
  const navigate = useNavigate();

  // Get user from localStorage
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  
  // Check if user can manage teams (admin or manager only)
  const canManage = ["admin", "manager"].includes(user?.role);

  // Fetch all teams
  useEffect(() => {
    const fetchTeams = async () => {
      try {
        setLoading(true);
        const { data } = await API.get("/teams");
        
        if (Array.isArray(data?.data)) {
          const teamsData = data.data;
          setTeams(teamsData);
          
          // After fetching teams, fetch their project and member counts
          if (teamsData.length > 0) {
            fetchCountsForTeams(teamsData);
          }
        } else {
          console.error("Data is not an array:", data?.data);
          setTeams([]);
          setError("Received invalid data format");
        }
      } catch (err) {
        console.error(err);
        setError(err.message || "Failed to fetch teams");
        setTeams([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTeams();
  }, []);

  // Fetch project counts and member counts for all teams
  const fetchCountsForTeams = async (teamsList) => {
    setFetchingCounts(true);
    
    const projectCountsMap = {};
    const memberCountsMap = {};
    
    await Promise.all(
      teamsList.map(async (team) => {
        const teamId = team.id || team._id;
        
        // Fetch projects count using /projects/all/:teamId
        try {
          const projectsRes = await API.get(`/projects/all/${teamId}`);
          const projectsData = projectsRes.data?.data || projectsRes.data || [];
          projectCountsMap[teamId] = projectsData.length;
        } catch (err) {
          console.error(`Failed to fetch projects for team ${teamId}:`, err);
          projectCountsMap[teamId] = 0;
        }
        
        // Fetch members count using /team-members/:teamId
        try {
          const membersRes = await API.get(`/team-members/${teamId}`);
          const membersData = membersRes.data?.data || membersRes.data || [];
          memberCountsMap[teamId] = membersData.length;
        } catch (err) {
          console.error(`Failed to fetch members for team ${teamId}:`, err);
          memberCountsMap[teamId] = 0;
        }
      })
    );
    
    setProjectCounts(projectCountsMap);
    setMemberCounts(memberCountsMap);
    setFetchingCounts(false);
  };

  // Update counts after create/update/delete
  const refreshCountsForTeam = async (teamId) => {
    // Fetch projects count
    try {
      const projectsRes = await API.get(`/projects/all/${teamId}`);
      const projectsData = projectsRes.data?.data || projectsRes.data || [];
      setProjectCounts(prev => ({ ...prev, [teamId]: projectsData.length }));
    } catch (err) {
      console.error(`Failed to fetch projects for team ${teamId}:`, err);
    }
    
    // Fetch members count
    try {
      const membersRes = await API.get(`/team-members/${teamId}`);
      const membersData = membersRes.data?.data || membersRes.data || [];
      setMemberCounts(prev => ({ ...prev, [teamId]: membersData.length }));
    } catch (err) {
      console.error(`Failed to fetch members for team ${teamId}:`, err);
    }
  };

  // Create Team
  const handleCreateTeam = async () => {
    if (!teamName.trim()) return;
    
    try {
      setCreating(true);
      const { data } = await API.post(
        "/teams",
        { name: teamName },
        { toastMessage: "Team created successfully" }
      );

      const newTeam = data?.data || data?.team || data;
      const newTeamId = newTeam.id || newTeam._id;
      
      setTeams(prev => [newTeam, ...prev]);
      
      // Fetch counts for the new team
      await refreshCountsForTeam(newTeamId);
      
      setTeamName("");
      setShowModal(false);
    } catch (err) {
      console.error("Failed to create team:", err);
      alert(err.response?.data?.message || "Failed to create team");
    } finally {
      setCreating(false);
    }
  };

  // Edit Team
  const handleEditClick = (team, e) => {
    e.stopPropagation();
    setEditingTeam({
      id: team.id || team._id,
      name: team.name
    });
    setShowEditModal(true);
  };

  const handleUpdateTeam = async () => {
    if (!editingTeam?.name.trim()) return;
    
    try {
      setUpdating(true);
      const { data } = await API.put(
        `/teams/${editingTeam.id}`,
        { name: editingTeam.name },
        { toastMessage: "Team updated successfully" }
      );

      const updatedTeam = data?.data || data;
      setTeams(prev => 
        prev.map(t => (t.id === editingTeam.id || t._id === editingTeam.id) ? updatedTeam : t)
      );
      
      setShowEditModal(false);
      setEditingTeam(null);
    } catch (err) {
      console.error("Failed to update team:", err);
      alert(err.response?.data?.message || "Failed to update team");
    } finally {
      setUpdating(false);
    }
  };

  // Delete Team
  const handleDeleteClick = (teamId, e) => {
    e.stopPropagation();
    setTeamToDelete(teamId);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      setDeleting(true);
      await API.delete(`/teams/${teamToDelete}`, {
        toastMessage: "Team deleted successfully",
      });
      
      setTeams(prev => prev.filter(t => (t.id !== teamToDelete && t._id !== teamToDelete)));
      
      // Remove counts for deleted team
      setProjectCounts(prev => {
        const newCounts = { ...prev };
        delete newCounts[teamToDelete];
        return newCounts;
      });
      setMemberCounts(prev => {
        const newCounts = { ...prev };
        delete newCounts[teamToDelete];
        return newCounts;
      });
      
      setShowDeleteModal(false);
      setTeamToDelete(null);
    } catch (err) {
      console.error("Failed to delete team:", err);
      alert(err.response?.data?.message || "Failed to delete team");
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">My Teams</h1>
          {canManage && (
            <button
              onClick={() => setShowModal(true)}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition flex items-center gap-2"
            >
              <span>+</span> Create Team
            </button>
          )}
        </div>
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          <p className="mt-4 text-gray-600">Loading teams...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">My Teams</h1>
          {canManage && (
            <button
              onClick={() => setShowModal(true)}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition flex items-center gap-2"
            >
              <span>+</span> Create Team
            </button>
          )}
        </div>
        <div className="bg-red-50 p-4 rounded-lg animate-fadeIn">
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
      {/* Header with conditional Create button */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">My Teams</h1>
        {canManage && (
          <button
            onClick={() => setShowModal(true)}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition flex items-center gap-2 transform hover:scale-105"
          >
            <span>+</span> Create Team
          </button>
        )}
      </div>

      {/* Create Team Modal */}
      {showModal && canManage && (
        <div className="fixed inset-0 flex items-center justify-center z-50 animate-fadeIn">
          <div 
            className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm"
            onClick={() => {
              setShowModal(false);
              setTeamName("");
            }}
          ></div>
          
          <div 
            className="relative bg-white rounded-2xl w-full max-w-md shadow-2xl animate-slideUp overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                  <span className="text-2xl">🚀</span>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Create New Team</h2>
                  <p className="text-indigo-100 text-sm">Start collaborating with your team</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowModal(false);
                  setTeamName("");
                }}
                className="absolute top-4 right-4 text-white/80 hover:text-white transition"
              >
                ✕
              </button>
            </div>

            <div className="p-6">
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Team Name <span className="text-red-500">*</span>
                </label>
                <input
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  placeholder="e.g., Product Development, Marketing Team"
                  className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                  autoFocus
                  onKeyPress={(e) => e.key === 'Enter' && handleCreateTeam()}
                />
              </div>

              {teamName && (
                <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200 animate-fadeIn">
                  <p className="text-sm text-gray-600 mb-2">Preview:</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">
                      {teamName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">{teamName}</p>
                      <p className="text-xs text-gray-500">Ready to create</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowModal(false);
                    setTeamName("");
                  }}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
                  disabled={creating}
                >
                  Cancel
                </button>

                <button
                  onClick={handleCreateTeam}
                  disabled={!teamName.trim() || creating}
                  className={`flex-1 px-4 py-3 rounded-lg transition font-medium flex items-center justify-center gap-2
                    ${(!teamName.trim() || creating) 
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                      : 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700'}`}
                >
                  {creating ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Creating...
                    </>
                  ) : (
                    <>
                      <span>✨</span>
                      Create Team
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Team Modal */}
      {showEditModal && editingTeam && (
        <div className="fixed inset-0 flex items-center justify-center z-50 animate-fadeIn">
          <div 
            className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm"
            onClick={() => {
              setShowEditModal(false);
              setEditingTeam(null);
            }}
          ></div>
          
          <div 
            className="relative bg-white rounded-2xl w-full max-w-md shadow-2xl animate-slideUp overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-gradient-to-r from-yellow-500 to-orange-500 px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                  <span className="text-2xl">✏️</span>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Edit Team</h2>
                  <p className="text-yellow-100 text-sm">Update team information</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingTeam(null);
                }}
                className="absolute top-4 right-4 text-white/80 hover:text-white transition"
              >
                ✕
              </button>
            </div>

            <div className="p-6">
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Team Name <span className="text-red-500">*</span>
                </label>
                <input
                  value={editingTeam.name}
                  onChange={(e) => setEditingTeam({...editingTeam, name: e.target.value})}
                  placeholder="Enter team name"
                  className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition"
                  autoFocus
                  onKeyPress={(e) => e.key === 'Enter' && handleUpdateTeam()}
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingTeam(null);
                  }}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
                  disabled={updating}
                >
                  Cancel
                </button>

                <button
                  onClick={handleUpdateTeam}
                  disabled={!editingTeam.name.trim() || updating}
                  className={`flex-1 px-4 py-3 rounded-lg transition font-medium flex items-center justify-center gap-2
                    ${(!editingTeam.name.trim() || updating) 
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                      : 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white hover:from-yellow-600 hover:to-orange-600'}`}
                >
                  {updating ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Updating...
                    </>
                  ) : (
                    <>
                      <span>💾</span>
                      Update Team
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 animate-fadeIn">
          <div 
            className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm"
            onClick={() => {
              setShowDeleteModal(false);
              setTeamToDelete(null);
            }}
          ></div>
          
          <div 
            className="relative bg-white rounded-2xl w-full max-w-md shadow-2xl animate-slideUp overflow-hidden p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-4xl">🗑️</span>
              </div>
              <h2 className="text-xl font-bold text-gray-800 mb-2">Delete Team?</h2>
              <p className="text-gray-500 mb-6">
                Are you sure you want to delete this team? This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setTeamToDelete(null);
                  }}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition font-medium"
                  disabled={deleting}
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  disabled={deleting}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition font-medium flex items-center justify-center gap-2"
                >
                  {deleting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Deleting...
                    </>
                  ) : (
                    'Delete Team'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Teams Grid or Empty State */}
      {teams.length === 0 ? (
        <div className="bg-white rounded-xl shadow p-12">
          <div className="flex flex-col items-center justify-center animate-fadeIn">
            <div className="relative mb-6">
              <div className="text-8xl animate-bounce-slow">👥</div>
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-indigo-100 rounded-full flex items-center justify-center animate-pulse">
                <span className="text-indigo-600 text-sm">0</span>
              </div>
            </div>
            
            <h3 className="text-xl font-semibold text-gray-700 mb-2 animate-slideUp">
              No teams yet!
            </h3>
            
            <p className="text-gray-500 text-center max-w-sm mb-8 animate-slideUp animation-delay-200">
              {canManage 
                ? "Create your first team to start collaborating with others."
                : "You don't have any teams yet. Contact an admin or manager to add you to a team."}
            </p>
            
            <div className="grid grid-cols-3 gap-4 mb-8 animate-float">
              <div className="w-16 h-16 bg-indigo-50 rounded-lg flex items-center justify-center">
                <span className="text-2xl">🤝</span>
              </div>
              <div className="w-16 h-16 bg-indigo-50 rounded-lg flex items-center justify-center">
                <span className="text-2xl">💬</span>
              </div>
              <div className="w-16 h-16 bg-indigo-50 rounded-lg flex items-center justify-center">
                <span className="text-2xl">✨</span>
              </div>
            </div>

            {canManage ? (
              <button
                onClick={() => setShowModal(true)}
                className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition transform hover:scale-105 flex items-center gap-2"
              >
                <span>✨</span> Create Your First Team
              </button>
            ) : (
              <div className="text-center">
                <p className="text-gray-400 text-sm mb-2">Need to join a team?</p>
                <button
                  onClick={() => navigate("/dashboard")}
                  className="text-indigo-600 hover:text-indigo-700 font-medium"
                >
                  Go to Dashboard →
                </button>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {teams.map((team, index) => {
            const teamId = team.id || team._id;
            const projectCount = fetchingCounts ? "..." : (projectCounts[teamId] || 0);
            const memberCount = fetchingCounts ? "..." : (memberCounts[teamId] || 0);
            
            return (
              <div
                key={teamId}
                onClick={() => navigate(`/teams/${teamId}`)}
                className="bg-white p-6 rounded-2xl shadow-md cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-xl relative group"
                style={{
                  animation: `slideUp 0.5s ease-out ${index * 0.1}s both`
                }}
              >
                {/* Action Buttons - Only for admin/manager */}
                {canManage && (
                  <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => handleEditClick(team, e)}
                      className="p-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition transform hover:scale-110"
                      title="Edit team"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={(e) => handleDeleteClick(teamId, e)}
                      className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition transform hover:scale-110"
                      title="Delete team"
                    >
                      <FaTrash />
                    </button>
                  </div>
                )}

                {/* Team icon */}
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center text-white text-xl font-bold mb-4">
                  {team.name?.charAt(0).toUpperCase()}
                </div>

                <h2 className="text-lg font-semibold mb-2">{team.name}</h2>
                
                {/* Team stats with icons */}
                <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                  <span className="flex items-center gap-1">
                    <FaUsers className="text-indigo-500" />
                    <span>{memberCount} members</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <FaProjectDiagram className="text-purple-500" />
                    <span>{projectCount} projects</span>
                  </span>
                </div>

                <p className="text-gray-500 text-sm border-t pt-4">
                  Created: {team.createdAt ? new Date(team.createdAt).toLocaleDateString() : 'Recently'}
                </p>

                {/* View button */}
                <div className="mt-4 text-indigo-600 text-sm font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                  View Team Projects
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}; 

export default Teams;