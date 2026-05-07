import "server-only";
import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const SESSION_COOKIE = "kpoan_admin_session";
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7;

const getSessionSecret = () =>
  process.env.ADMIN_SESSION_SECRET ??
  process.env.ADMIN_PASSWORD ??
  "development-admin-secret";

const sign = (payload: string) =>
  createHmac("sha256", getSessionSecret()).update(payload).digest("hex");

const safeEqual = (left: string, right: string) => {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }

  return timingSafeEqual(leftBuffer, rightBuffer);
};

export const isAdminConfigured = () => Boolean(process.env.ADMIN_PASSWORD);

export const createAdminSession = async () => {
  const expiresAt = Date.now() + SESSION_TTL_SECONDS * 1000;
  const nonce = randomBytes(12).toString("hex");
  const payload = `${expiresAt}.${nonce}`;
  const token = `${payload}.${sign(payload)}`;
  const cookieStore = await cookies();

  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  });
};

export const clearAdminSession = async () => {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
};

export const isAdminAuthenticated = async () => {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return false;

  const [expiresAtRaw, nonce, signature] = token.split(".");
  if (!expiresAtRaw || !nonce || !signature) return false;

  const expiresAt = Number(expiresAtRaw);
  if (!Number.isFinite(expiresAt) || expiresAt < Date.now()) {
    return false;
  }

  return safeEqual(sign(`${expiresAtRaw}.${nonce}`), signature);
};

export const requireAdmin = async () => {
  if (!(await isAdminAuthenticated())) {
    redirect("/admin/login");
  }
};

