import { Request, Response } from "express";
import { inject, injectable } from "inversify";
import { TYPES } from "../../containers/types";
import { IUserProviderService } from "../../interfaces/services/user/IUserProviderService";
import { IUserProviderController } from "../../interfaces/controllers/user/IUserProviderController";
import {
  IFetchProviderResponseDTO,
  ErrorResposnseDTO,
  FetchProviderResponseSchema,
} from "../../dtos/controllers/user/userProvider.controller.dto";
import { RESPONSE_MESSAGES } from "../../constants/response.messages";
import { StatusCode } from "../../enums/statusCode.enum";

@injectable()
export class UserProviderController implements IUserProviderController {
  constructor(
    @inject(TYPES.UserProviderService)
    private readonly _userProviderService: IUserProviderService
  ) {}
  async getProviders(
    req: Request,
    res: Response<IFetchProviderResponseDTO | ErrorResposnseDTO>
  ): Promise<void> {
    try {
      const query = req.query.query as string|| "";
      const location = req.query.location as string || "";
      const providers = await this._userProviderService.getProviders(
        query,
        location
      );
      const response: IFetchProviderResponseDTO = {
        success: true,
        message: RESPONSE_MESSAGES.RESOURCE_FETCHED("Providers"),
        providers: providers,
      };
      const validate = FetchProviderResponseSchema.safeParse(response);
      if (!validate.success) {
        console.log("Validation error:", validate.error.message);
        res.status(StatusCode.INTERNAL_SERVER_ERROR).json({
          success: false,
          message: RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR,
        });
        return;
      }
      res.status(200).json(response);
    } catch (error) {
      res.status(500).json({ success:false,message:RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR });
    }
  }
}
