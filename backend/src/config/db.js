import { Sequelize } from "sequelize";

const isRailway = !!process.env.MYSQLHOST;

export const sequelize = new Sequelize(
  isRailway ? process.env.MYSQLDATABASE : process.env.DB_NAME,
  isRailway ? process.env.MYSQLUSER : process.env.DB_USER,
  isRailway ? process.env.MYSQLPASSWORD : process.env.DB_PASSWORD,
  {
    host: isRailway ? process.env.MYSQLHOST : process.env.DB_HOST,
    port: isRailway ? process.env.MYSQLPORT : undefined,
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


