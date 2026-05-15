import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { UserRepository } from '../repositories/user.repository';
import { User, UserRole } from '../models/User';

const BCRYPT_ROUNDS = 12;

export interface JwtPayload {
  sub: number;
  email: string;
  role: UserRole;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export type SafeUser = Omit<User, 'passwordHash'>;

function getJwtSecret(): string {
  const secret = process.env['JWT_SECRET'];
  if (!secret) throw new Error('JWT_SECRET is not defined');
  return secret;
}

function getJwtRefreshSecret(): string {
  const secret = process.env['JWT_REFRESH_SECRET'];
  if (!secret) throw new Error('JWT_REFRESH_SECRET is not defined');
  return secret;
}

function omitPasswordHash(user: User): SafeUser {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { passwordHash, ...safeUser } = user;
  return safeUser;
}

export class AuthService {
  private userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepository();
  }

  async register(email: string, password: string): Promise<SafeUser> {
    const existing = await this.userRepository.findByEmail(email);
    if (existing) {
      const err = new Error('Email already in use');
      (err as NodeJS.ErrnoException).code = 'EMAIL_TAKEN';
      throw err;
    }

    const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
    const user = await this.userRepository.create({ email, passwordHash });
    return omitPasswordHash(user);
  }

  async login(email: string, password: string): Promise<AuthTokens> {
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      const err = new Error('Invalid credentials');
      (err as NodeJS.ErrnoException).code = 'INVALID_CREDENTIALS';
      throw err;
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      const err = new Error('Invalid credentials');
      (err as NodeJS.ErrnoException).code = 'INVALID_CREDENTIALS';
      throw err;
    }

    const payload: JwtPayload = { sub: user.id, email: user.email, role: user.role };

    const accessToken = jwt.sign(payload, getJwtSecret(), { expiresIn: '15m' });
    const refreshToken = jwt.sign(payload, getJwtRefreshSecret(), { expiresIn: '7d' });

    return { accessToken, refreshToken };
  }

  async refreshToken(token: string): Promise<{ accessToken: string }> {
    let decoded: JwtPayload;
    try {
      decoded = jwt.verify(token, getJwtRefreshSecret()) as JwtPayload;
    } catch {
      const err = new Error('Invalid or expired refresh token');
      (err as NodeJS.ErrnoException).code = 'INVALID_REFRESH_TOKEN';
      throw err;
    }

    const user = await this.userRepository.findById(decoded.sub);
    if (!user) {
      const err = new Error('User not found');
      (err as NodeJS.ErrnoException).code = 'USER_NOT_FOUND';
      throw err;
    }

    const payload: JwtPayload = { sub: user.id, email: user.email, role: user.role };
    const accessToken = jwt.sign(payload, getJwtSecret(), { expiresIn: '15m' });

    return { accessToken };
  }

  async validateToken(token: string): Promise<JwtPayload> {
    try {
      return jwt.verify(token, getJwtSecret()) as JwtPayload;
    } catch {
      const err = new Error('Invalid or expired token');
      (err as NodeJS.ErrnoException).code = 'INVALID_TOKEN';
      throw err;
    }
  }

  async getUserById(id: number): Promise<SafeUser | null> {
    const user = await this.userRepository.findById(id);
    if (!user) return null;
    return omitPasswordHash(user);
  }
}
