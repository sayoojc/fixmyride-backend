import { z } from "zod";

export const ToggleListingRequestSchema = z.object({
  email: z.string().email("Invalid email format"),
});

export type ToggleListingRequestDTO = z.infer<typeof ToggleListingRequestSchema>;

export const UserSchema = z.object({
  _id: z.string(),
  name: z.string(),
  email: z.string(),
  isListed: z.boolean(),
});

export type UserDTO = z.infer<typeof UserSchema>;

export const FetchUsersResponseSchema = z.object({
  success: z.literal(true),
  message: z.string(),
  users: z.array(UserSchema),
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
