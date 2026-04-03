import db from "../models/index.js";
import { broadcast } from "../utils/socketNotifier.js";

const { Project } = db;
const { Team } = db;
const { Task     } = db;


export const getDashboardOverview = async (req, res) => {
  try {
    const totalTeams = await Team.count();
    const totalProjects = await Project.count();
    const totalTasks = await Task.count();
    const pendingTasks = await Task.count({
      where: { status: "pending" },
    });

    const recentTasks = await Task.findAll({
      order: [["createdAt", "DESC"]],
      limit: 3,
      attributes: ["id", "title", "createdAt"],
    });

    const activities = recentTasks.map((task) => ({
      id: task.id,
      message: `Task "${task.title}" was created`,
      time: task.createdAt,
    }));

    // notify that user looked at dashboard
    await broadcast("activity", {
      userId: req.user?.id,
      message: `${req.user?.name || req.user?.id} viewed dashboard overview`,
    });

    res.json({
      totalTeams,
      totalProjects,
      totalTasks,
      pendingTasks,
      activities,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};
