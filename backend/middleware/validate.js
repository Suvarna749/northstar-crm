import { AppError } from '../utils/errors.js';
export const validate = schema => (req,res,next) => { const parsed=schema.safeParse(req.body); if(!parsed.success) return next(new AppError(400,parsed.error.issues.map(i=>`${i.path.join('.')}: ${i.message}`).join('; '))); req.body=parsed.data; next(); };
