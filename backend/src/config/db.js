import { Sequelize } from "sequelize";

// export const sequelize = new Sequelize(
//   process.env.DB_NAME,
//   process.env.DB_USER,
//   process.env.DB_PASSWORD,
//   {
//     host: process.env.DB_HOST,
//     dialect: "mysql",
//     logging: false, // disable SQL logs (enable in dev if needed)
//   }
// );

export const sequelize = new Sequelize(
  process.env.DB_NAME || "team_collaboration_db",
  process.env.DB_USER || "root",
  process.env.DB_PASSWORD || "",
  {
    host: process.env.DB_HOST || "localhost",
    dialect: "mysql",
    logging: false,
  }
);

export const connectDB = async () => {
  try {
    await sequelize.authenticate();
  } catch (error) {
    console.error("❌ Unable to connect to MySQL:", error.message);
    process.exit(1);
  }
};


