export interface IMailService {
  sendWelcomeEmail(email: string, subject: string, html: string): Promise<void>;
}
