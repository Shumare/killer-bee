import type { UserEntity } from '../entities/UserEntity'

const users: UserEntity[] = [
  { id: 1, full_name: 'Alice Admin', email: 'alice@example.com', password: '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8', created_at: new Date('2024-01-01T00:00:00Z') },
  { id: 2, full_name: 'Bob User', email: 'bob@example.com', password: '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8', created_at: new Date('2024-01-02T00:00:00Z') },
]

let nextId = users.length + 1

export function findUserById(id: number): UserEntity | null {
  return users.find(u => u.id === id) ?? null
}

export function findUserByEmail(email: string): UserEntity | null {
  return users.find(u => u.email === email) ?? null
}

export function createUser(data: Omit<UserEntity, 'id'>): UserEntity {
  const newUser: UserEntity = { ...data, id: nextId++ }
  users.push(newUser)
  return newUser
}

export function updateUser(id: number, data: Partial<UserEntity>): UserEntity | null {
  const index = users.findIndex(u => u.id === id)
  if (index === -1) return null
  users[index] = { ...users[index], ...data }
  return users[index]
}
