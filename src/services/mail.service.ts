import { injectable, inject } from "inversify";
import { MailRepository} from "../repositories/mail.repo";
import { MailOptions } from "../interfaces/mail.interface";

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



