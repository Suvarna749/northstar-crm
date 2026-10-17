import 'dotenv/config';
import express from 'express'; import cors from 'cors'; import helmet from 'helmet';
import api from './routes/api.js'; import { pool } from './config/db.js'; import { errorHandler } from './utils/errors.js';
if(!process.env.DATABASE_URL || !process.env.JWT_SECRET || process.env.JWT_SECRET.length<32){console.error('Set DATABASE_URL and a JWT_SECRET of at least 32 characters in backend/.env');process.exit(1);}
const app=express();app.use(helmet());app.use(cors({origin:(process.env.CLIENT_ORIGIN||'http://localhost:5173').split(',').map(s=>s.trim()),credentials:false}));app.use(express.json({limit:'1mb'}));app.get('/api/health',async(req,res)=>{try{await pool.query('SELECT 1');res.json({success:true,data:{api:'ok',database:'connected'}});}catch{res.status(503).json({success:false,error:{message:'Database unavailable'}});}});app.use('/api',api);app.use((req,res)=>res.status(404).json({success:false,error:{message:'API route not found.'}}));app.use(errorHandler);
const port=Number(process.env.PORT)||5000;const server=app.listen(port,()=>console.log(`CRM API listening at http://localhost:${port}`));
const shutdown=async()=>{server.close(async()=>{await pool.end();process.exit(0);});};process.on('SIGINT',shutdown);process.on('SIGTERM',shutdown);
