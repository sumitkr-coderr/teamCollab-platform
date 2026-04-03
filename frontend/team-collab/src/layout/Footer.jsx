import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import {
  FaHeart,
  FaGithub,
  FaTwitter,
  FaLinkedin,
  FaEnvelope,
  FaArrowUp,
  FaCopyright,
  FaPaperPlane,
  FaCheckCircle,
  FaExclamationCircle
} from "react-icons/fa";
import API from "../services/api";

const Footer = () => {
  const location = useLocation();
  const currentYear = new Date().getFullYear();

  const [email, setEmail] = useState("");
  const [subscribing, setSubscribing] = useState(false);
  const [subscribeStatus, setSubscribeStatus] = useState(null);
  const [subscribeMessage, setSubscribeMessage] = useState("");

  const hideFooterPaths = ["/login", "/register", "/forgot-password"];
  if (hideFooterPaths.includes(location.pathname)) return null;

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSubscribe = async (e) => {
    e.preventDefault();

    if (subscribing) return; // prevent spam clicks

    // Validation
    if (!email.trim()) {
      return showMessage("error", "Please enter your email address");
    }

    if (!validateEmail(email)) {
      return showMessage("error", "Please enter a valid email");
    }

    try {
      setSubscribing(true);
      setSubscribeStatus(null);

      const res = await API.post("/newsletter/subscribe", { email });

      showMessage(
        "success",
        res?.data?.message || "Subscribed successfully 🎉"
      );

      setEmail("");

    } catch (err) {
      console.error(err);

      const msg =
        err.response?.data?.message ||
        "Server error. Try again later.";

      showMessage("error", msg);

    } finally {
      setSubscribing(false);
    }
  };

  const showMessage = (type, message) => {
    setSubscribeStatus(type);
    setSubscribeMessage(message);

    setTimeout(() => {
      setSubscribeStatus(null);
      setSubscribeMessage("");
    }, 4000);
  };

  return (
    <>
      {/* Scroll Button */}
      <button
        onClick={scrollToTop}
        className="fixed bottom-6 right-6 bg-indigo-600 hover:bg-indigo-700 text-white p-3 rounded-full shadow-lg hover:scale-110 transition-all duration-300 z-50"
      >
        <FaArrowUp />
      </button>

      <footer className="bg-gradient-to-r from-gray-900 to-gray-800 text-white mt-auto border-t border-gray-700">
        <div className="max-w-7xl mx-auto px-6 py-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">

            {/* Brand */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="font-bold">T</span>
                </div>
                <span className="text-xl font-bold text-indigo-400">
                  TeamCollab
                </span>
              </div>

              <p className="text-gray-400 text-sm leading-relaxed">
                Manage projects, collaborate with teams, and track progress.
              </p>

              <div className="flex gap-3 mt-4">
                {[FaGithub, FaTwitter, FaLinkedin, FaEnvelope].map(
                  (Icon, i) => (
                    <div
                      key={i}
                      className="w-9 h-9 bg-gray-700 hover:bg-indigo-600 flex items-center justify-center rounded-full cursor-pointer hover:scale-110 transition-all duration-300"
                    >
                      <Icon size={14} />
                    </div>
                  )
                )}
              </div>
            </div>

            {/* Links */}
            <div>
              <h3 className="font-semibold mb-3">Quick Links</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link to="/dashboard">Dashboard</Link></li>
                <li><Link to="/teams">Teams</Link></li>
                <li><Link to="/mytasks">Tasks</Link></li>
              </ul>
            </div>

            {/* Resources */}
            <div>
              <h3 className="font-semibold mb-3">Resources</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link to="/help">Help Center</Link></li>
                <li><Link to="/docs">Docs</Link></li>
              </ul>
            </div>

            {/* Newsletter */}
            <div>
              <h3 className="font-semibold mb-3">Stay Updated</h3>
              <p className="text-gray-400 text-sm mb-3">
                Get updates & features.
              </p>

              <form onSubmit={handleSubscribe} className="space-y-3">
                <div className="flex">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Your email"
                    disabled={subscribing}
                    className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-l-md text-sm focus:outline-none"
                  />

                  <button
                    type="submit"
                    disabled={subscribing}
                    className="bg-indigo-600 px-4 rounded-r-md flex items-center gap-1"
                  >
                    {subscribing ? (
                      <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                    ) : (
                      <FaPaperPlane size={12} />
                    )}
                    <span>
                      {subscribing ? "Sending..." : "Subscribe"}
                    </span>
                  </button>
                </div>

                {/* Message */}
                {subscribeStatus && (
                  <div className={`flex items-center gap-2 text-sm p-2 rounded-md ${
                    subscribeStatus === "success"
                      ? "bg-green-500/20 text-green-400"
                      : "bg-red-500/20 text-red-400"
                  }`}>
                    {subscribeStatus === "success" ? (
                      <FaCheckCircle />
                    ) : (
                      <FaExclamationCircle />
                    )}
                    {subscribeMessage}
                  </div>
                )}
              </form>
            </div>
          </div>

          {/* Bottom */}
          <div className="border-t border-gray-700 mt-10 pt-6 flex justify-between text-sm text-gray-400">
            <div className="flex items-center gap-2">
              <FaCopyright size={12} />
              {currentYear} TeamCollab
            </div>

            <div className="flex items-center gap-2">
              Made with <FaHeart className="text-red-500" /> by Sumit
            </div>

            <div>v1.0.0</div>
          </div>
        </div>
      </footer>
    </>
  );
};

export default Footer;