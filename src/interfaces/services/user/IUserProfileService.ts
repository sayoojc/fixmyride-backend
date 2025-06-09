
import {UserProfileDTO} from "../../../interfaces/User.interface"
import { PartialSanitizedUserDTO } from "../../../dtos/controllers/user/userProfile.controller.dto";



export interface IUserProfileService {
  /**
   * Fetches the full profile data of the user including addresses and vehicles.
   * @param id User ID
   * @returns Sanitized user object with address and vehicle data, or undefined on error
   */
  getProfileData(
    id: string
  ): Promise<
    | UserProfileDTO
    | undefined
  >;

  /**
   * Updates the user's profile with a new phone number and name.
   * @param phone New phone number
   * @param userId User ID
   * @param userName New name
   * @returns Partial sanitized user data or undefined on failure
   */
  updateProfile(
    phone: string,
    userId: string,
    userName: string
  ): Promise<PartialSanitizedUserDTO| undefined>;

  /**
   * Changes the user's password after verifying the current password.
   * @param userId User ID
   * @param currentPassword Current password for verification
   * @param newPassword New password to set
   * @returns Partial sanitized user data or undefined on failure
   */
  changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string
  ): Promise<PartialSanitizedUserDTO | undefined>;
}
