import { pbkdf2Sync, randomBytes } from 'node:crypto';

const password = process.argv[2];
if (!password) {
  process.stderr.write('Uso: npm run --silent admin:hash-password -- "MiContraseña"\n');
  process.exit(1);
}

const iterations = 600_000;
const salt = randomBytes(16);
const hash = pbkdf2Sync(password, salt, iterations, 32, 'sha256');
process.stdout.write(
  `pbkdf2-sha256.${iterations}.${salt.toString('base64url')}.${hash.toString('base64url')}\n`,
);
