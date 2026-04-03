// pages/Documentation.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  FaSearch, 
  FaBook, 
  FaUserFriends, 
  FaProjectDiagram, 
  FaTasks, 
  FaBell,
  FaUser,
  FaShieldAlt,
  FaRocket,
  FaChevronRight,
  FaHome,
  FaCode,
  FaDatabase,
  FaLock,
  FaEnvelope,
  FaCheckCircle,
  FaArrowRight,
  FaCopy,
  FaCheck
} from "react-icons/fa";

const Documentation = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSection, setActiveSection] = useState("getting-started");
  const [copiedCode, setCopiedCode] = useState(null);

  // Documentation sections
  const sections = [
    { id: "getting-started", name: "Getting Started", icon: FaRocket },
    { id: "authentication", name: "Authentication", icon: FaLock },
    { id: "teams", name: "Teams Management", icon: FaUserFriends },
    { id: "projects", name: "Projects", icon: FaProjectDiagram },
    { id: "tasks", name: "Tasks", icon: FaTasks },
    { id: "notifications", name: "Notifications", icon: FaBell },
    { id: "profile", name: "Profile & Settings", icon: FaUser },
    { id: "api", name: "API Reference", icon: FaCode }
  ];

  // Copy to clipboard function
  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  // Content for each section
  const content = {
    "getting-started": {
      title: "Getting Started with TeamCollab",
      description: "Learn how to set up and start using TeamCollab for your team.",
      sections: [
        {
          title: "Introduction",
          content: "TeamCollab is a comprehensive project management platform that helps teams collaborate, track tasks, and manage projects efficiently. With real-time updates, role-based access control, and intuitive interfaces, TeamCollab makes project management simple and effective."
        },
        {
          title: "Creating Your Account",
          content: "To get started with TeamCollab:",
          steps: [
            "Click on the 'Register' button on the login page",
            "Fill in your name, email, and password",
            "Agree to the terms and conditions",
            "Click 'Create Account'",
            "You'll be redirected to the login page to sign in"
          ]
        },
        {
          title: "First Time Login",
          content: "After creating your account:",
          steps: [
            "Log in with your email and password",
            "You'll be taken to the Dashboard",
            "Start by creating a team or joining an existing one",
            "Create your first project and add tasks"
          ]
        },
        {
          title: "Dashboard Overview",
          content: "The dashboard gives you a quick overview of:",
          steps: [
            "Total teams, projects, and tasks",
            "Recent activities",
            "Upcoming deadlines",
            "Quick action buttons for common tasks",
            "Statistics and progress charts"
          ]
        }
      ]
    },
    "authentication": {
      title: "Authentication & Security",
      description: "Learn about user authentication, roles, and security features.",
      sections: [
        {
          title: "Login & Registration",
          content: "TeamCollab uses JWT (JSON Web Tokens) for secure authentication. All passwords are encrypted using bcrypt.",
          code: `// Login Example
POST /api/auth/login
{
  "email": "user@example.com",
  "password": "yourpassword"
}

// Response
{
  "success": true,
  "data": {
    "id": 1,
    "name": "John Doe",
    "email": "user@example.com",
    "role": "admin"
  },
  "token": "eyJhbGciOiJIUzI1NiIs..."
}`
        },
        {
          title: "User Roles",
          content: "TeamCollab has three user roles with different permissions:",
          roles: [
            { name: "Admin", description: "Full access to all features. Can manage teams, projects, tasks, and user roles.", permissions: ["Create/Delete Teams", "Manage Members", "All Project Actions", "Delete Projects", "Manage All Tasks"] },
            { name: "Manager", description: "Can manage projects and tasks within assigned teams.", permissions: ["Create Projects", "Manage Tasks", "Assign Members", "Edit Projects", "Delete Own Projects"] },
            { name: "Member", description: "Can view and work on assigned tasks.", permissions: ["View Teams", "View Projects", "Work on Assigned Tasks", "Update Task Status", "Comment on Tasks"] }
          ]
        },
        {
          title: "Token Management",
          content: "JWT tokens are stored in localStorage and automatically attached to all API requests. Tokens expire after 7 days and require re-authentication.",
          code: `// Token Interceptor Example
axios.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = \`Bearer \${token}\`;
  }
  return config;
});`
        }
      ]
    },
    "teams": {
      title: "Teams Management",
      description: "Learn how to create and manage teams.",
      sections: [
        {
          title: "Creating a Team",
          content: "Only admins and managers can create teams. To create a team:",
          steps: [
            "Navigate to the Teams page",
            "Click the 'Create Team' button",
            "Enter a team name",
            "Click 'Create'"
          ]
        },
        {
          title: "Managing Team Members",
          content: "Add or remove members from your team:",
          steps: [
            "Go to your team page",
            "Click on 'Members'",
            "Select a user from the dropdown",
            "Click 'Add Member' to add them",
            "To remove a member, click the delete icon next to their name"
          ],
          note: "Only admins and managers can add or remove team members."
        },
        {
          title: "Team Roles",
          content: "Each team member can have a role:",
          roles: [
            { name: "Admin", badge: "bg-purple-100 text-purple-600", description: "Full control over the team" },
            { name: "Manager", badge: "bg-blue-100 text-blue-600", description: "Can manage projects and tasks" },
            { name: "Member", badge: "bg-gray-100 text-gray-600", description: "Can work on assigned tasks" }
          ]
        },
        {
          title: "API Endpoints",
          code: `// Get all teams
GET /api/teams

// Create a team
POST /api/teams
{
  "name": "Development Team"
}

// Update team
PUT /api/teams/:id
{
  "name": "Updated Team Name"
}

// Delete team
DELETE /api/teams/:id

// Get team members
GET /api/team-members/:teamId

// Add team member
POST /api/team-members/add
{
  "teamId": 1,
  "userId": 2
}

// Remove team member
DELETE /api/team-members/remove
{
  "teamId": 1,
  "userId": 2
}`
        }
      ]
    },
    "projects": {
      title: "Projects",
      description: "Learn how to create and manage projects.",
      sections: [
        {
          title: "Creating a Project",
          content: "Create a new project within a team:",
          steps: [
            "Navigate to your team page",
            "Click 'Create Project'",
            "Enter project name, description, and deadline",
            "Click 'Create' to start your project"
          ]
        },
        {
          title: "Project Management",
          content: "Each project contains tasks that can be organized in columns:",
          features: [
            "Todo column - New tasks not started",
            "In Progress column - Tasks being worked on",
            "Done column - Completed tasks",
            "Drag and drop functionality (coming soon)",
            "Task priority levels (Low, Medium, High)"
          ]
        },
        {
          title: "Project Settings",
          content: "Admins and managers can edit or delete projects:",
          steps: [
            "Click on the project card",
            "Use the edit icon to modify project details",
            "Use the delete icon to remove the project",
            "All associated tasks will be deleted with the project"
          ]
        },
        {
          title: "API Endpoints",
          code: `// Get all projects in a team
GET /api/projects/team/:teamId

// Get all projects (with pagination)
GET /api/projects/all/:teamId

// Create a project
POST /api/projects
{
  "name": "Website Redesign",
  "description": "Redesign company website",
  "deadline": "2024-12-31",
  "teamId": 1
}

// Update project
PUT /api/projects/:id
{
  "name": "Updated Project Name",
  "description": "New description",
  "deadline": "2024-12-31"
}

// Delete project
DELETE /api/projects/:id`
        }
      ]
    },
    "tasks": {
      title: "Tasks",
      description: "Learn how to create and manage tasks.",
      sections: [
        {
          title: "Creating Tasks",
          content: "Add tasks to your projects:",
          steps: [
            "Open a project",
            "Click 'Add Task'",
            "Enter task title, description, and priority",
            "Click 'Create' to add the task"
          ]
        },
        {
          title: "Task Management",
          content: "Manage tasks efficiently:",
          features: [
            "Assign tasks to team members",
            "Update task status (Todo → In Progress → Done)",
            "Set task priorities",
            "Track task progress",
            "View task history"
          ]
        },
        {
          title: "Task Assignment",
          content: "Assign tasks to team members:",
          steps: [
            "Select the task you want to assign",
            "Click on the assignee dropdown",
            "Choose a team member from the list",
            "The assignee will receive a notification"
          ]
        },
        {
          title: "API Endpoints",
          code: `// Get all tasks in a project
GET /api/tasks/project/:projectId

// Get tasks assigned to current user
GET /api/tasks/findAll

// Create a task
POST /api/tasks
{
  "title": "Design homepage",
  "description": "Create responsive homepage design",
  "priority": "high",
  "projectId": 1
}

// Update task status
PATCH /api/tasks/:id/status
{
  "status": "in_progress"
}

// Assign task to user
PATCH /api/tasks/:id/assign
{
  "userId": 2
}

// Update task
PUT /api/tasks/:id
{
  "title": "Updated task title",
  "description": "Updated description",
  "priority": "medium"
}

// Delete task
DELETE /api/tasks/:id`
        }
      ]
    },
    "notifications": {
      title: "Notifications",
      description: "Learn about real-time notifications.",
      sections: [
        {
          title: "Real-time Updates",
          content: "TeamCollab uses Socket.io for real-time notifications. You'll receive instant updates when:",
          events: [
            "You're assigned to a task",
            "Task status changes",
            "Someone mentions you",
            "Project updates",
            "Team member actions"
          ]
        },
        {
          title: "Managing Notifications",
          content: "View and manage your notifications:",
          steps: [
            "Click the bell icon in the top bar",
            "Unread notifications are highlighted",
            "Click a notification to mark it as read",
            "Use 'Mark All as Read' to clear all notifications"
          ]
        },
        {
          title: "WebSocket Events",
          code: `// Socket Events
socket.on('notification', (data) => {
  console.log('New notification:', data);
});

socket.on('online-users', (users) => {
  console.log('Online users:', users);
});

// Emit join event after login
socket.emit('join', userId);`
        }
      ]
    },
    "profile": {
      title: "Profile & Settings",
      description: "Manage your profile and account settings.",
      sections: [
        {
          title: "Profile Management",
          content: "Update your profile information:",
          steps: [
            "Click on your avatar in the top right",
            "Select 'My Profile' to view your information",
            "Click 'Change Avatar' to upload a new profile picture",
            "Edit your name or email in settings"
          ]
        },
        {
          title: "Avatar Upload",
          content: "Upload a profile picture:",
          steps: [
            "Click on your avatar",
            "Select 'Change Avatar'",
            "Choose an image file from your computer",
            "The image will be uploaded automatically"
          ],
          note: "Supported formats: JPG, PNG, GIF. Max size: 5MB"
        },
        {
          title: "Account Settings",
          content: "Manage your account preferences:",
          settings: [
            "Change password",
            "Email notifications preferences",
            "Language preferences",
            "Theme selection (Light/Dark mode coming soon)"
          ]
        }
      ]
    },
    "api": {
      title: "API Reference",
      description: "Complete API documentation for developers.",
      sections: [
        {
          title: "Base URL",
          code: `// Development
http://localhost:5000/api

// Production
https://api.projecthub.com/api`
        },
        {
          title: "Authentication",
          code: `// All API requests require a Bearer token
headers: {
  'Authorization': 'Bearer <your-token>',
  'Content-Type': 'application/json'
}`
        },
        {
          title: "Response Format",
          code: `// Success Response
{
  "success": true,
  "data": { ... },
  "message": "Operation successful"
}

// Error Response
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error message"
}`
        },
        {
          title: "Common HTTP Status Codes",
          statusCodes: [
            { code: 200, description: "OK - Request succeeded" },
            { code: 201, description: "Created - Resource created successfully" },
            { code: 400, description: "Bad Request - Invalid input" },
            { code: 401, description: "Unauthorized - Authentication required" },
            { code: 403, description: "Forbidden - Insufficient permissions" },
            { code: 404, description: "Not Found - Resource doesn't exist" },
            { code: 500, description: "Internal Server Error" }
          ]
        },
        {
          title: "Rate Limiting",
          content: "API requests are rate-limited to prevent abuse:",
          limits: [
            "100 requests per minute for authenticated users",
            "20 requests per minute for unauthenticated users",
            "Rate limit headers are included in responses"
          ]
        }
      ]
    }
  };

  // Filter sections based on search
  const filteredSections = sections.filter(section =>
    section.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    content[section.id]?.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const CodeBlock = ({ code, id }) => (
    <div className="relative">
      <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm font-mono">
        <code>{code}</code>
      </pre>
      <button
        onClick={() => copyToClipboard(code, id)}
        className="absolute top-2 right-2 p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition"
      >
        {copiedCode === id ? (
          <FaCheck className="text-green-400" />
        ) : (
          <FaCopy className="text-gray-300" />
        )}
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center gap-3 mb-4">
            <FaBook className="text-3xl" />
            <h1 className="text-4xl font-bold">Documentation</h1>
          </div>
          <p className="text-xl text-indigo-100">
            Complete guide to using TeamCollab and integrating with our API
          </p>
          
          {/* Search */}
          <div className="mt-6 max-w-2xl">
            <div className="relative">
              <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search documentation..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="lg:w-64 flex-shrink-0">
            <div className="sticky top-8">
              <div className="bg-white rounded-lg shadow-sm p-4">
                <h3 className="font-semibold text-gray-800 mb-3 px-3">Documentation</h3>
                <nav className="space-y-1">
                  {filteredSections.map((section) => {
                    const Icon = section.icon;
                    return (
                      <button
                        key={section.id}
                        onClick={() => setActiveSection(section.id)}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition ${
                          activeSection === section.id
                            ? 'bg-indigo-50 text-indigo-600'
                            : 'text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        <Icon className="text-sm" />
                        <span className="text-sm">{section.name}</span>
                        <FaChevronRight className={`ml-auto text-xs ${
                          activeSection === section.id ? 'opacity-100' : 'opacity-0'
                        }`} />
                      </button>
                    );
                  })}
                </nav>
              </div>

              {/* Quick Links */}
              <div className="bg-white rounded-lg shadow-sm p-4 mt-4">
                <h3 className="font-semibold text-gray-800 mb-3 px-3">Quick Links</h3>
                <nav className="space-y-2">
                  <a href="/dashboard" className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition">
                    <FaHome className="text-indigo-500" />
                    Dashboard
                  </a>
                  <a href="/help" className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition">
                    <FaEnvelope className="text-indigo-500" />
                    Help Center
                  </a>
                
                </nav>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <div className="bg-white rounded-lg shadow-sm p-8">
              {content[activeSection] && (
                <>
                  <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">
                      {content[activeSection].title}
                    </h1>
                    <p className="text-gray-600">
                      {content[activeSection].description}
                    </p>
                  </div>

                  {content[activeSection].sections.map((section, idx) => (
                    <div key={idx} className="mb-8 last:mb-0">
                      <h2 className="text-xl font-semibold text-gray-800 mb-3 pb-2 border-b border-gray-200">
                        {section.title}
                      </h2>
                      
                      {section.content && (
                        <p className="text-gray-600 mb-4">{section.content}</p>
                      )}

                      {section.steps && (
                        <div className="mb-4">
                          <h3 className="font-medium text-gray-700 mb-2">Steps:</h3>
                          <ul className="space-y-2">
                            {section.steps.map((step, i) => (
                              <li key={i} className="flex items-start gap-2">
                                <FaCheckCircle className="text-green-500 mt-1 flex-shrink-0" />
                                <span className="text-gray-600">{step}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {section.features && (
                        <div className="mb-4">
                          <ul className="space-y-2">
                            {section.features.map((feature, i) => (
                              <li key={i} className="flex items-start gap-2">
                                <FaArrowRight className="text-indigo-500 mt-1 flex-shrink-0" />
                                <span className="text-gray-600">{feature}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {section.roles && (
                        <div className="mb-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {section.roles.map((role, i) => (
                              <div key={i} className="border rounded-lg p-4">
                                <div className="flex items-center gap-2 mb-2">
                                  <span className={`px-2 py-1 rounded-full text-xs ${role.badge || 'bg-gray-100 text-gray-600'}`}>
                                    {role.name}
                                  </span>
                                </div>
                                <p className="text-sm text-gray-600 mb-2">{role.description}</p>
                                {role.permissions && (
                                  <ul className="text-xs text-gray-500 space-y-1">
                                    {role.permissions.map((perm, j) => (
                                      <li key={j} className="flex items-center gap-1">
                                        <FaCheckCircle className="text-green-400 text-xs" />
                                        {perm}
                                      </li>
                                    ))}
                                  </ul>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {section.events && (
                        <div className="mb-4">
                          <ul className="space-y-2">
                            {section.events.map((event, i) => (
                              <li key={i} className="flex items-start gap-2">
                                <FaBell className="text-indigo-500 mt-1 flex-shrink-0" />
                                <span className="text-gray-600">{event}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {section.limits && (
                        <div className="mb-4">
                          <ul className="space-y-2">
                            {section.limits.map((limit, i) => (
                              <li key={i} className="flex items-start gap-2">
                                <FaLock className="text-orange-500 mt-1 flex-shrink-0" />
                                <span className="text-gray-600">{limit}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {section.statusCodes && (
                        <div className="mb-4">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="border-b">
                                <th className="text-left py-2">Status Code</th>
                                <th className="text-left py-2">Description</th>
                              </tr>
                            </thead>
                            <tbody>
                              {section.statusCodes.map((code, i) => (
                                <tr key={i} className="border-b last:border-0">
                                  <td className="py-2 font-mono text-indigo-600">{code.code}</td>
                                  <td className="py-2 text-gray-600">{code.description}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}

                      {section.settings && (
                        <div className="mb-4">
                          <ul className="space-y-2">
                            {section.settings.map((setting, i) => (
                              <li key={i} className="flex items-start gap-2">
                                <FaUser className="text-indigo-500 mt-1 flex-shrink-0" />
                                <span className="text-gray-600">{setting}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {section.note && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                          <p className="text-sm text-yellow-800">
                            <strong>Note:</strong> {section.note}
                          </p>
                        </div>
                      )}

                      {section.code && (
                        <div className="mt-4">
                          <CodeBlock code={section.code} id={`${activeSection}-${idx}`} />
                        </div>
                      )}
                    </div>
                  ))}
                </>
              )}
            </div>

            {/* Feedback Section */}
            <div className="bg-white rounded-lg shadow-sm p-6 mt-6 text-center">
              <p className="text-gray-600 mb-3">Was this documentation helpful?</p>
              <div className="flex justify-center gap-3">
                <button className="px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition">
                  👍 Yes
                </button>
                <button className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition">
                  👎 No
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Documentation;