const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema(
    {
        id: {
            type: String,
            required: true,
            trim: true,
        },
        type: {
            type: String,
            enum: ['behavioral', 'technical', 'hr'],
            required: true,
        },
        prompt: {
            type: String,
            required: true,
            trim: true,
        },
        guidance: {
            type: String,
            required: true,
            trim: true,
        },
    },
    { _id: false }
);

const analysisSchema = new mongoose.Schema(
    {
        communication_score: { type: Number, required: true, min: 0, max: 10 },
        relevance_score: { type: Number, required: true, min: 0, max: 10 },
        technical_depth: { type: Number, required: true, min: 0, max: 10 },
        behavioral_fit: { type: Number, required: true, min: 0, max: 10 },
        confidence: { type: Number, required: true, min: 0, max: 100 },
        strengths: {
            type: [String],
            default: [],
            validate: [(value) => value.length <= 3, 'Strengths can have at most 3 items'],
        },
        improvements: {
            type: [String],
            default: [],
            validate: [(value) => value.length <= 3, 'Improvements can have at most 3 items'],
        },
        short_feedback: { type: String, default: '' },
        hr_email_response: { type: String, default: '' },
    },
    { _id: false }
);

const answerSchema = new mongoose.Schema(
    {
        questionIndex: {
            type: Number,
            required: true,
            min: 0,
            max: 19,
        },
        questionType: {
            type: String,
            enum: ['behavioral', 'technical', 'hr'],
            required: true,
        },
        questionText: {
            type: String,
            required: true,
            trim: true,
        },
        answerText: {
            type: String,
            required: true,
            trim: true,
        },
        transcript: {
            type: String,
            default: '',
        },
        timeSpentSeconds: {
            type: Number,
            default: 0,
            min: 0,
            max: 60,
        },
        analysis: {
            type: analysisSchema,
            required: true,
        },
    },
    { _id: false }
);

const aiInterviewSessionSchema = new mongoose.Schema(
    {
        student: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },
        jobRole: {
            type: String,
            required: true,
            trim: true,
        },
        difficulty: {
            type: String,
            enum: ['easy', 'medium', 'hard'],
            default: 'medium',
        },
        interviewMode: {
            type: String,
            enum: ['without-resume', 'with-resume'],
            default: 'without-resume',
        },
        interviewType: {
            type: String,
            enum: ['technical', 'hr', 'pi'],
            default: 'technical',
        },
        resumeOriginalName: {
            type: String,
            default: '',
            trim: true,
        },
        resumeText: {
            type: String,
            default: '',
            trim: true,
        },
        resumeInsights: {
            type: String,
            default: '',
            trim: true,
        },
        status: {
            type: String,
            enum: ['draft', 'completed'],
            default: 'draft',
        },
        questions: {
            type: [questionSchema],
            default: [],
            validate: [(value) => value.length <= 20, 'Questions can have at most 20 items'],
        },
        answers: {
            type: [answerSchema],
            default: [],
            validate: [(value) => value.length <= 20, 'Answers can have at most 20 items'],
        },
        finalAnalysis: {
            type: analysisSchema,
            default: null,
        },
        startedAt: {
            type: Date,
            default: Date.now,
        },
        completedAt: {
            type: Date,
            default: null,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model('AIInterviewSession', aiInterviewSessionSchema);