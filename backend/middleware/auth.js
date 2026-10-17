import jwt from 'jsonwebtoken';
import { query } from '../config/db.js';
import { AppError, asyncHandler } from '../utils/errors.js';
export const authenticate = asyncHandler(async (req,res,next) => {
 const header = req.headers.authorization || ''; const token = header.startsWith('Bearer ') ? header.slice(7) : null;
 if (!token) throw new AppError(401,'Please sign in to continue.');
 let payload; try { payload = jwt.verify(token, process.env.JWT_SECRET); } catch { throw new AppError(401,'Your session is invalid or expired. Please sign in again.'); }
 const { rows } = await query('SELECT id, full_name, email, role, phone, is_active FROM users WHERE id=$1',[payload.sub]);
 if (!rows[0] || !rows[0].is_active) throw new AppError(401,'This account is unavailable.');
 req.user = rows[0]; next();
});
export const requireAdmin = (req,res,next) => req.user?.role === 'ADMIN' ? next() : next(new AppError(403,'Administrator permission is required.'));
