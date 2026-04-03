import db from "../models/index.js";
import { getIO } from "../config/socket.js";
import { broadcast, notifyRoom } from "../utils/socketNotifier.js";
import e from "cors";

const { Task, Project,User, Notification   } = db;

export const createTaskService = async ({
  title,
  description,
  projectId,
  userId,
}) => {
  const project = await Project.findByPk(projectId);
  if (!project) {
    throw new Error("Project not found");
  }

  const task = await Task.create({
    title,
    description,
    projectId,
    createdBy: userId,
  });

  // persist notification to all project members via room helper
  await notifyRoom(`project_${projectId}`, "activity", {
    userId,
    message: `${userId} created task "${task.title}" in project ${projectId}`,
  }, true);

  return task;
};

export const getTasksByProjectService = async (projectId) => {
  return await Task.findAll({
    where: { projectId },
    attributes: ["id", "title", "description", "status", "createdAt","assignedTo"],
    order: [["createdAt", "DESC"]],
    include: [
      {
        model: User,    
        as: "assignee",
        attributes: ["id", "name", "email", "avatar"],
      },
    ],  
  });
};

export const updateTaskStatusService = async (taskId, status, userId) => {
  const task = await Task.findByPk(taskId);

  if (!task) {
    throw new Error("Task not found");
  }

  task.status = status;
  await task.save();

  await broadcast("activity", {
    userId,
    message: `${userId} updated status of task "${task.title}" to "${task.status}"`,
    persist: true,
  });

  return task;
};

export const assignTaskService = async (taskId, userId) => {
  const task = await Task.findByPk(taskId);
  if (!task) {
    throw new Error("Task not found");
  }

  const user = await User.findByPk(userId);
  if (!user) {
    throw new Error("User not found");
  }

  task.assignedTo = userId;
  await task.save();

   await Notification.create({
  type: "TASK_ASSIGNED",
  message: `: ${task.title}`,
  userId: userId,
});


  // 🔔 Emit real-time notification
  const io = getIO();

  io.to(`user_${userId}`).emit("notification", {
    type: "TASK_ASSIGNED",
    message: `: ${task.title}`,
    taskId: task.id,
  });

  return task;
};

export const deleteTaskService = async (taskId, userId) => {
  const task = await Task.findByPk(taskId);
  if (!task) {
    throw new Error("Task not found");
  }
  await task.destroy();

  await broadcast("activity", {
    userId,
    message: `${userId} deleted task ${taskId}`,
    persist: true,
  });

  return true;
};

export const updateTaskService = async (taskId, { title, description }, userId) => {
  const task = await Task.findByPk(taskId);
  if (!task) {
    throw new Error("Task not found");
  }

  task.title = title ?? task.title;
  task.description = description ?? task.description;

  await task.save();

  await broadcast("activity", {
    userId,
    message: `${userId} updated task "${task.title}"`,
    persist: true,
  });

  return task;
  } 

  export const findTaskService = async () => {
  const task = await Task.findAll( {
    attributes: ["id", "title", "description", "status", "createdAt","assignedTo"],
    include: [
      {
        model: User,
        as: "assignee",
        attributes: ["id", "name", "email", "avatar"],
      },
      {
        model: Project,
        as: "Projects",
        attributes: ["id", "name"],
      }
    ],
  });
  if (!task) {
    throw new Error("Task not found");
  }
  return task;
};

export const findAllTasksService = async () => {
  const tasks = await Task.findAll({
    attributes: ["id", "title", "description", "status", "createdAt","assignedTo"], 
    include: [
      {
        model: User,
        as: "assignee",
        attributes: ["id", "name", "email", "avatar"],
      },
      {
        model: Project,
        as: "Projects",
        attributes: ["id", "name"],
      }
    ],
  });
  return tasks;
};


