import crypto from "crypto";

const SECRET = process.env.PASSPORT_SECRET || "dev_secret_change_me";

export function generatePassportHash(profile: any) {
  const raw = `${profile.id}:${profile.full_name}:${profile.sector}:${profile.created_at}:${SECRET}`;

  return crypto.createHash("sha256").update(raw).digest("hex");
}

export function generateNodeId(id: string) {
  return `KL-${String(id).slice(0, 6).toUpperCase()}`;
}