export interface Model {
  id: number;
  name: string;
  description: string;
  grammagePUHT: number;
  gamme: string;
}

export interface Ingredient {
  id: number;
  name: string;
  description: string;
}

export interface Composition {
  id: number;
  modelId: number;
  ingredientId: number;
  grammage: number;
  ingredient?: Ingredient;
}

export interface Process {
  id: number;
  modelId: number;
  name: string;
  description: string;
}

export interface Step {
  id: number;
  processId: number;
  stepOrder: number;
  description: string;
}

export interface Test {
  id: number;
  processId: number;
  description: string;
  criteria: string;
}

export interface Property {
  id: number;
  modelId: number;
  encryptedKey: string;
  encryptedValue: string;
}

export interface User {
  id: number;
  email: string;
  role: 'admin' | 'user';
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: { code: string; message: string };
}
