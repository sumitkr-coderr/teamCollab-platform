import { subscribeUser } from "../services/newsletter.service.js";

export const subscribe = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: "Email is required" });
    }
    const result = await subscribeUser(email);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    console.error("Error subscribing to newsletter:", error);
    res.status(500).json({ success: false, message: "Subscription failed" });
  }
};
