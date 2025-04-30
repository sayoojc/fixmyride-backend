import { IAddress } from "../models/adress.model";
export const formatAddress = (address: IAddress | undefined): string => {
    if (!address) return "No default address";
    const {
      addressLine1,
      addressLine2,
      street,
      city,
      state,
      zipCode
    } = address;
  
    return `${addressLine1}, ${addressLine2 ? addressLine2 + ', ' : ''}${street}, ${city}, ${state} - ${zipCode}`;
  };
  