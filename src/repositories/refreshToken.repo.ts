import { BaseRepository } from "./base/base.repo";
import { IRefreshToken } from "../models/refreshToken.model";
import { Model } from "mongoose";

export class RefreshTokenRepository extends BaseRepository<IRefreshToken> {
  constructor(refreshTokenModel:Model<IRefreshToken>) {
    super(refreshTokenModel);
  }

 
  async createRefreshToken(data: Partial<IRefreshToken>): Promise<IRefreshToken> {
    return await this.create(data);
  }

  async findRefreshToken(token: string, deviceId: string): Promise<IRefreshToken | null> {
    return await this.findOne({ token, deviceId });
  }


  async findAllByUser(userId: string): Promise<IRefreshToken[]> {
    return await this.find({ userId });
  }


  async revokeTokenById(tokenId: string): Promise<void> {
    await this.deleteById(tokenId);
  }
}
