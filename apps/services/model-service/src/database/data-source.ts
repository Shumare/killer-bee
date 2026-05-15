import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { Model } from '../models/Model';
import { Ingredient } from '../models/Ingredient';
import { Composition } from '../models/Composition';
import { Process } from '../models/Process';
import { Step } from '../models/Step';
import { Test } from '../models/Test';
import { Property } from '../models/Property';
import { InitialSchema1700000000000 } from '../migrations/1700000000000-InitialSchema';

export const AppDataSource = new DataSource({
  type: 'mssql',
  host: process.env['DB_HOST'] ?? 'localhost',
  port: parseInt(process.env['DB_PORT'] ?? '1433', 10),
  username: process.env['DB_USER'] ?? 'sa',
  password: process.env['DB_PASSWORD'] ?? '',
  database: process.env['DB_NAME'] ?? 'killerbee',
  synchronize: false,
  logging: process.env['NODE_ENV'] !== 'production',
  entities: [Model, Ingredient, Composition, Process, Step, Test, Property],
  migrations: [InitialSchema1700000000000],
  options: {
    encrypt: false,
    trustServerCertificate: true,
  },
});
