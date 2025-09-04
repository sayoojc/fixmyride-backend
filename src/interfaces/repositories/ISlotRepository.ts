import { ISlot } from "../../models/slot.model";
import { IBaseRepository } from "./IBaseRepository";
import mongoose from "mongoose";
export interface ISlotRepository extends IBaseRepository<ISlot> {

}
