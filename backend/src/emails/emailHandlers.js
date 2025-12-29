import { transporter } from "../lib/mail.js";
import { createWelcomeEmailTemplate } from "./WelcomeemailTemplate.js";
import { createOTPEmailTemplate } from "./OTPEmailTemplate.js";
import { ENV } from "../lib/env.js";

export const sendWelcomeEmail = async (email, name, clientURL) => {
  try {
    await transporter.sendMail({
      from: `"Team 24 of IT4409" <${ENV.EMAIL_USER}>`, 
      to: email,
      subject: "Welcome to ChatWeb",
      html: createWelcomeEmailTemplate(name, clientURL), 
    });
    console.log("Welcome Email has been successfully sent.");
  } catch (error) {
    console.error("Error sent welcome email:", error);
  }
};

export const sendOTPEmail = async (email, name, otp) => {
  try {
    await transporter.sendMail({
      from: `"Team 24 of IT4409" <${ENV.EMAIL_USER}>`,
      to: email,
      subject: "OTP code to reset your password",
      html: createOTPEmailTemplate(name, otp),
    });
  } catch (error) {
    console.error("Error sent mail OTP:", error);
    throw new Error("Can't sent email OTP");
  }
};