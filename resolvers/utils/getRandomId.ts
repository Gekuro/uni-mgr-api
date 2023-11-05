export function getRandomUUID(length: number): string {
  const chars = "QWERTYUIOPASDFGHJKLZXCVBNM1234567890";
  let out = "";

  for (let i = 0; i < length; i++) {
    out += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  return out;
}
