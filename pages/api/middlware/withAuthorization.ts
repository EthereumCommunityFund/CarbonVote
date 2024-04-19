import { NextApiHandler, NextApiRequest, NextApiResponse } from 'next';

import jwt from 'jsonwebtoken';
const JWT_SECRET = process.env.JWT_SECRET || '';

const withAuthorization = (handler: NextApiHandler): NextApiHandler => {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    const token = req.cookies.token || req.headers.authorization?.split(' ')[1]; // Bearer token
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    try {
      const decoded: any = jwt.verify(token, JWT_SECRET);

      // Check if the token has expired
      const now = Math.floor(Date.now() / 1000); // Current time in seconds since epoch
      if (decoded.exp < now) {
        return res.status(403).json({ error: 'Token has expired' });
      }

      // Check if the token was issued in the past
      if (decoded.iat > now) {
        return res.status(403).json({ error: 'Token issued in the future' });
      }

      if (decoded.sessionData !== 'sign_in_token') {
        return res.status(403).json({ error: 'Invalid session data' });
      }
    } catch (error) {
      return res.status(403).json({ error: 'You are not authorized' });
    }

    return handler(req, res);
  };
};

export default withAuthorization;
