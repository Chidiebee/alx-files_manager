import { MongoClient } from 'mongodb';
// import { promisify } from 'util';

class DBClient {
  constructor() {
    this.isConnected = false;
    const host = process.env.DB_HOST || 'localhost';
    const port = process.env.DB_PORT || 27017;
    const database = process.env.DB_DATABASE || 'files_manager';
    const url = `mongodb://${host}:${port}`;
    MongoClient(url, { useUnifiedTopology: true })
      .connect().then((client) => {
        this.client = client;
        this.isConnected = true;
        this.db = this.client.db(database);
        this.userCollection = this.db.collection('users');
        this.fileCollection = this.db.collection('files');
      }).catch(() => {
        this.isConnected = false;
      });
  }

  isAlive() {
    return this.isConnected;
  }

  async nbUsers() {
    return this.db.collection('users').countDocuments();
  }

  async nbFiles() {
    return this.db.collection('files').countDocuments();
  }
}

const dbClient = new DBClient();

export default dbClient;
