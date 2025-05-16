import { MailOptions } from "../mail.interface";

export interface IMailRepository {
  sendMail(options: MailOptions): Promise<void>;
}