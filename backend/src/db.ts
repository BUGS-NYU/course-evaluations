import * as dotenv from 'dotenv';
import { MongoClient } from 'mongodb';
import { DB_NAME, EVALUATIONS_COLLECTION } from './constants';

dotenv.config();

const client = new MongoClient(process.env.ATLAS_URI);

const connectToDB = async () => {
  try {
    await client.connect();
    console.log('Connected to DB...');
  } catch (error) {
    console.error(error);
  }
};

const getDB = () => client.db(DB_NAME);

const getEvaluationsCollection = () => getDB().collection(EVALUATIONS_COLLECTION);

const disconnectFromDB = () => {
  client.close();
};

export { connectToDB, disconnectFromDB, getDB, getEvaluationsCollection };
