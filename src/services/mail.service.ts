import { injectable, inject } from "inversify";
import { MailRepository, MailOptions } from "../repositories/mail.repo";

@injectable()   // 🔥 Make MailService injectable
export class MailService {
  constructor(
    @inject(MailRepository) private mailRepository: MailRepository
  ) {}

  async sendWelcomeEmail(email: string, subject: string): Promise<void> {
    const html = `<h1>Welcome!</h1><p>Thank you for joining us.</p>`;

    const mailOptions: MailOptions = {
      to: email,
      subject,
      html
    };

    await this.mailRepository.sendMail(mailOptions);
  }
}



