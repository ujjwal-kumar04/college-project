const express = require('express');
const QuestionBank = require('../models/QuestionBank');

const router = express.Router();

// @route   GET /api/question-bank/meta
// @desc    Get categories and topics for quick filters
// @access  Public
router.get('/meta', async (_req, res) => {
  try {
    const categories = await QuestionBank.distinct('category');
    const topics = await QuestionBank.aggregate([
      {
        $group: {
          _id: '$category',
          topics: { $addToSet: '$topic' },
        },
      },
      {
        $project: {
          _id: 0,
          category: '$_id',
          topics: 1,
        },
      },
      { $sort: { category: 1 } },
    ]);

    res.json({ success: true, categories: categories.sort(), topics });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch question bank metadata', error: error.message });
  }
});

// @route   GET /api/question-bank
// @desc    Search and filter question bank
// @access  Public
router.get('/', async (req, res) => {
  try {
    const {
      q = '',
      category = '',
      topic = '',
      page = 1,
      limit = 20,
    } = req.query;

    const parsedPage = Math.max(parseInt(page, 10) || 1, 1);
    const parsedLimit = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 100);

    const filter = {};
    if (category) filter.categorySlug = String(category).toLowerCase().trim();
    if (topic) filter.topicSlug = String(topic).toLowerCase().trim();

    const projection = {
      _id: 1,
      sourceId: 1,
      category: 1,
      topic: 1,
      question: 1,
      options: 1,
      answer: 1,
      explanation: 1,
    };

    let sort = { sourceId: 1 };
    if (q && String(q).trim()) {
      filter.$text = { $search: String(q).trim() };
      projection.score = { $meta: 'textScore' };
      sort = { score: { $meta: 'textScore' }, sourceId: 1 };
    }

    const [total, rows] = await Promise.all([
      QuestionBank.countDocuments(filter),
      QuestionBank.find(filter, projection)
        .sort(sort)
        .skip((parsedPage - 1) * parsedLimit)
        .limit(parsedLimit)
        .lean(),
    ]);

    res.json({
      success: true,
      page: parsedPage,
      limit: parsedLimit,
      total,
      totalPages: Math.max(Math.ceil(total / parsedLimit), 1),
      results: rows,
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch question bank', error: error.message });
  }
});

module.exports = router;
