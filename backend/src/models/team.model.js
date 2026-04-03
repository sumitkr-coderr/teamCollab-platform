import { DataTypes } from "sequelize";

const Team = (sequelize) => {
  const TeamModel = sequelize.define(
    "Team",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },

      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      tableName: "teams",
      timestamps: true,
    }
  );

  return TeamModel;
};

export default Team;
