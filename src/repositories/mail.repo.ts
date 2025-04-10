import { injectable } from "inversify";
import transporter from "../config/mailConfig";  // Your nodemailer config

export interface MailOptions {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}

@injectable()
export class MailRepository {
  async sendMail(options: MailOptions): Promise<void> {
    const mailOptions = {
      from: process.env.EMAIL_USER,    // Sender email
      to: options.to,                  // Receiver email
      subject: options.subject,        // Email subject
      text: options.text,              // Plain text content (optional)
      html: options.html,              // HTML content (optional)
    };

    try {
      await transporter.sendMail(mailOptions);  // Send email
      console.log(`Email sent to ${options.to}`);
    } catch (error) {
      console.error("Error sending email:", error);
      throw new Error("Email sending failed");
    }
  }
}
