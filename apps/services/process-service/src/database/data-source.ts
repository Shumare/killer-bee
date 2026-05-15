import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { Process } from '../models/Process';
import { Step } from '../models/Step';
import { Model } from '../models/Model';

export const AppDataSource = new DataSource({
  type: 'mssql',
  host: process.env['DB_HOST'] ?? 'localhost',
  port: parseInt(process.env['DB_PORT'] ?? '1433', 10),
  username: process.env['DB_USER'] ?? 'sa',
  password: process.env['DB_PASSWORD'] ?? '',
  database: process.env['DB_NAME'] ?? 'killerbee',
  synchronize: false,
  logging: process.env['NODE_ENV'] !== 'production',
  entities: [Process, Step, Model],
  options: {
    encrypt: false,
    trustServerCertificate: true,
  },
});
