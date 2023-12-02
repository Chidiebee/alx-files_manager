import { createClient } from 'redis';
import { promisify } from 'util';

class RedisClient {
  constructor() {
    this.client = createClient();
    this.isConnected = true;
    this.client.on('connect', () => {
      this.isConnected = true;
    });
    this.client.on('error', (err) => {
      console.log(`Error connecting to redis: ${err.message}`);
      this.isConnected = false;
    });
  }

  isAlive() {
    return this.isConnected;
  }

  async get(key) {
    this.client.get = promisify(this.client.get);
    return this.client.get(key);
  }

  async set(key, value, duration) {
    this.client.setex = promisify(this.client.setex);
    await this.client.setex(key, duration, value);
  }

  async del(key) {
    this.client.del = promisify(this.client.del);
    await this.client.del(key);
  }
}

const redisClient = new RedisClient();

export default redisClient;
