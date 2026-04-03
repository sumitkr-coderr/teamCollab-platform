// pages/MyTasks.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import { 
  FaTasks, 
  FaProjectDiagram, 
  FaCalendarAlt,
  FaClock,
  FaFilter,
  FaSearch,
  FaSortAmountDown,
  FaUser
} from "react-icons/fa";

// Helper function to get avatar URL
const getAvatarUrl = (avatar) => {
  if (!avatar) return null;
  if (avatar.startsWith('http')) return avatar;
  return `http://localhost:5001${avatar}`;
};

const MyTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [stats, setStats] = useState({
    total: 0,
    todo: 0,
    inProgress: 0,
    done: 0
  });

  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    fetchMyTasks();
  }, []);

  useEffect(() => {
    filterAndSortTasks();
  }, [tasks, searchTerm, statusFilter, sortBy]);

  const fetchMyTasks = async () => {
    try {
      setLoading(true);
      const response = await API.get("/tasks/findAll");
      console.log("My tasks:", response.data);
      
      const tasksData = response.data?.data || [];
      setTasks(tasksData);
      
      const stats = {
        total: tasksData.length,
        todo: tasksData.filter(t => t.status === "todo").length,
        inProgress: tasksData.filter(t => t.status === "in_progress").length,
        done: tasksData.filter(t => t.status === "done").length
      };
      setStats(stats);
      
    } catch (err) {
      console.error("Failed to fetch tasks:", err);
      setError(err.response?.data?.message || "Failed to load tasks");
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortTasks = () => {
    let filtered = [...tasks];

    if (searchTerm) {
      filtered = filtered.filter(task => 
        task.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.Projects?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.assignee?.name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter(task => task.status === statusFilter);
    }

    filtered.sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.createdAt) - new Date(a.createdAt);
        case "oldest":
          return new Date(a.createdAt) - new Date(b.createdAt);
        case "project":
          return (a.Projects?.name || "").localeCompare(b.Projects?.name || "");
        case "assignee":
          return (a.assignee?.name || "").localeCompare(b.assignee?.name || "");
        default:
          return 0;
      }
    });

    setFilteredTasks(filtered);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "todo": return "📝";
      case "in_progress": return "⚡";
      case "done": return "✅";
      default: return "📋";
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "todo": return "bg-gray-100 text-gray-600";
      case "in_progress": return "bg-yellow-100 text-yellow-600";
      case "done": return "bg-green-100 text-green-600";
      default: return "bg-gray-100 text-gray-600";
    }
  };

  const StatCard = ({ title, value, icon, color }) => (
    <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500 mb-1">{title}</p>
          <p className={`text-3xl font-bold text-${color}-600`}>{value}</p>
        </div>
        <div className={`bg-${color}-100 p-3 rounded-lg`}>
          <span className="text-2xl">{icon}</span>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center gap-4 mb-8">
          <h1 className="text-2xl font-bold">My Tasks</h1>
        </div>
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          <p className="mt-4 text-gray-600">Loading your tasks...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">My Tasks</h1>
        <div className="bg-red-50 p-4 rounded-lg">
          <p className="text-red-600">Error: {error}</p>
          <button 
            onClick={fetchMyTasks} 
            className="mt-2 text-red-600 text-sm underline"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header with User Avatar */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
            <FaTasks className="text-indigo-600" />
            My Tasks
          </h1>
          <p className="text-gray-500 mt-1">
            View and manage all tasks assigned to you
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard title="Total Tasks" value={stats.total} icon="📊" color="indigo" />
        <StatCard title="To Do" value={stats.todo} icon="📝" color="yellow" />
        <StatCard title="In Progress" value={stats.inProgress} icon="⚡" color="blue" />
        <StatCard title="Completed" value={stats.done} icon="✅" color="green" />
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-xl shadow-md p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <FaSearch className="absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search tasks by title, project or assignee..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          {/* Status Filter */}
          <div className="relative">
            <FaFilter className="absolute left-3 top-3 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 appearance-none"
            >
              <option value="all">All Status</option>
              <option value="todo">📝 To Do</option>
              <option value="in_progress">⚡ In Progress</option>
              <option value="done">✅ Done</option>
            </select>
          </div>

          {/* Sort By */}
          <div className="relative">
            <FaSortAmountDown className="absolute left-3 top-3 text-gray-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="project">Sort by Project</option>
              <option value="assignee">Sort by Assignee</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tasks List */}
      <div className="space-y-4">
        {filteredTasks.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <div className="text-8xl mb-4">📭</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No tasks found</h3>
            <p className="text-gray-500">
              {searchTerm || statusFilter !== "all"
                ? "Try adjusting your filters"
                : "You don't have any tasks assigned yet"}
            </p>
          </div>
        ) : (
          filteredTasks.map((task) => (
            <div
              key={task.id}
              onClick={() => navigate(`/projects/${task.Projects?.id}?taskId=${task.id}`)}
              className="bg-white rounded-xl shadow-md hover:shadow-lg transition cursor-pointer group"
            >
              <div className="p-6">
                {/* Task Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3 flex-1">
                    <span className="text-2xl">{getStatusIcon(task.status)}</span>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-800 group-hover:text-indigo-600 transition">
                        {task.title}
                      </h3>
                      {task.description && (
                        <p className="text-sm text-gray-500 mt-1">
                          {task.description}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Task Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Project Info */}
                  <div className="flex items-center gap-2 text-sm bg-gray-50 p-2 rounded-lg">
                    <FaProjectDiagram className="text-indigo-500 flex-shrink-0" />
                    <span className="text-gray-700 font-medium truncate">
                      {task.Projects?.name || "No Project"}
                    </span>
                  </div>

                  {/* Assignee with Avatar */}
                  <div className="flex items-center gap-2 text-sm bg-gray-50 p-2 rounded-lg">
                    {task.assignee?.avatar ? (
                      <img 
                        src={getAvatarUrl(task.assignee.avatar)}
                        alt={task.assignee.name}
                        className="w-6 h-6 rounded-full object-cover border border-gray-200"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.style.display = 'none';
                          e.target.parentElement.innerHTML = `
                            <div class="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                              ${task.assignee.name?.charAt(0).toUpperCase()}
                            </div>
                          `;
                        }}
                      />
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                        {task.assignee?.name?.charAt(0).toUpperCase() || '?'}
                      </div>
                    )}
                    <span className="text-gray-600 truncate">
                      {task.assignee?.name || "Unassigned"}
                    </span>
                  </div>

                  {/* Created Date */}
                  <div className="flex items-center gap-2 text-sm bg-gray-50 p-2 rounded-lg">
                    <FaClock className="text-gray-400 flex-shrink-0" />
                    <span className="text-gray-500">
                      {new Date(task.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                </div>

                {/* Status Badge and View Link */}
                <div className="mt-4 flex items-center justify-between pt-3 border-t border-gray-100">
                  <span className={`text-xs px-3 py-1.5 rounded-full font-medium ${getStatusColor(task.status)}`}>
                    {task.status === 'todo' ? '📝 To Do' :
                     task.status === 'in_progress' ? '⚡ In Progress' :
                     '✅ Completed'}
                  </span>

                  <span className="text-indigo-600 text-sm font-medium opacity-0 group-hover:opacity-100 transition flex items-center gap-1">
                    View Project <span>→</span>
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Results Count */}
      {filteredTasks.length > 0 && (
        <div className="text-sm text-gray-500 text-right">
          Showing {filteredTasks.length} of {tasks.length} tasks
        </div>
      )}
    </div>
  );
};

export default MyTasks;