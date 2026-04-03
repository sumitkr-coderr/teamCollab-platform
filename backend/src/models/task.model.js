import { DataTypes } from "sequelize";

const Task = (sequelize) => {
  return sequelize.define(
    "Task",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },

      title: {
        type: DataTypes.STRING,
        allowNull: false,
      },

      description: {
        type: DataTypes.TEXT,
      },

      status: {
        type: DataTypes.ENUM("todo", "in_progress", "done"),
        defaultValue: "todo",
      },
      assignedTo: {
  type: DataTypes.INTEGER,
  allowNull: true
}
    },
    {
      tableName: "tasks",
      timestamps: true,
    },
    
  );
};

export default Task;
