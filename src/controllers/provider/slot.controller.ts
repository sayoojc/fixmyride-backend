import { Request, Response } from "express";
import { inject, injectable } from "inversify";
import { TYPES } from "../../containers/types";
import { IProviderSlotController } from "../../interfaces/controllers/provider/IProviderSlotController";
import { IProviderSlotService } from "../../interfaces/services/provider/IproviderSlotService";
import { StatusCode } from "../../enums/statusCode.enum";
import { RESPONSE_MESSAGES } from "../../constants/response.messages";
import {
  GetSlotsResponseDTO,
  getSlotsResponseSchema,
  ErrorResponseDTO,
  UpdateSlotsRequestDTO,
  updateSlotsRequestSchema,
} from "../../dtos/controllers/provider/providerSlot.controller.dto";

@injectable()
export class ProviderSlotController implements IProviderSlotController {
  constructor(
    @inject(TYPES.ProviderSlotService)
    private readonly _providerSlotService: IProviderSlotService
  ) {}
  async getSlots(
    req: Request,
    res: Response<GetSlotsResponseDTO | ErrorResponseDTO>
  ): Promise<void> {
    try {
      console.log('the get slots controller called');
      if (!req.userData) {
        return;
      }
      const id = req.userData.id;
      if (!id) {
        res.status(StatusCode.UNAUTHORIZED).json({
          success: false,
          message: RESPONSE_MESSAGES.UNAUTHORIZED,
        });
        return;
      }
      const slots = await this._providerSlotService.getSlots(id);
      console.log("the slots from the controller", slots);
      const response = {
        success: true,
        message: RESPONSE_MESSAGES.RESOURCE_FETCHED("Slots"),
        slots,
      };
      const validate = getSlotsResponseSchema.safeParse(response);
      if (!validate.success) {
      }
      res.status(StatusCode.OK).json(response);
    } catch (error) {
      res.status(StatusCode.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR,
      });
    }
  }
  async updateSlots(
    req: Request<{}, {}, UpdateSlotsRequestDTO>,
    res: Response
  ): Promise<void> {
    try {
      if (!req.userData) {
        return;
      }
      console.log("the update slot");
      const id = req.userData.id;
      const reqValidate = updateSlotsRequestSchema.safeParse(req.body);
      if (!reqValidate.success) {
        console.log("the slot validation failed", reqValidate.error.message);
        res
          .status(StatusCode.BAD_REQUEST)
          .json({ success: false, message: RESPONSE_MESSAGES.INVALID_INPUT });
        return;
      }
      console.log('the request body ',req.body);
      
      const updatedSlots = await this._providerSlotService.updateSlots(
        id,
        reqValidate.data?.weeklySlots
      );
      res.status(StatusCode.OK).json({
        success: true,
        message: RESPONSE_MESSAGES.RESOURCE_UPDATED("Slots"),
        slots: updatedSlots,
      });
    } catch (error) {
      res.status(StatusCode.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR,
      });
    }
  }
}
