const messages = {
 
  RESOURCE_CREATED: (resource: string) => `${resource} created successfully`,
  RESOURCE_UPDATED: (resource: string) => `${resource} updated successfully`,
  RESOURCE_DELETED: (resource: string) => `${resource} deleted successfully`,
  RESOURCE_NOT_FOUND: (resource: string) => `${resource} not found`,
  RESOURCE_FETCHED: (resource: string) => `${resource} fetched successfully`,
  LOGIN_SUCCESS: (role:string) => `${role} login successful`,
  LOGOUT_SUCCESS: (role:string) => `${role} logout successful`,
  RESOURCE_UPDATE_FAILED: (resource:string) => `${resource} failed to update`,
  
  ACCOUNT_IS_BLOCKED:"Your account is blocked. Contact support.",
  OTP_SEND_SUCCESSFULLY: "OTP SEND SUCCESSFULLY",
  LOGOUT_FAILED: "LOGOUT FAILED",
  UNAUTHORIZED: "Unauthorized access",
  FORBIDDEN: "Forbidden: You don't have permission",
  AUTH_FAILED: "Authentication failed",
  TOKEN_EXPIRED: "Session expired, please login again",
  PROVIDER_VERIFIED:"Provider verified successfully",
  ADDRESS_SET_DEFAULT:"Address set as default",
  USER_REGISTERED:"User registered successfully",
  INVALID_INPUT: "Invalid input provided",
  RESET_EMAIL_SEND:"If email exists, a reset link has been sent",
  PASSWORD_RESET_SUCCEFULL:"Password reset succefull",
  SERVICE_REMOVED_FROM_CART:"Service removed from cart",
  PAYMENT_FAILED:(paymentStatus:string) => `Payment failed with status: ${paymentStatus}`,
  ACTION_SUCCESS: "Action completed successfully",
  ACTION_FAILED: "Action failed",
  INTERNAL_SERVER_ERROR: "Something went wrong. Please try again later.",
  EMAIL_ALREADY_EXISTS: "Email already exists",
  USER_ALREADY_EXISTS: "User already exists",
  PASSWORD_INCORRECT: "Incorrect password",

};

export const RESPONSE_MESSAGES = Object.freeze(messages);