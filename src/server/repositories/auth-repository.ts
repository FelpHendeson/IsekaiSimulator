import { connectMongo } from "../db/mongodb";
import { SessionModel } from "../models/session";
import { UserModel } from "../models/user";
import { hashPassword, verifyPassword } from "../auth/password";
import { createSessionToken, hashSessionToken } from "../auth/tokens";
import type { AuthCredentials } from "../validation/auth";

const SESSION_DAYS = 7;

export type AuthenticatedUser = {
  id: string;
  username: string;
  displayName: string;
};

export async function registerUser(credentials: AuthCredentials) {
  await connectMongo();

  const username = normalizeUsername(credentials.username);
  const existing = await UserModel.findOne({ username }).lean();

  if (existing) {
    throw new AuthError("Usuario ja existe.", 409);
  }

  const user = await UserModel.create({
    username,
    displayName: credentials.username.trim(),
    passwordHash: hashPassword(credentials.password),
  });

  return toAuthenticatedUser(user);
}

export async function authenticateUser(credentials: AuthCredentials) {
  await connectMongo();

  const username = normalizeUsername(credentials.username);
  const user = await UserModel.findOne({ username });

  if (!user || !verifyPassword(credentials.password, user.passwordHash)) {
    throw new AuthError("Usuario ou senha invalidos.", 401);
  }

  return toAuthenticatedUser(user);
}

export async function createSession(userId: string) {
  await connectMongo();

  const token = createSessionToken();
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);

  await SessionModel.create({
    userId,
    tokenHash: hashSessionToken(token),
    expiresAt,
  });

  return { token, expiresAt };
}

export async function findUserBySessionToken(token: string) {
  await connectMongo();

  const session = await SessionModel.findOne({
    tokenHash: hashSessionToken(token),
    expiresAt: { $gt: new Date() },
  }).lean();

  if (!session) {
    return null;
  }

  const user = await UserModel.findById(session.userId).lean();

  if (!user) {
    return null;
  }

  return toAuthenticatedUser(user);
}

export async function deleteSession(token: string) {
  await connectMongo();

  await SessionModel.deleteOne({ tokenHash: hashSessionToken(token) });
}

export class AuthError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = "AuthError";
  }
}

function normalizeUsername(username: string) {
  return username.trim().toLowerCase();
}

function toAuthenticatedUser(user: { _id: unknown; username: string; displayName: string }) {
  return {
    id: String(user._id),
    username: user.username,
    displayName: user.displayName,
  };
}

