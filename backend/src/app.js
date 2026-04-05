import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import authRoutes from "./routes/auth.routes.js"
import userRoutes from "./routes/user.routes.js";
import teamRoutes from "./routes/team.routes.js";
import teamMemberRoutes from "./routes/teamMember.routes.js";
import projectRoutes from "./routes/project.routes.js";
import taskRoutes from "./routes/task.routes.js"; 
import dashboardRoutes from "./routes/dashboard.routes.js";
import notificationRoutes from "./routes/notification.routes.js";
import newsletterRoutes from "./routes/newsletter.routes.js";
const app = express();



app.use(helmet({
    crossOriginResourcePolicy: false,
  }));

app.use(cors({
  origin: "http://localhost:5173",origin: [
    "http://localhost:5173",
    "https://your-app.vercel.app"
  ],
  methods: ["GET", "POST", "PUT", "DELETE","PATCH"],
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static("uploads"));

//All routes
app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/teams", teamRoutes);
app.use("/api/team-members", teamMemberRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/newsletter", newsletterRoutes);
app.use(morgan("dev"));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Too many requests, please try again later.",
});

app.use(limiter);

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Team Collaboration Platform API running securely 🚀",
  });
});

export default app;
