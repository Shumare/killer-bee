export type UserResponseDTO = {
  user_id: number
  full_name: string
  email: string
}

export type UpdateProfileDTO = {
  full_name?: string
  email?: string
}
