export type LoginRequestDTO = {
  username: string
  password: string
}

export type LoginResponseDTO = {
  access_token: string
  full_name: string
}
