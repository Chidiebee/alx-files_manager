import { ObjectId } from 'mongodb';
import { tmpdir } from 'os';
import { join } from 'path';
import { writeFile, mkdir } from 'fs';
import { promisify } from 'util';
import { v4 as uuid4 } from 'uuid';
import dbClient from '../utils/db';
import { retreiveUserFromToken } from '../utils/auth';
import { getRequestdata, saveToDb } from '../utils/file';

const DEFAULT_ROOT_FOLDER = 'files_manager';

class FilesController {
  static async postUpload(req, res) {
    // Retrieve the user based on the token
    const user = await retreiveUserFromToken(req);
    if (!user) return res.status(401).json({ error: 'Unauthorized' });
    let fileData = null;
    let newFile;
    try {
      fileData = await getRequestdata(req);
      const {
        name, type, parentId, isPublic, data,
      } = fileData;
      if (parentId) {
        // check if file with the parentId exists in db
        const file = await dbClient.fileCollection.findOne({ parentId: ObjectId(parentId) });
        if (!file) throw Error('Parent not found');
        // check if type is a folder
        if (file.type !== 'folder') throw Error('Parent is not a folder');
      }

      // add userId as the file owner
      const userId = `${user._id}`;
      const baseDir = process.env.FOLDER_PATH || join(tmpdir(), DEFAULT_ROOT_FOLDER);

      newFile = {
        userId,
        name,
        type,
        isPublic,
        parentId: 0 || ObjectId(parentId),

      };

      const mkdirAsync = promisify(mkdir);

      await mkdirAsync(baseDir, { recursive: true });

      if (type === 'folder') {
        const savedFile = await saveToDb(newFile);
        const fileId = savedFile.insertedId.toString();
        newFile.id = fileId;
        delete newFile._id;
        return res.status(201).json(newFile);
      }
      const writeFileAsync = promisify(writeFile);
      const localPath = join(baseDir, uuid4());
      const base64DecodedData = Buffer.from(data, 'base64').toString('utf8');
      await writeFileAsync(localPath, base64DecodedData);
      newFile.localPath = localPath;
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
    return res.status(201).json(newFile);
  }
}

export default FilesController;
