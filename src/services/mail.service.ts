import { injectable, inject } from "inversify";
import { MailRepository, MailOptions } from "../repositories/mail.repo";

@injectable()   
export class MailService {
  constructor(
    @inject(MailRepository) private mailRepository: MailRepository
  ) {}

  async sendWelcomeEmail(email: string, subject: string,html:string): Promise<void> {
   

    const mailOptions: MailOptions = {
      to: email,
      subject,
      html
    };

    await this.mailRepository.sendMail(mailOptions);
  }
}



