import { DataTypes } from "sequelize";

const TeamMember = (sequelize) => {
  const TeamMemberModel = sequelize.define(
    "TeamMember",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },

      role: {
        type: DataTypes.ENUM("admin", "manager", "member"),
        defaultValue: "member",
      },
    },
    {
      tableName: "team_members",
      timestamps: true,
    }
  );

  return TeamMemberModel;
};

export default TeamMember;
