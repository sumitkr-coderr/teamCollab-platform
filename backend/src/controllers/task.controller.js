import { createTaskService, 
  getTasksByProjectService,updateTaskStatusService, assignTaskService, deleteTaskService, updateTaskService,
  findTaskService, findAllTasksService } from "../services/task.service.js";
// notification/broadcast responsibilities have been moved into the service layer

export const createTask = async (req, res) => {
  try {
    const { title, description, projectId } = req.body;

    if (!title || !projectId) {
      return res.status(400).json({
        success: false,
        message: "Task title and projectId are required",
      });
    }

    const task = await createTaskService({
      title,
      description,
      projectId,
      userId: req.user.id,
    });


    res.status(201).json({
      success: true,
      message: "Task created successfully",
      data: task,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const getTasksByProject = async (req, res) => {
  try {
    const { projectId } = req.params;

    const tasks = await getTasksByProjectService(projectId);

    // read activity logging moved to service if necessary

    res.status(200).json({
      success: true,
      data: tasks,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch tasks",
    });
  }
};

export const updateTaskStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const { taskId } = req.params;

    if (!["todo", "in_progress", "done"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid task status",
      });
    }

    const task = await updateTaskStatusService(taskId, status, req.user?.id);

    res.status(200).json({
      success: true,
      message: "Task status updated",
      data: task,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const assignTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "userId is required",
      });
    }

    const task = await assignTaskService(taskId, userId);


    res.status(200).json({
      success: true,
      message: "Task assigned successfully",
      data: task,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const deleteTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    await deleteTaskService(taskId, req.user?.id);

    res.status(200).json({
      success: true,
      message: "Task deleted successfully",
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const updateTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { title, description } = req.body;

    const task = await updateTaskService(taskId, { title, description }, req.user?.id);

    res.status(200).json({
      success: true,
      message: "Task updated successfully",
      data: task,
    });
  } 
  catch (error) {
    res.status(400).json({
      success: false, 
      message: error.message,
    });
  }
};

export const findTask = async (req, res) => {
  try {
    const task = await findTaskService();

    // read-only logging removed from controller

    res.status(200).json({
      success: true,
      data: task,
    });
  } catch (error) {
    res.status(400).json({
      success: false, 
      message: error.message,
    });
  }
};

export const findAllTasks = async (req, res) => {
  try {
    const tasks = await findAllTasksService();
    res.status(200).json({
      success: true,
      data: tasks,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};