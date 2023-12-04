// import { ObjectId } from 'mongodb';
import {
  getAuthHeader, decodeBase64AuthToken, extractCredentials, generateToken,
} from '../utils/auth';
import dbClient from '../utils/db';
import redisClient from '../utils/redis';

class AuthController {
  static async getConnect(req, res) {
    const header = getAuthHeader(req);
    if (!header) return res.status(401).json({ error: 'Unauthorized' });
    const decodedToken = decodeBase64AuthToken(header);
    if (!decodedToken) return res.status(401).json({ error: 'Unauthorized' });
    const { email, password } = extractCredentials(decodedToken);
    if (!email || !password) return res.status(401).json({ error: 'Unauthorized' });
    const user = await dbClient.userCollection.findOne({ email });
    if (!user) return res.status(401).json({ error: 'Unauthorized' });
    const token = `${generateToken()}`;
    const key = `auth_${token}`;
    await redisClient.set(key, user._id, 24 * 60 * 60);
    return res.status(200).json({ token });
  }

  static async getDisconnect(req, res) {
    const token = req.headers['x-token'] || null;
    if (!token) return res.status(401).json({ error: 'Unauthorized' });
    const key = `auth_${token}`;
    const userId = await redisClient.get(key);
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });
    await redisClient.del(key);
    return res.status(204).end();
  }
}

export default AuthController;
