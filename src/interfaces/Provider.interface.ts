
export interface TempProvider  {
  name: string;
  email: string;
  phone: string;
  password: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
  otp:string;
  createdAt:Date;
}
export interface Providerdata {
  name: string;
  email: string;
  phone: string;
  password:string;
  otp:string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
  location: {
    latitude: number;
    longitude: number;
  };
}


export interface SanitizedProvider {
  name: string;
  email: string;
  phone?: string;
  isListed:boolean
};

export  interface VerificationFormData {
  licenseImage: string
  idProofImage: string
  accountHolderName: string
  bankName:string
  ifscCode: string
  accountNumber: string
  startedYear: string
  description: string
}