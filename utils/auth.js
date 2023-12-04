import { ObjectId } from 'mongodb';
import { v4 as uuidv4 } from 'uuid';
import redisClient from './redis';
import dbClient from './db';

export function getAuthHeader(req) {
  const header = req.headers.authorization || null;
  if (!header) return false;
  if (!header.startsWith('Basic ')) return false;
  return header.split(' ')[1];
}

export function decodeBase64AuthToken(authHeader) {
  return Buffer.from(authHeader, 'base64').toString('utf8');
}

export function extractCredentials(decodedToken) {
  const [email, password] = decodedToken.split(':');
  return { email, password };
}

export function generateToken() {
  return uuidv4();
}

export async function getUserId(req) {
  const authToken = req.headers['x-token'];
  if (!authToken) return false;
  const userId = await redisClient.get(`auth_${authToken}`);
  return userId || false;
}

export async function retreiveUserFromToken(req) {
  const userId = await getUserId(req);
  const user = dbClient.userCollection.findOne({ _id: ObjectId(userId) });
  return user || false;
}
