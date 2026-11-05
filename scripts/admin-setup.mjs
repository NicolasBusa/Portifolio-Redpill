import { randomBytes, scryptSync } from "node:crypto";
import { readFile, appendFile } from "node:fs/promises";

const file = ".env.local";
let current;
try {
  current = await readFile(file, "utf8");
} catch (error) {
  if (error.code !== "ENOENT") throw error;
  current = "";
}

if (/^\s*(?:export\s+)?PORTFOLIO_ADMIN_HASH\s*=/m.test(current)) {
  console.log("A senha do painel já está configurada em .env.local.");
  console.log("Para redefinir, remova a linha PORTFOLIO_ADMIN_HASH e execute este comando novamente.");
} else {
  const password = randomBytes(24).toString("base64url");
  const salt = randomBytes(16);
  const hash = scryptSync(password, salt, 64);
  await appendFile(file, `\nPORTFOLIO_ADMIN_HASH=${salt.toString("hex")}:${hash.toString("hex")}\n`, { mode: 0o600 });
  console.log("Senha do painel (guarde em um local seguro):");
  console.log(password);
  console.log("Inicie ou reinicie o servidor e abra http://localhost:3000/admin.");
}
