export type LoginRequestDTO = {
  email: string
  password: string
}

export type LoginResponseDTO = {
  access_token: string
  user_id: number
  full_name: string
}
