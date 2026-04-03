import { addCommentService,getCommentsByTaskService, } from "../services/comment.service.js";
// service layer handles notifications now

export const addComment = async (req, res) => {
  try {
    const { content, taskId } = req.body;

    if (!content || !taskId) {
      return res.status(400).json({
        success: false,
        message: "content and taskId are required",
      });
    }

    const comment = await addCommentService({
      content,
      taskId,
      userId: req.user.id,
    });

    res.status(201).json({
      success: true,
      message: "Comment added",
      data: comment,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const getCommentsByTask = async (req, res) => {
  try {
    const { taskId } = req.params;

    const comments = await getCommentsByTaskService(taskId);

    // read action logged in service if needed; removed from controller

    res.status(200).json({
      success: true,
      data: comments,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch comments",
    });
  }
};