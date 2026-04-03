import { DataTypes } from "sequelize";

const Project = (sequelize) => {
  return sequelize.define(
    "Project",
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
      deadline:{
        type: DataTypes.DATE,

      },
      description: {
        type: DataTypes.TEXT,
      },
    },
    {
      tableName: "projects",
      timestamps: true,
    }
  );
};

export default Project;
