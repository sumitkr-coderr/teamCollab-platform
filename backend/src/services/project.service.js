import db from "../models/index.js";
import { broadcast, notifyRoom } from "../utils/socketNotifier.js";

const { Project, Team, Task } = db;

export const createProjectService = async ({name,description,teamId,userId,deadline}) => {
  const team = await Team.findByPk(teamId);
  if (!team) {
    throw new Error("Team not found");
  }

  const project = await Project.create({name,description,teamId,createdBy: userId,deadline});

  // notify team members that a new project was created
  await notifyRoom(`project_${project.id}`, "activity", {
    userId,
    message: `Project \"${project.name}\" created in team ${teamId}`,
  }, true);

  return project;
};

export const getProjectsByTeamService = async (teamId) => {
  return await Project.findAll({
    where: { teamId },
    attributes: ["id", "name", "description", "createdAt","deadline"],
    order: [["createdAt", "DESC"]],
    
  });
};


export const updateProjectService = async (projectId, { name, description, deadline }, userId,) => {
  const project = await Project.findByPk(projectId);
  if (!project) {
    throw new Error("Project not found");
  }
  project.name = name || project.name;
  project.description = description || project.description;
  project.deadline = deadline || project.deadline;
  await project.save();

  await broadcast("activity", {
    userId,
    message: `${userId} updated project "${project.name}"`,
    persist: true,
  });

  return project;
} 

export const deleteProjectService = async (projectId, userId) => {
  const project = await Project.findByPk(projectId);
  if (!project) {
    throw new Error("Project not found");
  }
  await project.destroy();

  await broadcast("activity", {
    userId,
    message: `${userId} deleted project ${projectId}`,
    persist: true,
  });

  return true;
}

export const findAllProjectsService = async (teamId) => {
  return await Project.findAll({
    where: { teamId },
    attributes: ["id", "name", "description", "createdAt","deadline"],
    order: [["createdAt", "DESC"]],
  });
};



