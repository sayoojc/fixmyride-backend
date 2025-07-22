import { z } from "zod";


export const UserSchema = z.object({
  _id: z.string(),
  name: z.string(),
  email: z.string(),
  phone:z.string(),
  role:z.string(),
  isListed: z.boolean(),
});

export type UserDTO = z.infer<typeof UserSchema>;

export const FetchUsersResponseSchema = z.object({
  success: z.literal(true),
  message: z.string(),
  users: z.array(UserSchema),
  totalCount:z.number()
});
export type FetchUsersResponseDTO = z.infer<typeof FetchUsersResponseSchema>;


export const ToggleListingResponseSchema = z.object({
  success: z.literal(true),
  message: z.string(),
  user: UserSchema,
});
export type ToggleListingResponseDTO = z.infer<typeof ToggleListingResponseSchema>;

export type ErrorResponse = {
  success?: false;
  message: string;
};
