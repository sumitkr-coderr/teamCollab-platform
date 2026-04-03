import db from "../models/index.js";
import { broadcast } from "../utils/socketNotifier.js";

const { Team, User, Project, Notification } = db;

export const createTeamService = async ({ name, userId }) => {
  const team = await Team.create({
    name,
    createdBy: userId,
  });
const notification = await Notification.create({
    userId,
    message: `Team "${team.name}" has been created`,
    type: "TEAM_CREATED",
  });
  // send a persisted activity message for everyone
  await broadcast("activity", {
    userId,
    message: `Team "${team.name}" has been created`,
    persist: true,
  });

  return team;
};

export const getMyTeamsService = async (userId) => {
  return await Team.findAll({
    where: { createdBy: userId },
    attributes: ["id", "name", "createdAt"],
  });
};

export const getTeamByIdService = async (teamId) => {
  return await Team.findByPk(teamId, {
    attributes: ["id", "name", "createdAt"],
    include: [
      {
        model: User,
        as: "members",
        attributes: ["id", "name", "email","avatar"],
        through: {
          attributes: ["role"], // from TeamMember
        },
      },
      {
        model: Project,
        as: "Projects",
        attributes: ["id", "name", "createdAt"],
      }
    ],
  });
};

export const updateTeamService = async (teamId, { name }, userId) => {
  const team = await Team.findByPk(teamId);
  if (!team) {
    throw new Error("Team not found");
  }
  await team.update({ name });

  // broadcast update event and persist for all users
  await broadcast("activity", {
    userId,
    message: `${userId} updated team "${team.name}"`,
    persist: true,
  });

  return team;
};

export const deleteTeamService = async (teamId, userId) => {
  const team = await Team.findByPk(teamId);
  if (!team) {
    throw new Error("Team not found");
  }
  await team.destroy();

  await broadcast("activity", {
    userId,
    message: `${userId} deleted team ${teamId}`,
    persist: true,
  });

  return;
};