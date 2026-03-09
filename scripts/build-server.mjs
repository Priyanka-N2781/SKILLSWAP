import * as esbuild from 'esbuild';
import { readFileSync } from 'fs';

const allowlist = [
  "@google/generative-ai",
  "axios",
  "connect-pg-simple",
  "cors",
  "date-fns",
  "drizzle-orm",
  "drizzle-zod",
  "express",
  "express-rate-limit",
  "express-session",
  "jsonwebtoken",
  "memorystore",
  "multer",
  "nanoid",
  "nodemailer",
  "openai",
  "passport",
  "passport-local",
  "pg",
  "stripe",
  "uuid",
  "ws",
  "xlsx",
  "zod",
  "zod-validation-error",
  "serverless-http",
];

const pkg = JSON.parse(readFileSync('./package.json', 'utf-8'));
const allDeps = [
  ...Object.keys(pkg.dependencies || {}),
  ...Object.keys(pkg.devDependencies || {}),
];
const externals = allDeps.filter((dep) => !allowlist.includes(dep));

await esbuild.build({
  entryPoints: ['server/index.ts'],
  platform: 'node',
  bundle: true,
  format: 'esm', // Changed from cjs for Netlify
  outfile: 'dist/index.mjs', // Netlify serverless functions prefer .mjs for ESM
  define: {
    'process.env.NODE_ENV': '"production"',
  },
  minify: true,
  external: externals,
  logLevel: 'info',
});
