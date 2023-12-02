import { v4 as uuidv4 } from 'uuid';

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
