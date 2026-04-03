import { createTeamService, getMyTeamsService,  getTeamByIdService, updateTeamService, deleteTeamService } from "../services/team.service.js";
// notification broadcasts have been moved into service layer

export const createTeam = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Team name is required",
      });
    }

    const team = await createTeamService({
      name,
      userId: req.user.id,
    });

    res.status(201).json({
      success: true,
      message: "Team created successfully",
      data: team,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to create team",
    });
  }
};

export const getMyTeams = async (req, res) => {
  try {
    const teams = await getMyTeamsService(req.user.id);

    res.status(200).json({
      success: true,
      data: teams,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch teams",
    });
  }
};

export const getTeamById = async (req, res) => {
  try {
    const team = await getTeamByIdService(req.params.id);

    if (!team) {
      return res.status(404).json({
        success: false,
        message: "Team not found",
      });
    }

    res.status(200).json({
      success: true,
      data: team,
    });
  } catch (error) {
    console.log("GET TEAM ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch team",
    });
  }
};

export const updateTeam = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Team name is required",
      });
    }
    const team = await updateTeamService(req.params.id, { name }, req.user.id);

    res.status(200).json({  
      success: true,
      message: "Team updated successfully",
      data: team,
    });
  } catch (error) {
    console.log("UPDATE TEAM ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update team",
    });
  }
};

export const deleteTeam = async (req, res) => {
  try {
    await deleteTeamService(req.params.id, req.user.id);

    res.status(200).json({
      success: true,
      message: "Team deleted successfully",
    });
  } catch (error) {
    console.log("DELETE TEAM ERROR:", error);
    res.status(500).json({  
      success: false,
      message: "Failed to delete team",
    });
  } 
};