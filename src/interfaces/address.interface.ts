import { Types } from "mongoose";

export type AddressSnapshot = {
  _id?: Types.ObjectId;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  zipCode: string;
  location: {
    type: "Point";
    coordinates: [number, number]; // [latitude, longitude]
  };
};
