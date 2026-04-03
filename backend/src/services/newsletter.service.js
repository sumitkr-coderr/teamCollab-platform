import sendEmail from "../utils/mailer.js";

export const subscribeUser = async (email) => {
  const html = `
    <h2>Welcome 🚀</h2>
    <p>Thanks for subscribing to <b>TeamCollab</b>!</p>
    <p>You will now receive updates and features.</p>
  `;

  await sendEmail(
    email,
    "🎉 Welcome to TeamCollab Newsletter",
    html
  );

  return { message: "Subscription successful! Check your email." };
};