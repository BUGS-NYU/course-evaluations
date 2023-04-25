import * as dotenv from 'dotenv';
import { MongoClient } from 'mongodb';
import { promises as fs } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join, extname } from 'path';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dbName = 'courseEvaluations';
const dataFilesPath = join(__dirname, '/data');
const metadataTokens = [
  { property: 'term', parse: (rawObj) => rawObj.metadata['Term'] },
  { property: 'description', parse: (rawObj) => rawObj.metadata['Class Description'] },
  { property: 'location', parse: (rawObj) => rawObj.metadata['Location'] },
  { property: 'instructors', parse: (rawObj) => rawObj.metadata['Instructor(s)'].split(', ') },
  { property: 'totalEnrolled', parse: (rawObj) => Number(rawObj.metadata['Total Enrolled']) },
  { property: 'totalResponses', parse: (rawObj) => Number(rawObj.metadata['Total Responses']) },
  {
    property: 'responseRate',
    parse: (rawObj) => parseFloat(rawObj.metadata['Response Rate']) / 100,
  },
];

const seedDB = async () => {
  const client = new MongoClient(process.env.ATLAS_URI, { useNewUrlParser: true });

  try {
    await client.connect();
    console.log('Connected to the server...');

    const collection = client.db(dbName).collection('evaluations');

    // remove the entire collection before seeding it once again
    await collection.drop();

    const entries = [];
    const fileNames = await fs.readdir(dataFilesPath);

    for (const fileName of fileNames) {
      // ensure that the file read is JSON
      if (extname(fileName) === '.json') {
        const filePath = join(dataFilesPath, fileName);
        const data = await fs.readFile(filePath, 'utf8');
        const parsedData = JSON.parse(data);

        parsedData.coursesData.forEach((rawCourse) => {
          const course = {};
          course.metadata = rawCourse.metadata;
          metadataTokens.forEach(({ property, parse }) => (course[property] = parse(rawCourse)));
          course.questionSections = rawCourse.questionSections;
          entries.push(course);
        });
      }
    }

    await collection.insertMany(entries);
    console.log('Successfully seeded.');
    client.close();
  } catch (err) {
    console.error(err);
  }
};

seedDB();
