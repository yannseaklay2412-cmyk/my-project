import jwt from 'jsonwebtoken';

export function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];

  const secret = process.env.JWT_SECRET || 'c8f1a27e94b30d65e712a83f95b0c41872e4d96a5b3c1082f76e4d29a15b8390';

  try {
    const decoded = jwt.verify(token, secret);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

export function optionalToken(req, res, next) {
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    const secret = process.env.JWT_SECRET || 'c8f1a27e94b30d65e712a83f95b0c41872e4d96a5b3c1082f76e4d29a15b8390';
    try {
      const decoded = jwt.verify(token, secret);
      req.user = decoded;
    } catch {
      // Ignore token errors for optional routes
    }
  }

  next();
}
