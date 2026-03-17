const mongoose = require('mongoose');

const questionBankSchema = new mongoose.Schema(
  {
    sourceId: {
      type: Number,
      required: true,
      unique: true,
      index: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    topic: {
      type: String,
      required: true,
      trim: true,
    },
    categorySlug: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    topicSlug: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    question: {
      type: String,
      required: true,
      trim: true,
    },
    options: {
      type: [String],
      validate: [(value) => value.length >= 2, 'Question must have at least 2 options'],
      required: true,
    },
    answer: {
      type: String,
      required: true,
      trim: true,
    },
    explanation: {
      type: String,
      default: '',
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

const toSlug = (value) => String(value || '').toLowerCase().trim().replace(/\s+/g, '-');

questionBankSchema.pre('validate', function setSlugs(next) {
  this.categorySlug = toSlug(this.category);
  this.topicSlug = toSlug(this.topic);
  next();
});

// Fast category-topic listing and filtered pagination.
questionBankSchema.index({ categorySlug: 1, topicSlug: 1, sourceId: 1 });
// Fast full text search on question bank.
questionBankSchema.index(
  { question: 'text', explanation: 'text', topic: 'text', category: 'text' },
  { weights: { question: 8, topic: 3, category: 2, explanation: 1 } }
);

module.exports = mongoose.model('QuestionBank', questionBankSchema);
