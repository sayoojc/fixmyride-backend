export interface TempUser {
    name: string;
    email: string;
    phone: string;
    password: string;
    otp:string;
    createdAt:Date;
}
export interface SanitizedUser {
  name: string;
  email: string;
  phone?: string;
  role: string;
  isListed: boolean;
};
