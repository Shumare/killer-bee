export interface IModel {
  id: number;
  name: string;
  description: string;
  grammagePUHT: number;
  gamme: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IIngredient {
  id: number;
  name: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IComposition {
  id: number;
  modelId: number;
  ingredientId: number;
  grammage: number;
}

export interface IProcess {
  id: number;
  modelId: number;
  name: string;
  description: string;
}

export interface IStep {
  id: number;
  processId: number;
  stepOrder: number;
  description: string;
}

export interface ITest {
  id: number;
  processId: number;
  description: string;
  criteria: string;
}

export interface IProperty {
  id: number;
  modelId: number;
  encryptedKey: string;
  encryptedValue: string;
}

export interface IUser {
  id: number;
  email: string;
  passwordHash: string;
  role: 'admin' | 'user';
  createdAt: Date;
}
