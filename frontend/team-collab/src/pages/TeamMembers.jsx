import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../services/api";
import { FaUserPlus, FaArrowLeft, FaTrash, FaProjectDiagram } from "react-icons/fa";

const TeamMembers = () => {
  const { teamId } = useParams();
  const navigate = useNavigate();

  const [members, setMembers] = useState([]);
  const [users, setUsers] = useState([]);
  const [teamProjects, setTeamProjects] = useState([]);
  const [selectedUser, setSelectedUser] = useState("");
  const [loading, setLoading] = useState(true);
  const [addingMember, setAddingMember] = useState(false);
  const [removingMember, setRemovingMember] = useState(false);
  const [teamName, setTeamName] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState(null);

  // Get current user from localStorage
  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
  const canManage = ["admin", "manager"].includes(currentUser?.role);

  useEffect(() => {
    fetchTeamData();
  }, [teamId]);

  const fetchTeamData = async () => {
    try {
      setLoading(true);
      
      // Fetch team details with members
      const teamRes = await API.get(`/teams/${teamId}`);
      const teamData = teamRes.data?.data || teamRes.data;
      
      setMembers(teamData.members || []);
      setTeamName(teamData.name || "");

      // Fetch all users for adding
      const usersRes = await API.get("/users");
      setUsers(usersRes.data?.data || []);

      // Fetch team projects
      const projectsRes = await API.get(`/projects/team/${teamId}`);
      setTeamProjects(projectsRes.data?.data || []);
      
    } catch (err) {
      console.error("Failed to fetch team data:", err);
    } finally {
      setLoading(false);
    }
  };

  const addMember = async () => {
    if (!selectedUser) return;
    
    try {
      setAddingMember(true);
      await API.post(
        "/team-members/add",
        {
          teamId,
          userId: selectedUser
        },
        { toastMessage: "Member added successfully" }
      );

      await fetchTeamData();
      setSelectedUser("");
    } catch (err) {
      console.error("Failed to add member:", err);
    } finally {
      setAddingMember(false);
    }
  };

  const removeMember = async () => {
    if (!memberToDelete) return;
    
    try {
      setRemovingMember(true);
      // Correct DELETE endpoint with body
      await API.delete("/team-members/remove", {
        data: { 
          teamId, 
          userId: memberToDelete 
        },
        toastMessage: "Member removed successfully"
      });
      
      await fetchTeamData();
      setShowDeleteModal(false);
      setMemberToDelete(null);
    } catch (err) {
      console.error("Failed to remove member:", err);
      // Show error message
      alert(err.response?.data?.message || "Failed to remove member");
    } finally {
      setRemovingMember(false);
    }
  };

  const getAvailableUsers = () => {
    const memberIds = new Set(members.map(m => m.id));
    return users.filter(user => !memberIds.has(user.id));
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
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => navigate(-1)}
            className="text-2xl hover:text-indigo-600 transition"
          >
            ←
          </button>
          <div className="h-8 w-48 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white p-4 rounded-xl shadow animate-pulse">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header with Navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="text-2xl hover:text-indigo-600 transition transform hover:scale-110"
            title="Go back"
          >
            ←
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              {teamName} - Members
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Manage your team members and their roles
            </p>
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="flex gap-3">
          <button
            onClick={() => navigate(`/teams/${teamId}`)}
            className="flex items-center gap-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition"
          >
            <FaArrowLeft />
            Back to Team Projects
          </button>
        </div>
      </div>

      {/* Add Member Section - Only for Admin/Manager */}
      {canManage && (
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <FaUserPlus className="text-indigo-600" />
            Add New Member
          </h2>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <select
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
              className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="">Select a user to add</option>
              {getAvailableUsers().map(user => (
                <option key={user.id} value={user.id}>
                  {user.name} ({user.email})
                </option>
              ))}
            </select>

            <button
              onClick={addMember}
              disabled={!selectedUser || addingMember}
              className={`px-6 py-2 rounded-lg transition flex items-center justify-center gap-2
                ${!selectedUser || addingMember 
                  ? 'bg-gray-300 cursor-not-allowed' 
                  : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}
            >
              {addingMember ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Adding...
                </>
              ) : (
                <>
                  <FaUserPlus />
                  Add Member
                </>
              )}
            </button>
          </div>

          {getAvailableUsers().length === 0 && (
            <p className="mt-3 text-sm text-gray-500">
              All available users are already members of this team.
            </p>
          )}
        </div>
      )}

      {/* Team Projects Section */}
      {teamProjects.length > 0 && (
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <FaProjectDiagram className="text-indigo-600" />
            Team Projects ({teamProjects.length})
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {teamProjects.map(project => (
              <div
                key={project.id}
                onClick={() => navigate(`/projects/${project.id}?teamId=${teamId}`)}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition cursor-pointer group"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-medium text-gray-800 group-hover:text-indigo-600 transition">
                      {project.name}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                      {project.description || "No description"}
                    </p>
                  </div>
                  <span className="text-2xl opacity-50 group-hover:opacity-100 transition">
                    📊
                  </span>
                </div>
                <div className="mt-3 flex items-center gap-4 text-xs text-gray-400">
                  <span>Created: {new Date(project.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Members List */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-lg font-semibold mb-4">
          Team Members ({members.length})
        </h2>

        {members.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <div className="text-6xl mb-4">👥</div>
            <h3 className="text-lg font-medium text-gray-700 mb-2">No members yet</h3>
            <p className="text-gray-500 mb-4">Add members to start collaborating</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {members.map(member => (
              <div
                key={member.id}
                className="bg-gray-50 rounded-xl p-4 hover:shadow-md transition group relative"
              >
                <div className="flex items-center gap-3">
                  {/* Profile Photo */}
                  <div className="w-12 h-12 rounded-full flex-shrink-0 overflow-hidden border-2 border-white shadow">
                    {member.avatar ? (
                      <img
                        src={getAvatarUrl(member.avatar)}
                        alt={member.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.style.display = 'none';
                          e.target.parentElement.innerHTML = `
                            <div class="w-full h-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
                              ${member.name?.charAt(0).toUpperCase()}
                            </div>
                          `;
                        }}
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
                        {member.name?.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  
                  {/* Member Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-800 truncate">
                      {member.name}
                    </h3>
                    <p className="text-sm text-gray-500 truncate">
                      {member.email}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        member.TeamMember?.role === 'admin' ? 'bg-purple-100 text-purple-600' :
                        member.TeamMember?.role === 'manager' ? 'bg-blue-100 text-blue-600' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        {member.TeamMember?.role || 'member'}
                      </span>
                      
                      {/* Show if it's the current user */}
                      {member.id === currentUser?.id && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-600">
                          You
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Remove button - Only for Admin/Manager, not removing self, not removing last admin */}
                  {canManage && 
                   members.length > 1 && 
                   member.TeamMember?.role !== 'admin' && 
                   member.id !== currentUser?.id && (
                    <button
                      onClick={() => {
                        setMemberToDelete(member.id);
                        setShowDeleteModal(true);
                      }}
                      className="text-red-500 hover:text-red-600 opacity-0 group-hover:opacity-100 transition"
                      title="Remove member"
                    >
                      <FaTrash />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fadeIn">
          <div className="bg-white rounded-xl p-6 max-w-md w-full animate-slideUp">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaTrash className="text-red-600 text-2xl" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Remove Member</h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to remove this member from the team?
                This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setMemberToDelete(null);
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                  disabled={removingMember}
                >
                  Cancel
                </button>
                <button
                  onClick={removeMember}
                  disabled={removingMember}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition flex items-center justify-center gap-2"
                >
                  {removingMember ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Removing...
                    </>
                  ) : (
                    'Remove Member'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamMembers;