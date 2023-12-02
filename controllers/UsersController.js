import crypto from 'crypto';

import dbClient from '../utils/db';

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
}

export default UsersController;
