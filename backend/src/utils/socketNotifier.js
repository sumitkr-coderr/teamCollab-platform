import { getIO } from "../config/socket.js";
import db from "../models/index.js";

/**
 * Broadcast an event to all connected sockets.
 * If payload.persist === true and payload.message exists we also
 * persist the message as a Notification for every user and emit a
 * "notification" event (personal room) so that the clients can show it.
 */
export const broadcast = async (event, payload) => {
  try {
    const io = getIO();
    io.emit(event, payload);

    // optional persistence behaviour
    if (payload && payload.persist && payload.message) {
      // create a notification record for each user in the system
      try {
        const users = await db.User.findAll({ attributes: ["id"] });
        const ops = users.map((u) =>
          db.Notification.create({
            userId: u.id,
            type: payload.type || "ACTIVITY",
            message: payload.message,
          })
        );
        await Promise.all(ops);

        // also send a realtime notification to everyone in their personal room
        users.forEach((u) => {
          io.to(`user_${u.id}`).emit("notification", {
            type: payload.type || "ACTIVITY",
            message: payload.message,
          });
        });
      } catch (err) {
        console.warn("Failed to persist broadcast notification:", err.message);
      }
    }
  } catch (err) {
    console.warn("Socket emit failed:", err.message);
  }
};

/**
 * Send an event to a specific user.  If the event is "notification" we
 * also persist the payload to that user's notifications table.
 */
export const notifyUser = async (userId, event, payload) => {
  try {
    const io = getIO();
    io.to(`user_${userId}`).emit(event, payload);

    if (event === "notification" && payload && payload.message) {
      try {
        await db.Notification.create({
          userId,
          type: payload.type || "SYSTEM",
          message: payload.message,
        });
      } catch (err) {
        console.warn("Failed to persist notifyUser notification:", err.message);
      }
    }
  } catch (err) {
    console.warn("Socket notifyUser failed:", err.message);
  }
};

/**
 * Emit an event to everyone in a given room.  If `persist` is true the helper
 * will also create notification records for the users that logically belong
 * to the room and emit a `notification` event to their personal rooms.  The
 * logic currently knows about `project_<id>` rooms (notifies all team
 * members) and `user_<id>` rooms (single user).  Other room prefixes are
 * ignored for persistence.
 */
export const notifyRoom = async (room, event, payload, persist = false) => {
  try {
    const io = getIO();
    io.to(room).emit(event, payload);
  } catch (err) {
    console.warn("Socket notifyRoom failed:", err.message);
  }

  if (persist && payload && payload.message) {
    try {
      let userIds = [];
      if (room.startsWith("project_")) {
        const projectId = room.split("_")[1];
        // lookup team members for this project
        const project = await db.Project.findByPk(projectId, {
          include: [
            {
              model: db.Team,
              include: [
                {
                  model: db.User,
                  as: "members",
                  attributes: ["id"],
                  through: { attributes: [] },
                },
              ],
            },
          ],
        });
        if (project && project.Team && project.Team.members) {
          userIds = project.Team.members.map((u) => u.id);
        }
      } else if (room.startsWith("user_")) {
        const id = room.split("_")[1];
        userIds = [id];
      }

      const io = getIO();
      const ops = userIds.map((uid) =>
        db.Notification.create({ userId: uid, type: payload.type || "ACTIVITY", message: payload.message })
      );
      await Promise.all(ops);
      userIds.forEach((uid) => {
        io.to(`user_${uid}`).emit("notification", {
          type: payload.type || "ACTIVITY",
          message: payload.message,
        });
      });
    } catch (err) {
      console.warn("Failed to persist room notification:", err.message);
    }
  }
};
