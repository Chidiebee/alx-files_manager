import crypto from 'crypto';

import dbClient from '../utils/db';

async function _hash(plainText) {
  return crypto.createHash('sha1').update(plainText).digest('hex');
}

async function emailExists(email) {
  const user = await dbClient.userCollection.findOne({ email });
  return !!user;
}

class UsersController {
  static async postNew(req, res) {
    const { email, password } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Missing email' });
    }
    if (!password) {
      return res.status(400).json({ error: 'Missing password' });
    }
    const exists = await emailExists(email);
    if (exists) return res.status(400).json({ error: 'Already exist' });

    const passwordHash = await _hash(password);
    const result = await dbClient.userCollection.insertOne({ email, password: passwordHash });
    return res.status(201).json({ id: result.insertedId, email });
  }
}

export default UsersController;
