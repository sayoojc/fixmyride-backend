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
      from: process.env.EMAIL_USER,
      to: options.to,                 
      subject: options.subject,        
      text: options.text,              
      html: options.html,              
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
