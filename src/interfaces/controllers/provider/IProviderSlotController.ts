import { Request, Response } from "express";
import {
  GetSlotsResponseDTO,
  ErrorResponseDTO,
  UpdateSlotsRequestDTO
} from "../../../dtos/controllers/provider/providerSlot.controller.dto";
export interface IProviderSlotController {
  getSlots(
    req: Request,
    res: Response<GetSlotsResponseDTO | ErrorResponseDTO>
  ): Promise<void>;
  updateSlots(req: Request<{},{},UpdateSlotsRequestDTO>, res: Response): Promise<void>;
}
