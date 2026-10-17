export class AppError extends Error { constructor(status, message) { super(message); this.status = status; } }
export const asyncHandler = fn => (req,res,next) => Promise.resolve(fn(req,res,next)).catch(next);
export function errorHandler(err, req, res, next) {
  if (res.headersSent) return next(err);
  const status = err.status || (err.code === '23505' ? 409 : err.code === '23503' ? 400 : 500);
  const message = status === 500 ? 'Something went wrong. Please try again.' : (err.code === '23505' ? 'A record with this value already exists.' : err.message);
  if (status === 500) console.error(err);
  res.status(status).json({ success:false, error:{ message, ...(process.env.NODE_ENV === 'development' && status === 500 ? {detail:err.message} : {}) } });
}
