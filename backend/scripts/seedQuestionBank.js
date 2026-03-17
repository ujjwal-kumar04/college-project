require('dotenv').config();
const path = require('path');
const mongoose = require('mongoose');
const QuestionBank = require('../models/QuestionBank');

async function seed() {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/mcqquiz';
  const sourcePath = path.resolve(__dirname, '../../frontend/src/data/questions.json');

  const dataset = require(sourcePath);

  if (!Array.isArray(dataset) || dataset.length === 0) {
    throw new Error('questions.json is empty or invalid');
  }

  await mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  const operations = dataset.map((item) => ({
    updateOne: {
      filter: { sourceId: item.id },
      update: {
        $set: {
          sourceId: item.id,
          category: item.category,
          topic: item.topic,
          question: item.question,
          options: item.options,
          answer: item.answer,
          explanation: item.explanation || '',
        },
      },
      upsert: true,
    },
  }));

  const result = await QuestionBank.bulkWrite(operations, { ordered: false });

  const total = await QuestionBank.countDocuments();
  console.log('Question bank seeded.');
  console.log('Matched:', result.matchedCount || 0);
  console.log('Modified:', result.modifiedCount || 0);
  console.log('Upserted:', result.upsertedCount || 0);
  console.log('Total in DB:', total);

  await mongoose.disconnect();
}

seed().catch(async (error) => {
  console.error('Seed failed:', error.message);
  await mongoose.disconnect();
  process.exit(1);
});
