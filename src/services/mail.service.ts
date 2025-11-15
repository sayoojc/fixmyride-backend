import { injectable, inject } from "inversify";
import { MailOptions } from "../interfaces/mail.interface";
import transporter from "../config/mailConfig";

@injectable()   
export class MailService {
  constructor(
  ) {}

  async sendWelcomeEmail(email: string, subject: string,html:string): Promise<void> {

    const mailOptions: MailOptions = {
      from:process.env.EMAIL_USER!,
      to: email,
      subject,
      html
    };
     try {
      await transporter.sendMail(mailOptions);
      console.log(`Email sent to ${mailOptions.to}`);
    } catch (error) {
      console.error("Error sending email:", error);
      throw new Error("Email sending failed");
    }

   
  }
}



