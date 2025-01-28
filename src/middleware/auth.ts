import { Request, Response, NextFunction } from 'express';
import { createAuthModel } from '../models/infra_access';
import infraDBConnection from '../utils/infraDBConnection';

const Auth = createAuthModel(infraDBConnection);

const basicAuthMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.header('Authorization');

  if (!authHeader || !authHeader.startsWith('Basic ')) {
    return res.status(401).send('Missing or invalid Authorization header');
  }

  // Decode Base64 encoded credentials
  const base64Credentials = authHeader.split(' ')[1];
  const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
  const [access_id, password] = credentials.split(':');

  try {
    // Find user by email
    const user = await Auth.findOne({ _id: access_id, access_key: password });
    if (!user) {
      return res.status(401).send('Invalid email or password');
    }
    let userData = user.toJSON();
    userData.access_id = userData._id;

    req.body = { ...req.body, ...userData };
    next();
  } catch (error) {
    res.status(500).send('Internal server error');
  }
};

export default basicAuthMiddleware;
