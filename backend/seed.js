require('dotenv').config();
const readline = require('readline/promises');
const { MongoClient } = require('mongodb');
const { promises: fs } = require('fs');
const { fileURLToPath } = require('url');
const { dirname, join, extname } = require('path');

const dbName = 'courseEvaluations';
const dataFilesPath = join(__dirname, '/data');
const metadataTokens = [
  { property: 'term', parse: (rawObj) => rawObj.metadata['Term'] },
  {
    property: 'description',
    parse: (rawObj) => rawObj.metadata['Class Description'].replace(/\s\s+/g, ' '),
  },
  { property: 'location', parse: (rawObj) => rawObj.metadata['Location'] },
  { property: 'instructors', parse: (rawObj) => rawObj.metadata['Instructor(s)'].split(', ') },
  { property: 'totalEnrolled', parse: (rawObj) => Number(rawObj.metadata['Total Enrolled']) },
  { property: 'totalResponses', parse: (rawObj) => Number(rawObj.metadata['Total Responses']) },
  {
    property: 'responseRate',
    parse: (rawObj) => parseFloat(rawObj.metadata['Response Rate']) / 100,
  },
];

const createSearchIndexes = (...args) => {
  const str = args.map(arg => arg.trim().replace(/\s\s+/g, ' ')).join(' ');
  let res = [];
  const min = 3;
  if (!!str && str.length > min) {
    str.split(" ").forEach((token) => {
      if (token.length >= min) {
        for (let i = min; i <= str.length && i <= token.length; ++i) {
          res = [...res, token.substring(0, i)];
        }
      }
    });
  }
  return res.length === 0 ? [str] : res;
}

const seedDB = async () => {
  const client = new MongoClient(process.env.ATLAS_URI);

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
          course.searchIndexes = createSearchIndexes(course.description, course.instructors.join(' '));
          entries.push(course);
        });
      }
    }

    await collection.insertMany(entries);
    // await collection.createIndex({description: 'text', "instructors.text": "text"}, {name: "searchIndex"});
    console.log('Successfully seeded.');
    client.close();
  } catch (err) {
    console.error(err);
  }
};

const promptSeed = async () => {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  const answer = await rl.question(
    'Are you sure you want to seed the DB? This process will drop the current collection (Y/n): ',
  );

  if (answer === 'Y') {
    await seedDB();
  }

  rl.close();
};

promptSeed();
