import { addTeamMemberService, removeTeamMemberService, getTeamMembersService } from "../services/teamMember.service.js";
// notification persistence moved into service layer

export const addTeamMember = async (req, res) => {
  try {
    const { teamId, userId, role } = req.body;

    if (!teamId || !userId) {
      return res.status(400).json({
        success: false,
        message: "teamId and userId are required",
      });
    }

    const member = await addTeamMemberService({
      teamId,
      userId,
      role,
    }, req.user?.id);

    res.status(201).json({
      success: true,
      message: "Member added to team",
      data: member,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};


export const removeTeamMember = async (req, res) => {
  try {
    const { teamId, userId } = req.body;  
    const result = await removeTeamMemberService({ teamId, userId }, req.user?.id);

    res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const getTeamMembers = async (req, res) => {
  try {
    const { teamId } = req.params;
    const members = await getTeamMembersService(teamId);
    res.status(200).json({
      success: true,
      data: members,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    }); 
  }
};

