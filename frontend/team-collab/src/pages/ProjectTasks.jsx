import { useEffect, useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import API from "../services/api";
import { FaTrash, FaEdit, FaPlus } from "react-icons/fa";

// Helper function to get avatar URL
const getAvatarUrl = (avatar) => {
  if (!avatar) return null;
  if (avatar.startsWith('http')) return avatar;
  return `http://localhost:5001${avatar}`;
};

/* ==================Task Card========================= */
const TaskCard = ({
  task,
  handleStatusChange,
  handleAssign,
  handleEditClick,
  handleDeleteClick,
  teamMembers,
  role,
}) => {
  // Find the full member details for the assignee
  const assigneeDetails = task.assigneeId 
    ? teamMembers.find(m => m.id === task.assigneeId) 
    : task.assignee;

  return (
    <div className="bg-white rounded-2xl p-4 shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 hover:scale-[1.02]">
      <div className="flex items-start justify-between">
        <h3 className="font-semibold text-gray-800 flex-1">{task.title}</h3>
        {/* Priority badge */}
        {task.priority && (
          <span className={`text-xs px-2 py-1 rounded-full ml-2 whitespace-nowrap ${
            task.priority === 'high' ? 'bg-red-100 text-red-600' :
            task.priority === 'medium' ? 'bg-yellow-100 text-yellow-600' :
            'bg-green-100 text-green-600'
          }`}>
            {task.priority}
          </span>
        )}
      </div>

      {task.description && (
        <p className="text-sm text-gray-500 mt-2 line-clamp-2">
          {task.description}
        </p>
      )}

      {/* Assignee with Profile Photo */}
      {(task.assignee || task.assigneeId) && (
        <div className="flex items-center mt-3 bg-gray-50 p-2 rounded-lg">
          {/* Profile Photo */}
          <div className="w-8 h-8 rounded-full flex-shrink-0 overflow-hidden border-2 border-white shadow">
            {assigneeDetails?.avatar ? (
              <img
                src={getAvatarUrl(assigneeDetails.avatar)}
                alt={assigneeDetails.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.style.display = 'none';
                  e.target.parentElement.innerHTML = `
                    <div class="w-full h-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
                      ${assigneeDetails.name?.charAt(0).toUpperCase()}
                    </div>
                  `;
                }}
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
                {(assigneeDetails?.name || task.assignee?.name)?.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          
          {/* Assignee Name */}
          <span className="ml-3 text-sm text-gray-600 truncate">
            {assigneeDetails?.name || task.assignee?.name}
          </span>
        </div>
      )}

      {/* Admin/Manager Controls */}
      {(role === "admin" || role === "manager") && (
        <div className="flex flex-col sm:flex-row gap-2 mt-4">
          <select
            value={task.status}
            onChange={(e) => handleStatusChange(task.id, e.target.value)}
            className="flex-1 text-sm px-3 py-2 rounded-lg bg-gray-100 border-0 focus:ring-2 focus:ring-indigo-500 truncate min-w-0"
          >
            <option value="todo">📝 Todo</option>
            <option value="in_progress">⚡ In Progress</option>
            <option value="done">✅ Done</option>
          </select>

          <select
            value={task.assignedTo || task.assigneeId || ""}
            onChange={(e) => handleAssign(task.id, e.target.value)}
            className="flex-1 text-sm px-3 py-2 rounded-lg bg-gray-100 border-0 focus:ring-2 focus:ring-indigo-500 truncate min-w-0"
          >
            <option value="">👤 Unassigned</option>
            {teamMembers.map((member) => (
              <option key={member.id} value={member.id} className="truncate">
                {member.name}
              </option>
            ))}
          </select>

          <div className="flex gap-2 flex-shrink-0">
            <button
              onClick={() => handleEditClick(task)}
              className="bg-yellow-500 text-white p-2 rounded-lg text-sm hover:bg-yellow-600 transition transform hover:scale-110 flex-shrink-0"
              title="Edit Task"
            >
              <FaEdit />
            </button>

            <button
              onClick={() => handleDeleteClick(task.id)}
              className="bg-red-500 text-white p-2 rounded-lg text-sm hover:bg-red-600 transition transform hover:scale-110 flex-shrink-0"
              title="Delete Task"
            >
              <FaTrash />
            </button>
          </div>
        </div>
      )}

      {/* If no admin/manager controls, just show status badge */}
      {role !== "admin" && role !== "manager" && task.status && (
        <div className="mt-3">
          <span className={`text-xs px-2 py-1 rounded-full inline-block ${
            task.status === 'todo' ? 'bg-gray-100 text-gray-600' :
            task.status === 'in_progress' ? 'bg-yellow-100 text-yellow-600' :
            'bg-green-100 text-green-600'
          }`}>
            {task.status === 'todo' ? '📝 Todo' :
             task.status === 'in_progress' ? '⚡ In Progress' :
             '✅ Done'}
          </span>
        </div>
      )}
    </div>
  );
};

/* ==================Empty State Component========================= */
const EmptyState = ({ type, onCreateClick, canCreate }) => {
  const getIcon = () => {
    switch(type) {
      case 'todo': return '📝';
      case 'in_progress': return '⚡';
      case 'done': return '✅';
      default: return '📋';
    }
  };

  return (
    <div className="flex flex-col items-center justify-center py-8 px-4 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
      <span className="text-4xl mb-3 animate-bounce-slow">{getIcon()}</span>
      <p className="text-gray-500 text-sm text-center">No tasks in this column</p>
      {canCreate && type === 'todo' && (
        <button
          onClick={onCreateClick}
          className="mt-3 text-indigo-600 text-sm hover:text-indigo-700 font-medium flex items-center gap-1"
        >
          <FaPlus className="text-xs" /> Add your first task
        </button>
      )}
    </div>
  );
};

/* ==================Main Component========================= */
const ProjectTasks = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const teamId = searchParams.get("teamId");

  const [tasks, setTasks] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [projectDetails, setProjectDetails] = useState(null);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [updating, setUpdating] = useState(false);

  const [selectedTask, setSelectedTask] = useState(null);
  const [taskToDelete, setTaskToDelete] = useState(null);

  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    priority: "medium"
  });

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const role = user?.role;
  const canManage = role === "admin" || role === "manager";

  /* =====================Fetch Tasks========================= */
  const fetchTasks = async () => {
    try {
      setLoading(true);
      const { data } = await API.get(`/tasks/project/${projectId}`);
      
      // Process tasks to ensure assignee data is properly formatted
      const processedTasks = (data?.data || []).map(task => ({
        ...task,
        assigneeId: task.assigneeId || task.assignedTo,
        assignee: task.assignee || null
      }));
      
      setTasks(processedTasks);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (projectId) {
      fetchTasks();
    }
  }, [projectId]);
 

  /* ==================Fetch Members========================= */
  useEffect(() => {
    const fetchMembers = async () => {
      try {
        if (!teamId) return;
        const { data } = await API.get(`/teams/${teamId}`);
        const members = data?.data?.members || [];
        setTeamMembers(members);
      } catch (err) {
        console.error(err);
      }
    };
    fetchMembers();
  }, [teamId]);

  /* ====================Create Task========================= */
  const handleCreateTask = async () => {
    if (!newTask.title.trim()) return;
    
    try {
      setCreating(true);
      const { data } = await API.post(
        "/tasks",
        {
          ...newTask,
          projectId,
        },
        { toastMessage: "Task created" }
      );

      const createdTask = data?.data || data;
      setTasks(prev => [createdTask, ...prev]);
      
      setNewTask({ title: "", description: "", priority: "medium" });
      setShowCreateModal(false);
    } catch (err) {
      console.error("Failed to create task:", err);
    } finally {
      setCreating(false);
    }
  };

  /* ================Edit Task========================= */
  const handleEditClick = (task) => {
    setSelectedTask(task);
    setShowEditModal(true);
  };

  const handleUpdateTask = async () => {
    try {
      setUpdating(true);
      const { data } = await API.put(
        `/tasks/${selectedTask.id}`,
        {
          title: selectedTask.title,
          description: selectedTask.description,
          priority: selectedTask.priority,
        },
        { toastMessage: "Task updated" }
      );

      const updatedTask = data?.data || data;
      setTasks((prev) =>
        prev.map((t) => (t.id === selectedTask.id ? updatedTask : t))
      );

      setShowEditModal(false);
      setSelectedTask(null);
    } catch (err) {
      console.error("Failed to update task:", err);
    } finally {
      setUpdating(false);
    }
  };

  /* =========================Delete Task========================= */
  const handleDeleteClick = (taskId) => {
    setTaskToDelete(taskId);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      await API.delete(`/tasks/${taskToDelete}`, {
        toastMessage: "Task deleted",
      });
      setTasks((prev) => prev.filter((task) => task.id !== taskToDelete));
      setShowDeleteModal(false);
      setTaskToDelete(null);
    } catch (err) {
      console.error("Failed to delete task:", err);
    }
  };

  /* ====================Status========================= */
  const handleStatusChange = async (taskId, status) => {
    try {
      await API.patch(
        `/tasks/${taskId}/status`,
        { status },
        { toastMessage: "Status updated" }
      );
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, status } : t))
      );
    } catch (err) {
      console.error("Failed to update status:", err);
    }
  };

  /* ===================Assign========================= */
  const handleAssign = async (taskId, userId) => {
    try {
      const { data } = await API.patch(
        `/tasks/${taskId}/assign`,
        { userId },
        { toastMessage: "Task assigned" }
      );
      const updatedTask = data?.data || data;
      
      // Find the assigned user details to update the UI
      const assignedUser = teamMembers.find(m => m.id === userId);
      
      setTasks((prev) =>
        prev.map((t) => 
          t.id === taskId 
            ? { 
                ...updatedTask, 
                assigneeId: userId,
                assignee: assignedUser || null 
              } 
            : t
        )
      );
    } catch (err) {
      console.error("Failed to assign task:", err);
    }
  };

  const todoTasks = tasks.filter((t) => t.status === "todo");
  const inProgressTasks = tasks.filter((t) => t.status === "in_progress");
  const doneTasks = tasks.filter((t) => t.status === "done");

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => navigate(-1)} className="text-2xl hover:text-indigo-600 transition">
            ←
          </button>
          <h1 className="text-2xl font-bold">Project Board</h1>
        </div>
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          <p className="mt-4 text-gray-600">Loading tasks...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="text-2xl hover:text-indigo-600 transition transform hover:scale-110"
            title="Go back"
          >
            ←
          </button>
          <div>
            <h1 className="text-2xl font-bold">Project Board</h1>
            {projectDetails && (
              <p className="text-sm text-gray-500 mt-1">{projectDetails.name}</p>
            )}
          </div>
        </div>

        {canManage && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-5 py-2 rounded-xl hover:from-indigo-700 hover:to-purple-700 transition transform hover:scale-105 flex items-center gap-2 shadow-lg"
          >
            <FaPlus /> Add Task
          </button>
        )}
      </div>

      {/* Board Columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Todo Column */}
        <div className="bg-gray-50 p-5 rounded-2xl shadow">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-lg flex items-center gap-2">
              <span>📝</span> Todo
            </h2>
            <span className="bg-indigo-100 text-indigo-600 px-2 py-1 rounded-full text-sm">
              {todoTasks.length}
            </span>
          </div>

          <div className="space-y-4 min-h-[200px]">
            {todoTasks.length === 0 ? (
              <EmptyState type="todo" onCreateClick={() => setShowCreateModal(true)} canCreate={canManage} />
            ) : (
              todoTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  handleStatusChange={handleStatusChange}
                  handleAssign={handleAssign}
                  handleEditClick={handleEditClick}
                  handleDeleteClick={handleDeleteClick}
                  teamMembers={teamMembers}
                  role={role}
                />
              ))
            )}
          </div>
        </div>

        {/* In Progress Column */}
        <div className="bg-gray-50 p-5 rounded-2xl shadow">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-lg flex items-center gap-2">
              <span>⚡</span> In Progress
            </h2>
            <span className="bg-yellow-100 text-yellow-600 px-2 py-1 rounded-full text-sm">
              {inProgressTasks.length}
            </span>
          </div>

          <div className="space-y-4 min-h-[200px]">
            {inProgressTasks.length === 0 ? (
              <EmptyState type="in_progress" />
            ) : (
              inProgressTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  handleStatusChange={handleStatusChange}
                  handleAssign={handleAssign}
                  handleEditClick={handleEditClick}
                  handleDeleteClick={handleDeleteClick}
                  teamMembers={teamMembers}
                  role={role}
                />
              ))
            )}
          </div>
        </div>

        {/* Done Column */}
        <div className="bg-gray-50 p-5 rounded-2xl shadow">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-lg flex items-center gap-2">
              <span>✅</span> Done
            </h2>
            <span className="bg-green-100 text-green-600 px-2 py-1 rounded-full text-sm">
              {doneTasks.length}
            </span>
          </div>

          <div className="space-y-4 min-h-[200px]">
            {doneTasks.length === 0 ? (
              <EmptyState type="done" />
            ) : (
              doneTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  handleStatusChange={handleStatusChange}
                  handleAssign={handleAssign}
                  handleEditClick={handleEditClick}
                  handleDeleteClick={handleDeleteClick}
                  teamMembers={teamMembers}
                  role={role}
                />
              ))
            )}
          </div>
        </div>
      </div>

      {/* =========================CREATE MODAL========================= */}
      {showCreateModal && (
        <Modal onClose={() => setShowCreateModal(false)}>
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 -m-6 mb-6 px-6 py-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span className="text-2xl">✨</span> Create New Task
            </h2>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              placeholder="Enter task title"
              value={newTask.title}
              onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
              className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              autoFocus
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              placeholder="Describe the task..."
              value={newTask.description}
              onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
              rows="3"
              className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Priority
            </label>
            <select
              value={newTask.priority}
              onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
              className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="low">🟢 Low</option>
              <option value="medium">🟡 Medium</option>
              <option value="high">🔴 High</option>
            </select>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setShowCreateModal(false)}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition font-medium"
              disabled={creating}
            >
              Cancel
            </button>
            <button
              onClick={handleCreateTask}
              disabled={!newTask.title.trim() || creating}
              className={`flex-1 px-4 py-3 rounded-lg transition font-medium flex items-center justify-center gap-2
                ${!newTask.title.trim() || creating 
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
                  Create Task
                </>
              )}
            </button>
          </div>
        </Modal>
      )}

      {/* ===============EDIT MODAL========================= */}
      {showEditModal && selectedTask && (
        <Modal onClose={() => setShowEditModal(false)}>
          <div className="bg-gradient-to-r from-yellow-500 to-orange-500 -m-6 mb-6 px-6 py-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span className="text-2xl">✏️</span> Edit Task
            </h2>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              value={selectedTask.title}
              onChange={(e) => setSelectedTask({ ...selectedTask, title: e.target.value })}
              className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-yellow-500"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={selectedTask.description || ""}
              onChange={(e) => setSelectedTask({ ...selectedTask, description: e.target.value })}
              rows="3"
              className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-yellow-500 resize-none"
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Priority
            </label>
            <select
              value={selectedTask.priority || "medium"}
              onChange={(e) => setSelectedTask({ ...selectedTask, priority: e.target.value })}
              className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-yellow-500"
            >
              <option value="low">🟢 Low</option>
              <option value="medium">🟡 Medium</option>
              <option value="high">🔴 High</option>
            </select>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setShowEditModal(false)}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition font-medium"
              disabled={updating}
            >
              Cancel
            </button>
            <button
              onClick={handleUpdateTask}
              disabled={!selectedTask.title?.trim() || updating}
              className={`flex-1 px-4 py-3 rounded-lg transition font-medium flex items-center justify-center gap-2
                ${!selectedTask.title?.trim() || updating 
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
                  Update Task
                </>
              )}
            </button>
          </div>
        </Modal>
      )}

      {/* =========================DELETE MODAL========================= */}
      {showDeleteModal && (
        <Modal onClose={() => setShowDeleteModal(false)}>
          <div className="text-center">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-4xl">🗑️</span>
            </div>
            
            <h2 className="text-xl font-bold text-gray-800 mb-2">Delete Task?</h2>
            <p className="text-gray-500 mb-6">
              Are you sure you want to delete this task? This action cannot be undone.
            </p>
            
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition font-medium"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition font-medium"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

/* =========================Reusable Modal========================= */
const Modal = ({ children, onClose }) => {
  return (
    <div
      className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white w-full max-w-md rounded-2xl shadow-2xl animate-slideUp overflow-hidden"
      >
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
};

export default ProjectTasks;