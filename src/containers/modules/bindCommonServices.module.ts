 
 import { Container } from "inversify";
 import {TYPES} from '../types'
 import { MailService } from "../../services/mail.service";
 import { IMailService } from "../../interfaces/services/IMailService";
 import { IMailRepository } from "../../interfaces/repositories/IMailRepository";
 
 export const bindCommonServiceModule = (container : Container) => {
 container.bind<IMailService>(TYPES.MailService).toDynamicValue(() => {
    return new MailService();
  }).inSingletonScope();
 }
 
