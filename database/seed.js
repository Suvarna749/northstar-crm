import 'dotenv/config';
import bcrypt from 'bcryptjs';
import pg from 'pg';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url'; import path from 'node:path';
const {Pool}=pg;const pool=new Pool({connectionString:process.env.DATABASE_URL});
try { const schema=await readFile(fileURLToPath(new URL('./schema.sql',import.meta.url)),'utf8');await pool.query(schema);const name=process.env.ADMIN_NAME||'CRM Administrator';const email=process.env.ADMIN_EMAIL;const password=process.env.ADMIN_PASSWORD;if(!email||!password||password.length<12)throw new Error('Set ADMIN_EMAIL and ADMIN_PASSWORD (at least 12 characters) in backend/.env before seeding.');const hash=await bcrypt.hash(password,12);await pool.query("INSERT INTO users(full_name,email,password_hash,role) VALUES($1,$2,$3,'ADMIN') ON CONFLICT(email) DO NOTHING",[name,email,hash]);console.log('Schema applied and admin seed checked. Credentials are read from backend/.env.');}catch(e){console.error('Seed failed:',e.message);process.exitCode=1;}finally{await pool.end();}
