import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import { 
  FaUsers, 
  FaProjectDiagram, 
  FaTasks, 
  FaClock, 
  FaCheckCircle,
  FaArrowRight,
  FaCalendarAlt,
  FaBell,
  FaChartLine
} from "react-icons/fa";

const Dashboard = () => {
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [recentActivities, setRecentActivities] = useState([]);
  const [upcomingDeadlines, setUpcomingDeadlines] = useState([]);
  const navigate = useNavigate();
  const [allTasks, setAllTasks] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [inProgressTasks, setInProgressTasks] = useState([]);
  const [pendingTasks, setPendingTasks] = useState([]);
  const [members, setMembers] = useState([]);

  const fetchTaskForDeskBoard = async () => { 
    try {
      const res = await API.get("/tasks/findAll");
      setAllTasks(res?.data?.data || []);
      const filterComplete =  res?.data?.data?.filter(item => item?.status ==  "done")
      const filterInProgress =  res?.data?.data?.filter(item => item?.status ==  "in_progress")
      const filterPending =  res?.data?.data?.filter(item => item?.status ==  "todo")
      setTasks(filterComplete||[]);
      setInProgressTasks(filterInProgress||[]);
      setPendingTasks(filterPending||[]);
    } catch (err) {
      console.error("Failed to fetch dashboard overview:", err);
    }
  };

  const fetchAllUser = async () => {
    try {
      const res = await API.get("/users/findAll");  
      setMembers(res?.data?.data || []);
    } catch (err) {
      console.error("Failed to fetch users:", err);
    }
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch overview stats
        const overviewRes = await API.get("/dashboard/overview");
        setOverview(overviewRes.data);        
      } catch (err) {
        console.error("Failed to fetch dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
    fetchTaskForDeskBoard();
    fetchAllUser();
  }, []);

  // Get user from localStorage for personalized greeting
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  // Loading skeleton
  if (loading) {
    return (
      <div className="p-6 space-y-8">
        {/* Welcome Section Skeleton */}
        <div>
          <div className="h-8 w-64 bg-gray-200 rounded animate-pulse mb-2"></div>
          <div className="h-4 w-96 bg-gray-200 rounded animate-pulse"></div>
        </div>

        {/* Stats Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white p-6 rounded-2xl shadow-md">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-8 w-16 bg-gray-200 rounded animate-pulse"></div>
                </div>
                <div className="w-12 h-12 bg-gray-200 rounded-full animate-pulse"></div>
              </div>
            </div>
          ))}
        </div>

        {/* Charts Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-2xl shadow-md">
            <div className="h-6 w-32 bg-gray-200 rounded animate-pulse mb-4"></div>
            <div className="h-40 bg-gray-200 rounded animate-pulse"></div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-md">
            <div className="h-6 w-32 bg-gray-200 rounded animate-pulse mb-4"></div>
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
                  <div className="flex-1">
                    <div className="h-4 w-3/4 bg-gray-200 rounded animate-pulse mb-2"></div>
                    <div className="h-3 w-1/2 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Stat Card Component
  const StatCard = ({ title, value, icon, color = "indigo", trend, onClick }) => (
    <div
      onClick={onClick}
      className="bg-white p-6 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer group"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500 mb-1">{title}</p>
          <h2 className="text-3xl font-bold text-gray-800">{value}</h2>
          {trend !== undefined && (
            <p className={`text-xs mt-2 flex items-center gap-1 ${
              trend > 0 ? 'text-green-500' : trend < 0 ? 'text-red-500' : 'text-gray-400'
            }`}>
              <FaChartLine />
              {trend > 0 ? '+' : ''}{trend}% from last month
            </p>
          )}
        </div>
        <div className={`bg-${color}-100 text-${color}-600 p-4 rounded-xl group-hover:scale-110 transition-transform`}>
          <span className="text-2xl">{icon}</span>
        </div>
      </div>
    </div>
  );

  // Activity Item Component
  const ActivityItem = ({ activity }) => (
    <div className="flex items-start gap-3 p-3 hover:bg-gray-50 rounded-lg transition">
      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
        activity.type === 'task' ? 'bg-blue-100 text-blue-600' :
        activity.type === 'project' ? 'bg-purple-100 text-purple-600' :
        'bg-green-100 text-green-600'
      }`}>
        <span className="text-sm">
          {activity.type === 'task' ? '📋' :
           activity.type === 'project' ? '📊' : '👥'}
        </span>
      </div>
      <div className="flex-1">
        <p className="text-sm text-gray-800">{activity.message}</p>
        <p className="text-xs text-gray-400 mt-1">
          {new Date(activity.createdAt).toLocaleDateString()} at {new Date(activity.createdAt).toLocaleTimeString()}
        </p>
      </div>
    </div>
  );

  // Deadline Item Component
  const DeadlineItem = ({ deadline }) => (
    <div className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition">
      <div className="flex items-center gap-3">
        <div className={`w-2 h-2 rounded-full ${
          deadline.daysLeft < 0 ? 'bg-red-500' :
          deadline.daysLeft === 0 ? 'bg-yellow-500' :
          deadline.daysLeft <= 2 ? 'bg-orange-500' :
          'bg-green-500'
        }`}></div>
        <div>
          <p className="text-sm font-medium text-gray-800">{deadline.title}</p>
          <p className="text-xs text-gray-400">{deadline.project}</p>
        </div>
      </div>
      <span className={`text-xs px-2 py-1 rounded-full ${
        deadline.daysLeft < 0 ? 'bg-red-100 text-red-600' :
        deadline.daysLeft === 0 ? 'bg-yellow-100 text-yellow-600' :
        deadline.daysLeft <= 2 ? 'bg-orange-100 text-orange-600' :
        'bg-green-100 text-green-600'
      }`}>
        {deadline.daysLeft < 0 ? 'Overdue' :
         deadline.daysLeft === 0 ? 'Today' :
         `${deadline.daysLeft} day${deadline.daysLeft > 1 ? 's' : ''} left`}
      </span>
    </div>
  );

  return (
    <div className="p-6 space-y-8">
      {/* Welcome Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            {getGreeting()}, {user.name?.split(' ')[0] || 'User'}! 👋
          </h1>
          <p className="text-gray-500 mt-1">
            Here's what's happening in your workspace today.
          </p>
        </div>
        
        {/* Date Display */}
        <div className="hidden md:flex items-center gap-2 bg-white px-4 py-2 rounded-lg shadow-sm">
          <FaCalendarAlt className="text-indigo-500" />
          <span className="text-sm text-gray-600">
            {new Date().toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Teams"
          value={overview?.totalTeams || 0}
          icon="👥"
          color="indigo"
          trend={overview?.teamTrend}
          onClick={() => navigate('/teams')}
        />
        
        <StatCard
          title="Total Projects"
          value={overview?.totalProjects || 0}
          icon="📊"
          color="purple"
          trend={overview?.projectTrend}
          onClick={() => navigate('/projects')}
        />
        
        <StatCard
          title="Total Tasks"
          value={overview?.totalTasks || 0}
          icon="📋"
          color="blue"
          trend={overview?.taskTrend}
          onClick={() => navigate('/tasks')}
        />
        
        <StatCard
          title="Pending Tasks"
          value={pendingTasks.length || 0}
          icon="⏳"
          color="red"
          trend={overview?.pendingTrend}
          onClick={() => navigate('/tasks?status=pending')}
        />
      </div>

      {/* Additional Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-xl">
          <div className="flex items-center gap-3">
            <FaCheckCircle className="text-green-600 text-xl" />
            <div>
              <p className="text-xs text-green-600">Completed</p>
              <p className="text-xl font-bold text-green-700">{tasks.length || 0}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-4 rounded-xl">
          <div className="flex items-center gap-3">
            <FaClock className="text-yellow-600 text-xl" />
            <div>
              <p className="text-xs text-yellow-600">In Progress</p>
              <p className="text-xl font-bold text-yellow-700">{inProgressTasks.length || 0}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl">
          <div className="flex items-center gap-3">
            <FaUsers className="text-blue-600 text-xl" />
            <div>
              <p className="text-xs text-blue-600">Team Members</p>
              <p className="text-xl font-bold text-blue-700">{members.length || 0}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-xl">
          <div className="flex items-center gap-3">
            <FaTasks className="text-purple-600 text-xl" />
            <div>
              <p className="text-xs text-purple-600">Completion Rate</p>
              <p className="text-xl font-bold text-purple-700">
              {allTasks.length > 0? ((tasks.length / allTasks.length) * 100).toFixed(2): 0}%
              </p>
            </div>
          </div> 
        </div>
      </div>
    </div>
  );
};

export default Dashboard;