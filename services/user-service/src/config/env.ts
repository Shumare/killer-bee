export const env = {
  NODE_ENV: process.env.NODE_ENV ?? 'development',
  PORT: Number(process.env.PORT ?? 3002),
  JWT_SECRET: process.env.JWT_SECRET ?? 'change-me',
  DATABASE_URL: process.env.DATABASE_URL ?? '',
}
