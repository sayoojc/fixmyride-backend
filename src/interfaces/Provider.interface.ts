export interface TempProvider {
  name: string;
  email: string;
  phone: string;
  password: string;
  latitude: number;
  longitude: number;
  address: {
    street: string;
    city: string;
    state: string;
    pinCode: string;
  };
  otp: string;
  createdAt: Date;
}
export interface Providerdata {
  name: string;
  email: string;
  phone: string;
  password: string;
  otp: string;
  address: {
    street: string;
    city: string;
    state: string;
    pinCode: string;
  };
  latitude: number;
  longitude: number;
}

export interface SanitizedProvider {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  address: string;
  description: string;
  profileImage: string;
  verificationStatus: string;
  isListed: boolean;
  location:{
    type:string,
    coordinates:[number,number]
  }
}

export interface VerificationFormData {
  licenseImage: string;
  idProofImage: string;
  accountHolderName: string;
  bankName: string;
  ifscCode: string;
  accountNumber: string;
  startedYear: string;
  description: string;
}
