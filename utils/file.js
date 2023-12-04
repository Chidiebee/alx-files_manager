import dbClient from './db';

const supportedTypes = ['file', 'folder', 'image'];

export async function getRequestdata(req) {
  const { name } = req.body || '';
  const { type } = req.body || null;
  const parentId = req.body.parentId || 0;
  const isPublic = req.body.isPublic || false;
  const { data } = req.body || '';
  for (const requirment of [name, type]) {
    if (!requirment) throw Error(`Missing ${requirment}`);
  }
  if (!type || !supportedTypes.includes(type)) throw Error('Missing type');
  if (!data && type !== 'folder') throw Error('Missing data');
  return {
    name, type, parentId, isPublic, data,
  };
}

export async function saveToDb(newFile) {
  return dbClient.fileCollection.insertOne(newFile);
}

export function updateFile(file) { return file; }
