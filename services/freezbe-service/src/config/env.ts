export const env = {
  NODE_ENV: process.env.NODE_ENV ?? 'development',
  PORT: Number(process.env.PORT ?? 3004),
  JWT_SECRET: process.env.JWT_SECRET ?? 'change-me',
  DB_HOST: process.env.DB_HOST ?? 'sql-server',
  DB_PORT: Number(process.env.DB_PORT ?? 1433),
  DB_NAME: process.env.DB_NAME ?? 'killer_bee',
  DB_USER: process.env.DB_USER ?? 'LOGIN_APP',
  DB_PASSWORD: process.env.DB_PASSWORD ?? '',
  CIPHER_KEY: process.env.CIPHER_KEY ?? 'killer-bee-default-key',
}
