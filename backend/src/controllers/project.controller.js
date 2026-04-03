import { createProjectService , getProjectsByTeamService, updateProjectService, deleteProjectService, findAllProjectsService} from "../services/project.service.js";
// broadcast/persist logic moved into service layer

export const createProject = async (req, res) => {
  try {
    const { name, description, teamId, deadline } = req.body;

    if (!name || !teamId) {
      return res.status(400).json({
        success: false,
        message: "Project name and teamId are required",
      });
    }

    const project = await createProjectService({
      name,
      description,
      teamId,
      userId: req.user.id,
      deadline,
    });

    res.status(201).json({
      success: true,
      message: "Project created successfully",
      data: project,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const getProjectsByTeam = async (req, res) => {
  try {
    const { teamId } = req.params;

    const projects = await getProjectsByTeamService(teamId);

    // read activity logging has been removed from controller

    res.status(200).json({
      success: true,
      data: projects,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch projects",
    });
  }
};

export const updateProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { name, description, deadline } = req.body;
    const updatedProject = await updateProjectService(projectId, { name, description, deadline }, req.user.id);

    res.status(200).json({
      success: true,  
      message: "Project updated successfully",
      data: updatedProject,
    });
  }
    catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  } 
};

export const deleteProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    await deleteProjectService(projectId, req.user.id);

    res.status(200).json({
      success: true,
      message: "Project deleted successfully",
    });
  } 
  catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const getAllProjects = async (req, res) => {
  try {
    const { teamId } = req.params;
    const projects = await findAllProjectsService(teamId);
    res.status(200).json({
      success: true,
      data: projects,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch projects",
    });
  }
};
