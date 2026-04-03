import db from "../models/index.js";
import { broadcast } from "../utils/socketNotifier.js";

const { TeamMember, Team, User } = db;

export const addTeamMemberService = async ({
  teamId,
  userId,
  role,
}, actorId) => {
  const team = await Team.findByPk(teamId);
  if (!team) {
    throw new Error("Team not found");
  }

  const user = await User.findByPk(userId);
  if (!user) {
    throw new Error("User not found");
  }

  const existingMember = await TeamMember.findOne({
    where: { teamId, userId },
  });

  if (existingMember) {
    throw new Error("User already in team");
  }

  const member = await TeamMember.create({
    teamId,
    userId,
    role: role || "member",
  });

  await broadcast("activity", {
    userId: actorId,
    message: `${actorId} added user ${userId} to team ${teamId}`,
    persist: true,
  });

  return member;
};

export const removeTeamMemberService = async ({ teamId, userId }, actorId) => {
  const team = await Team.findByPk(teamId); 
  if (!team) {
    throw new Error("Team not found");
  }

  const user = await User.findByPk(userId);
  if (!user) {
    throw new Error("User not found");
  }

  const member = await TeamMember.findOne({
    where: { teamId, userId },
  });
  if (!member) {
    throw new Error("User is not a member of the team");
  }

  await member.destroy();

  await broadcast("activity", {
    userId: actorId,
    message: `${actorId} removed user ${userId} from team ${teamId}`,
    persist: true,
  });

  return { message: "Member removed from team" };
};

export const getTeamMembersService = async (teamId) => {
 const team = await Team.findByPk(teamId, {
  include: [
    {
      model: User,
      as: "members",
      attributes: ["id", "name", "email", "avatar"],
    },
  ],
});
  if (!team) {
    throw new Error("Team not found");
  }

  const members = await TeamMember.findAll({
    where: { teamId },
    include: [{ model: User, attributes: ["id", "name", "email", "avatar"] }],
  }); 
  return members;
};