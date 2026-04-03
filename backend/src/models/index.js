import { sequelize } from "../config/db.js";
import UserModel from "./user.model.js";
import TeamModel from "./team.model.js";
import TeamMemberModel from "./teamMember.model.js";
import Project from "./project.model.js";
import Task from "./task.model.js";
import Notification from "./notification.model.js";
const db = {};

// Initialize models
db.User = UserModel(sequelize);
db.Team = TeamModel(sequelize);
db.TeamMember = TeamMemberModel(sequelize);
db.Project = Project(sequelize);
db.Task = Task(sequelize);
db.Notification = Notification(sequelize);
// One-to-many (User creates Team)
db.User.hasMany(db.Team, { foreignKey: "createdBy" });
db.Team.belongsTo(db.User, { foreignKey: "createdBy" });
    
// Many-to-many (User ↔ Team)
db.User.belongsToMany(db.Team, {through: db.TeamMember,foreignKey: "userId",otherKey: "teamId",as: "teams",});
db.Team.belongsToMany(db.User, {through: db.TeamMember,foreignKey: "teamId",otherKey: "userId",as: "members",});

// Team → Project
db.Team.hasMany(db.Project, { foreignKey: "teamId" });
db.Project.belongsTo(db.Team, { foreignKey: "teamId" });

// Team → TeamMember
db.TeamMember.belongsTo(db.User, { foreignKey: "userId" });
db.User.hasMany(db.TeamMember, { foreignKey: "userId" });

// Team → TeamMember
db.TeamMember.belongsTo(db.Team, { foreignKey: "teamId" });
db.Team.hasMany(db.TeamMember, { foreignKey: "teamId" });

// User → Project (creator)
db.User.hasMany(db.Project, { foreignKey: "createdBy" });
db.Project.belongsTo(db.User, { foreignKey: "createdBy" });

// Project → Task
db.Project.hasMany(db.Task, { foreignKey: "projectId", as: "tasks" });
db.Task.belongsTo(db.Project, { foreignKey: "projectId", as: "Projects" });

// User → Task (creator)
db.User.hasMany(db.Task, { foreignKey: "createdBy" });
db.Task.belongsTo(db.User, { foreignKey: "createdBy" });

db.User.hasMany(db.Task, { foreignKey: "assignedTo", as: "assignedTasks" });
db.Task.belongsTo(db.User, { foreignKey: "assignedTo", as: "assignee" });

// User → Notification
db.User.hasMany(db.Notification, { foreignKey: "userId", as: "notifications" });
db.Notification.belongsTo(db.User, { foreignKey: "userId" , as : "user"});
db.sequelize = sequelize;

export default db;
