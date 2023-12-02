import crypto from 'crypto';
import { ObjectId } from 'mongodb';
import dbClient from '../utils/db';
import redisClient from '../utils/redis';

class UsersController {
  static async postNew(req, res) {
    const { email, password } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Missing email' });
    }
    if (!password) {
      return res.status(400).json({ error: 'Missing password' });
    }
    const exists = await dbClient.userCollection.findOne({ email });
    if (exists) return res.status(400).json({ error: 'Already exist' });

    const passwordHash = await crypto.createHash('sha1').update(password).digest('hex');
    const result = await dbClient.userCollection.insertOne({ email, password: passwordHash });
    return res.status(201).json({ id: result.insertedId, email });
  }

  static async getMe(req, res) {
    const authToken = req.headers['x-token'] || null;
    if (!authToken) return res.status(401).json({ error: 'Unauthorized' });
    const userId = await redisClient.get(`auth_${authToken}`);
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });
    const user = await dbClient.userCollection.findOne({ _id: ObjectId(userId) });
    if (!user) return res.status(401).json({ error: 'Unauthorized' });
    return res.json({ id: user._id, email: user.email });
  }
}

export default UsersController;
