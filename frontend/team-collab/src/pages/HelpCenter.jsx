// pages/HelpCenter.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  FaSearch, 
  FaQuestionCircle, 
  FaBook, 
  FaVideo, 
  FaHeadset, 
  FaEnvelope,
  FaWhatsapp,
  FaTwitter,
  FaGithub,
  FaChevronDown,
  FaChevronUp,
  FaArrowRight,
  FaCheckCircle,
  FaClock,
  FaUserFriends,
  FaChartLine,
  FaShieldAlt,
  FaFileAlt,
  FaLifeRing
} from "react-icons/fa";

const HelpCenter = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [openFaq, setOpenFaq] = useState(null);
  const [activeCategory, setActiveCategory] = useState("all");

  // FAQ Data
  const faqs = [
    {
      id: 1,
      category: "getting-started",
      question: "How do I create a new project?",
      answer: "To create a new project, click on the 'Projects' tab in the sidebar, then click the 'Create Project' button. Fill in the project details like name, description, deadline, and assign team members. Once created, you can start adding tasks to your project."
    },
    {
      id: 2,
      category: "getting-started",
      question: "How do I invite team members?",
      answer: "Navigate to your team page, click on 'Members', then click 'Add Member'. You can search for existing users by email or name. Only team admins and managers can add new members to the team."
    },
    {
      id: 3,
      category: "tasks",
      question: "How do I assign tasks to team members?",
      answer: "When creating or editing a task, use the 'Assign To' dropdown to select a team member. You can also reassign tasks from the task card by clicking the assignee dropdown and selecting a new team member."
    },
    {
      id: 4,
      category: "tasks",
      question: "What are the different task statuses?",
      answer: "Tasks have three statuses: 'Todo' (new tasks not started), 'In Progress' (tasks being worked on), and 'Done' (completed tasks). You can update task status by clicking the status dropdown on any task card."
    },
    {
      id: 5,
      category: "teams",
      question: "What are the different roles in a team?",
      answer: "There are three roles: Admin (full control, can manage team settings and members), Manager (can create projects and manage tasks), and Member (can view and work on assigned tasks)."
    },
    {
      id: 6,
      category: "teams",
      question: "How do I remove a team member?",
      answer: "Only team admins and managers can remove members. Go to your team page, click 'Members', find the member you want to remove, and click the delete icon next to their name. Confirm the removal."
    },
    {
      id: 7,
      category: "notifications",
      question: "How do I receive notifications?",
      answer: "You'll receive real-time notifications when you're assigned to a task, when a task status changes, or when someone mentions you. Notifications appear in the bell icon at the top of the screen."
    },
    {
      id: 8,
      category: "notifications",
      question: "Can I mark notifications as read?",
      answer: "Yes! You can mark individual notifications as read by clicking on them, or click 'Mark All as Read' at the bottom of the notifications panel to mark all notifications as read at once."
    },
    {
      id: 9,
      category: "account",
      question: "How do I change my profile picture?",
      answer: "Click on your profile picture in the top right corner, then click 'Change Avatar' in the dropdown. Select an image file from your computer, and it will be uploaded automatically."
    },
    {
      id: 10,
      category: "account",
      question: "How do I reset my password?",
      answer: "On the login page, click 'Forgot Password'. Enter your email address, and you'll receive a password reset link. Follow the instructions in the email to create a new password."
    }
  ];

  // Categories for filtering
  const categories = [
    { id: "all", name: "All Topics", icon: FaQuestionCircle },
    { id: "getting-started", name: "Getting Started", icon: FaBook },
    { id: "teams", name: "Teams", icon: FaUserFriends },
    { id: "tasks", name: "Tasks", icon: FaCheckCircle },
    { id: "notifications", name: "Notifications", icon: FaClock },
    { id: "account", name: "Account", icon: FaShieldAlt }
  ];

  // Guide articles
  const guides = [
    {
      id: 1,
      title: "Getting Started with ProjectHub",
      description: "Learn the basics of project management",
      icon: FaBook,
      time: "5 min read",
      link: "/guides/getting-started"
    },
    {
      id: 2,
      title: "Project Management Best Practices",
      description: "Tips for effective project planning",
      icon: FaChartLine,
      time: "8 min read",
      link: "/guides/best-practices"
    },
    {
      id: 3,
      title: "Team Collaboration Guide",
      description: "Work better together with your team",
      icon: FaUserFriends,
      time: "6 min read",
      link: "/guides/team-collaboration"
    },
    {
      id: 4,
      title: "Task Management Tips",
      description: "Organize and prioritize your tasks",
      icon: FaCheckCircle,
      time: "4 min read",
      link: "/guides/task-management"
    }
  ];

  // Filter FAQs based on search and category
  const filteredFaqs = faqs.filter(faq => {
    const matchesSearch = searchQuery === "" || 
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === "all" || faq.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const toggleFaq = (id) => {
    setOpenFaq(openFaq === id ? null : id);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              How can we help you?
            </h1>
            <p className="text-xl text-indigo-100 mb-8">
              Find answers to your questions or get in touch with our support team
            </p>
            
            {/* Search Bar */}
            <div className="max-w-2xl mx-auto relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <FaSearch className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search for help articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 text-gray-900 rounded-xl shadow-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-lg"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Links Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition text-center cursor-pointer group">
            <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:bg-indigo-200 transition">
              <FaBook className="text-indigo-600 text-xl" />
            </div>
            <h3 className="font-semibold text-gray-800">Documentation</h3>
            <p className="text-sm text-gray-500 mt-1">Detailed guides</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition text-center cursor-pointer group">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:bg-purple-200 transition">
              <FaVideo className="text-purple-600 text-xl" />
            </div>
            <h3 className="font-semibold text-gray-800">Video Tutorials</h3>
            <p className="text-sm text-gray-500 mt-1">Watch and learn</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition text-center cursor-pointer group">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:bg-green-200 transition">
              <FaHeadset className="text-green-600 text-xl" />
            </div>
            <h3 className="font-semibold text-gray-800">Support</h3>
            <p className="text-sm text-gray-500 mt-1">24/7 assistance</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition text-center cursor-pointer group">
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:bg-orange-200 transition">
              <FaFileAlt className="text-orange-600 text-xl" />
            </div>
            <h3 className="font-semibold text-gray-800">API Docs</h3>
            <p className="text-sm text-gray-500 mt-1">Developer resources</p>
          </div>
        </div>
      </div>

      {/* Categories and FAQ Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-xl text-gray-600">
            Find quick answers to common questions
          </p>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap justify-center gap-3 mb-10">
          {categories.map(category => {
            const Icon = category.icon;
            return (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`px-5 py-2 rounded-full transition flex items-center gap-2 ${
                  activeCategory === category.id
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Icon className="text-sm" />
                <span>{category.name}</span>
              </button>
            );
          })}
        </div>

        {/* FAQ Accordion */}
        <div className="max-w-3xl mx-auto space-y-4">
          {filteredFaqs.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                No results found
              </h3>
              <p className="text-gray-500">
                Try searching with different keywords
              </p>
            </div>
          ) : (
            filteredFaqs.map((faq) => (
              <div
                key={faq.id}
                className="bg-white rounded-xl shadow-md overflow-hidden transition-all"
              >
                <button
                  onClick={() => toggleFaq(faq.id)}
                  className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50 transition"
                >
                  <span className="font-semibold text-gray-800">
                    {faq.question}
                  </span>
                  {openFaq === faq.id ? (
                    <FaChevronUp className="text-gray-400 flex-shrink-0" />
                  ) : (
                    <FaChevronDown className="text-gray-400 flex-shrink-0" />
                  )}
                </button>
                {openFaq === faq.id && (
                  <div className="px-6 pb-4 text-gray-600 border-t border-gray-100 pt-3">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Helpful Guides Section */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Helpful Guides
            </h2>
            <p className="text-xl text-gray-600">
              Step-by-step tutorials to help you get started
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {guides.map((guide) => {
              const Icon = guide.icon;
              return (
                <div
                  key={guide.id}
                  onClick={() => navigate(guide.link)}
                  className="bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition cursor-pointer group"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition">
                    <Icon className="text-white text-xl" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">
                    {guide.title}
                  </h3>
                  <p className="text-sm text-gray-500 mb-3">
                    {guide.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400">{guide.time}</span>
                    <span className="text-indigo-600 text-sm font-medium flex items-center gap-1 group-hover:gap-2 transition">
                      Read <FaArrowRight className="text-xs" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Contact Support Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl shadow-xl overflow-hidden">
          <div className="px-6 py-12 md:px-12 text-center text-white">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaLifeRing className="text-3xl" />
            </div>
            <h2 className="text-3xl font-bold mb-4">
              Still need help?
            </h2>
            <p className="text-indigo-100 text-lg mb-8 max-w-2xl mx-auto">
              Our support team is available 24/7 to assist you with any questions or issues
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <button className="bg-white text-indigo-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition flex items-center gap-2">
                <FaEnvelope /> Contact Support
              </button>
              <button className="bg-indigo-700 text-white px-6 py-3 rounded-lg font-semibold hover:bg-indigo-800 transition flex items-center gap-2">
                <FaWhatsapp /> WhatsApp
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Channels */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-md text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <FaEnvelope className="text-blue-600 text-xl" />
            </div>
            <h3 className="font-semibold text-gray-800 mb-2">Email Support</h3>
            <p className="text-sm text-gray-500 mb-2">Get a response within 24 hours</p>
            <a href="mailto:support@projecthub.com" className="text-indigo-600 hover:text-indigo-700 text-sm">
              support@projecthub.com
            </a>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-md text-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <FaWhatsapp className="text-green-600 text-xl" />
            </div>
            <h3 className="font-semibold text-gray-800 mb-2">WhatsApp Support</h3>
            <p className="text-sm text-gray-500 mb-2">Fast replies on WhatsApp</p>
            <a href="https://wa.me/1234567890" className="text-indigo-600 hover:text-indigo-700 text-sm">
              +1 234 567 890
            </a>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-md text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <FaTwitter className="text-purple-600 text-xl" />
            </div>
            <h3 className="font-semibold text-gray-800 mb-2">Twitter Support</h3>
            <p className="text-sm text-gray-500 mb-2">Follow and tweet us</p>
            <a href="https://twitter.com/projecthub" className="text-indigo-600 hover:text-indigo-700 text-sm">
              @ProjectHub
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpCenter;