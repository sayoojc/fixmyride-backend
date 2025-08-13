import { Container } from "inversify";
import { TYPES } from "../../types";
import { ProviderSlotController } from "../../../controllers/provider/slot.controller";
import { ProviderSlotService } from "../../../services/provider/slot.service";
import { IProviderSlotController } from "../../../interfaces/controllers/provider/IProviderSlotController";
import { IProviderSlotService } from "../../../interfaces/services/provider/IproviderSlotService";
import { ISlotRepository } from "../../../interfaces/repositories/ISlotRepository";

export const bindProviderSlotModule = (container: Container) => {
  container
    .bind<IProviderSlotService>(TYPES.ProviderSlotService)
    .toDynamicValue(() => {
      const slotRepo = container.get<ISlotRepository>(
        TYPES.SlotRepository
      );
    
      return new ProviderSlotService(slotRepo);
    })
    .inSingletonScope();

  container
    .bind<IProviderSlotController>(TYPES.ProviderSlotController)
    .to(ProviderSlotController)
    .inSingletonScope();
};
