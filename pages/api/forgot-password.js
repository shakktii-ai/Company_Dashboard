import User from "../../models/admin"; // Correct import statement
import connectDb from "../../lib/db";
import sendEmail from "../../utils/sendEmail";
import crypto from "crypto"; // For generating a unique reset token
import { addMinutes } from "date-fns"; // For expiry date management

const handler = async (req, res) => {
  if (req.method === "POST") {
    const { email } = req.body;

    try {
      // Ensure the database is connected
      await connectDb();

      // Check if user exists
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      // Generate a reset token (using a secure method like crypto)
      const resetToken = crypto.randomBytes(32).toString("hex");
      const resetTokenExpiry = addMinutes(new Date(), 15); // Token expiry 15 minutes from now

      // Save the token and expiry in the database
      await User.findByIdAndUpdate(user._id, { resetToken, resetTokenExpiry });

      // Create the reset link
      const resetLink = `${process.env.NEXT_PUBLIC_API_URL}/reset-password/${resetToken}`;

      // Email content
      const subject = "Reset Your Password";
      const htmlContent = `
        <p>Hello ${user.name},</p>
        <p>Click the link below to reset your password:</p>
        <a href="${resetLink}">Reset Password</a>
        <p>This link will expire in 15 minutes.</p>
      `;

      // Send email
      await sendEmail(user.email, subject, htmlContent);

      return res.status(200).json({ success: "Password reset email sent successfully!" });
    } catch (error) {
      console.error("Error sending email:", error);
      return res.status(500).json({ error: "Error sending email" });
    }
  } else {
    return res.status(405).json({ error: "Method Not Allowed" });
  }
};

export default handler;