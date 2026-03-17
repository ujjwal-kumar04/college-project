const express = require('express');
const multer = require('multer');
const OpenAI = require('openai');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');

const AIInterviewSession = require('../models/AIInterviewSession');
const { auth, isStudent } = require('../middleware/auth');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });
const MIN_QUESTION_COUNT = 10;
const MAX_RESUME_CHARS = 4500;

const JOB_ROLE_LABELS = {
    'software-engineer': 'Software Engineer',
    'product-manager': 'Product Manager',
    'data-scientist': 'Data Scientist',
    'ui-ux-designer': 'UI/UX Designer',
};

const DIFFICULTY_LABELS = {
    easy: 'Easy',
    medium: 'Medium',
    hard: 'Hard',
};

const SESSION_VARIATION_PACKS = [
    {
        key: 'launch-crunch',
        behavioral: 'Bias toward examples from deadlines, launch pressure, or last-minute delivery changes.',
        technical: 'Prefer scenarios involving reliability during a high-traffic launch window.',
        hr: 'Favor culture-fit angles around ownership, urgency, and cross-functional clarity.',
    },
    {
        key: 'scale-up',
        behavioral: 'Bias toward examples from rapid growth, ambiguous requirements, or changing priorities.',
        technical: 'Prefer scenarios involving scale, latency, observability, or growth-stage systems.',
        hr: 'Favor culture-fit angles around adaptability, iteration speed, and initiative.',
    },
    {
        key: 'quality-first',
        behavioral: 'Bias toward examples involving feedback, quality improvements, or preventing failures.',
        technical: 'Prefer scenarios involving quality, edge cases, testing depth, and resilient system design.',
        hr: 'Favor culture-fit angles around craft, accountability, and structured thinking.',
    },
    {
        key: 'customer-impact',
        behavioral: 'Bias toward examples where user pain points or customer outcomes changed your approach.',
        technical: 'Prefer scenarios tied to user experience, product decisions, or measurable impact.',
        hr: 'Favor culture-fit angles around empathy, communication, and product judgment.',
    },
];

const DIFFICULTY_QUESTION_NOTES = {
    easy: 'Keep the question accessible and fundamentals-first.',
    medium: 'Require practical depth, tradeoffs, and realistic decisions.',
    hard: 'Require senior-level tradeoffs, ambiguity handling, and follow-up depth.',
};

const ROLE_FALLBACK_KEYWORDS = {
    'software-engineer': ['software', 'frontend', 'backend', 'developer', 'full stack', 'full-stack', 'engineer', 'cloud', 'security', 'cyber'],
    'product-manager': ['product', 'manager', 'growth', 'strategy', 'business', 'program'],
    'data-scientist': ['data', 'ml', 'machine learning', 'ai', 'analytics', 'scientist', 'research'],
    'ui-ux-designer': ['design', 'ux', 'ui', 'designer', 'researcher', 'visual'],
};

// Domain question bank — used as few-shot examples injected into AI prompts so the
// AI generates questions of the same topic depth and quality for each branch.
const DOMAIN_QUESTION_BANK = {
    cse: [
        'What is the difference between a Process and a Thread?',
        'Explain the four pillars of Object-Oriented Programming (OOP).',
        'How does a Load Balancer work in a distributed system?',
        'What are the advantages of using NoSQL over SQL?',
        'Explain the concept of Virtual Memory.',
        'What is a Deadlock, and how can it be prevented?',
        'Explain the difference between Deep Copy and Shallow Copy.',
        'How do Indexes work in a Database to speed up queries?',
        'What is the difference between Monolithic and Microservices architecture?',
        "What is a 'Closure' in JavaScript?",
        'Explain the Time Complexity of QuickSort in best and worst cases.',
        'What is the purpose of a Subnet Mask?',
        'How does the DNS (Domain Name System) resolve a URL?',
        'What is a JWT (JSON Web Token) and how is it used for authentication?',
        'Explain the concept of RESTful APIs.',
        'How do you handle merge conflicts in Git?',
        'What is the difference between Synchronous and Asynchronous programming?',
        'What is the CAP Theorem in distributed databases?',
        'How would you optimize a website that is loading very slowly?',
        'Explain the role of a Garbage Collector in languages like Java or Python.',
    ],
    'ai-ml': [
        'What is the difference between Supervised, Unsupervised, and Reinforcement Learning?',
        'Explain the Bias-Variance Tradeoff.',
        'What is Overfitting, and how can you prevent it using Regularization?',
        'How does a Gradient Descent algorithm work?',
        'What is the difference between L1 and L2 regularization?',
        'Explain the purpose of an Activation Function in a Neural Network.',
        'What is the difference between a Random Forest and an XGBoost model?',
        'How do you handle missing or outlier data in a dataset?',
        'What is a Confusion Matrix, and what are Precision and Recall?',
        'Explain the concept of Transfer Learning.',
        'What is the difference between a Generative Model and a Discriminative Model?',
        'How does the K-Means clustering algorithm decide the centers of clusters?',
        'What is Cross-Validation and why is it important?',
        'Explain the architecture of a Transformer model.',
        'What are Word Embeddings (like Word2Vec) in NLP?',
        'How do you deal with an imbalanced dataset (e.g., 99% class A, 1% class B)?',
        'What is the role of Hyperparameter Tuning?',
        'Explain the Curse of Dimensionality.',
        'What is the difference between Batch Normalization and Layer Normalization?',
        'How would you detect if your model is hallucinating in a Generative AI application?',
    ],
    ece: [
        'What is the difference between a Microprocessor and a Microcontroller?',
        'Explain the working principle of a PN Junction Diode.',
        'What is the significance of the Nyquist Sampling Theorem?',
        'Explain the difference between Amplitude Modulation (AM) and Frequency Modulation (FM).',
        'What are the different types of Serial Communication protocols (UART, SPI, I2C)?',
        'What is a Flip-Flop? Explain the difference between a Latch and a Flip-Flop.',
        'How does Pulse Code Modulation (PCM) work?',
        'What is the role of an Operational Amplifier (Op-Amp) in a circuit?',
        'Explain Setup Time and Hold Time in Digital Circuits.',
        'What is the difference between Combinational and Sequential circuits?',
        'How do you minimize power consumption in an Embedded System?',
        'What is the Doppler Effect in Radar communication?',
        'Explain the concept of Handover in Cellular Networks.',
        'What is a Smith Chart, and where is it used?',
        'Explain the working of a MOSFET as a switch.',
        'What is the difference between RISC and CISC architectures?',
        'How does an ADC (Analog to Digital Converter) work?',
        'What are Interrupts, and how are they handled in Real-Time Systems?',
        'Explain the concept of Impedance Matching.',
        'What is the difference between Half-Duplex and Full-Duplex communication?',
    ],
};

const QUESTION_FALLBACKS = {
    'software-engineer': [
        { id: 'se-1', type: 'behavioral', prompt: 'Tell me about a time you took ownership of a failing project. Explain it using the STAR method.', guidance: 'Show ownership, prioritization, and outcome.' },
        { id: 'se-2', type: 'behavioral', prompt: 'Describe a difficult engineering disagreement you resolved with a teammate using STAR.', guidance: 'Focus on collaboration and tradeoffs.' },
        { id: 'se-3', type: 'behavioral', prompt: 'Tell me about a time you improved a process without being asked.', guidance: 'Show initiative and measurable impact.' },
        { id: 'se-4', type: 'behavioral', prompt: 'Share a time you received tough feedback on code quality and how you acted on it.', guidance: 'Show growth mindset and measurable improvement.' },
        { id: 'se-5', type: 'technical', prompt: 'How would you design a scalable interview practice platform for thousands of concurrent users?', guidance: 'Cover architecture, scaling, and observability.' },
        { id: 'se-6', type: 'technical', prompt: 'How would you debug a sudden spike in API latency in production?', guidance: 'Explain your diagnosis sequence and tooling.' },
        { id: 'se-7', type: 'technical', prompt: 'What tradeoffs would you evaluate when choosing MongoDB versus PostgreSQL for interview session analytics?', guidance: 'Discuss schema, queries, and scaling.' },
        { id: 'se-8', type: 'technical', prompt: 'Describe how you would secure a JWT-based API used by both web and mobile clients.', guidance: 'Mention auth, rate-limits, token lifetime, and monitoring.' },
        { id: 'se-9', type: 'hr', prompt: 'Why does this software engineering role fit your long-term goals?', guidance: 'Connect motivation to growth and impact.' },
        { id: 'se-10', type: 'hr', prompt: 'What type of engineering culture helps you do your best work?', guidance: 'Show self-awareness and collaboration preferences.' },
    ],
    'product-manager': [
        { id: 'pm-1', type: 'behavioral', prompt: 'Tell me about a time you aligned conflicting stakeholders using the STAR method.', guidance: 'Show influence and decision clarity.' },
        { id: 'pm-2', type: 'behavioral', prompt: 'Describe a launch that did not meet expectations and how you responded.', guidance: 'Use metrics, learning, and iteration.' },
        { id: 'pm-3', type: 'behavioral', prompt: 'Share a time you had to say no to a high-visibility request.', guidance: 'Explain prioritization and communication.' },
        { id: 'pm-4', type: 'behavioral', prompt: 'Tell me about a roadmap decision where data and intuition disagreed.', guidance: 'Explain your decision process and outcome.' },
        { id: 'pm-5', type: 'technical', prompt: 'How would you define success metrics for an AI interview coach?', guidance: 'Include north star and supporting metrics.' },
        { id: 'pm-6', type: 'technical', prompt: 'How would you prioritize features when engineering bandwidth is cut in half?', guidance: 'Explain your framework and tradeoffs.' },
        { id: 'pm-7', type: 'technical', prompt: 'How would you investigate a drop in retention after a redesign?', guidance: 'Cover analysis, hypothesis, and experiments.' },
        { id: 'pm-8', type: 'technical', prompt: 'How would you launch this product for a new market with limited historical data?', guidance: 'Discuss risk management and incremental rollout.' },
        { id: 'pm-9', type: 'hr', prompt: 'What kind of product organization helps you perform at your highest level?', guidance: 'Discuss accountability and collaboration.' },
        { id: 'pm-10', type: 'hr', prompt: 'Why are you interested in this PM role right now?', guidance: 'Connect the role to user and business impact.' },
    ],
    'data-scientist': [
        { id: 'ds-1', type: 'behavioral', prompt: 'Tell me about a time you changed a business decision with data using STAR.', guidance: 'Highlight clarity and influence.' },
        { id: 'ds-2', type: 'behavioral', prompt: 'Describe a model or analysis that initially failed and how you recovered.', guidance: 'Show rigor and iteration.' },
        { id: 'ds-3', type: 'behavioral', prompt: 'Share a time you explained a complex analysis to non-technical stakeholders.', guidance: 'Focus on simplification and actionability.' },
        { id: 'ds-4', type: 'behavioral', prompt: 'Describe a time your recommendation was challenged by senior leadership.', guidance: 'Focus on communication, evidence, and adaptation.' },
        { id: 'ds-5', type: 'technical', prompt: 'How would you evaluate the quality of AI-generated answer feedback?', guidance: 'Cover offline metrics and user validation.' },
        { id: 'ds-6', type: 'technical', prompt: 'When would you prefer an interpretable model over a more accurate complex model?', guidance: 'Explain tradeoffs and risk.' },
        { id: 'ds-7', type: 'technical', prompt: 'How would you monitor data drift in a speech transcription pipeline?', guidance: 'Discuss signals and thresholds.' },
        { id: 'ds-8', type: 'technical', prompt: 'How would you design an experiment to validate interview score reliability?', guidance: 'Mention sampling, bias controls, and confidence intervals.' },
        { id: 'ds-9', type: 'hr', prompt: 'What makes a data science team high-performing for you?', guidance: 'Show collaboration and experimentation mindset.' },
        { id: 'ds-10', type: 'hr', prompt: 'How do you communicate uncertainty when stakeholders want a precise answer?', guidance: 'Show judgment and transparency.' },
    ],
    'ui-ux-designer': [
        { id: 'ux-1', type: 'behavioral', prompt: 'Tell me about a time you defended a user-centered decision using STAR.', guidance: 'Show research insight and persuasion.' },
        { id: 'ux-2', type: 'behavioral', prompt: 'Describe a project where constraints forced a design compromise.', guidance: 'Highlight prioritization and rationale.' },
        { id: 'ux-3', type: 'behavioral', prompt: 'Share a time critical feedback materially improved your design.', guidance: 'Show humility and iteration.' },
        { id: 'ux-4', type: 'behavioral', prompt: 'Share a project where user research changed your final design direction.', guidance: 'Explain how insights altered key decisions.' },
        { id: 'ux-5', type: 'technical', prompt: 'How would you design a mobile-first AI interview experience that reduces anxiety?', guidance: 'Discuss hierarchy, accessibility, and trust.' },
        { id: 'ux-6', type: 'technical', prompt: 'How would you validate an analytics-heavy dashboard with users?', guidance: 'Cover research methods and success criteria.' },
        { id: 'ux-7', type: 'technical', prompt: 'How do you balance visual polish and usability in data-dense interfaces?', guidance: 'Explain design tradeoffs clearly.' },
        { id: 'ux-8', type: 'technical', prompt: 'How would you design a resume-upload flow that feels trustworthy and clear?', guidance: 'Address privacy, status feedback, and accessibility.' },
        { id: 'ux-9', type: 'hr', prompt: 'What kind of feedback culture helps you produce your best design work?', guidance: 'Show openness and craft standards.' },
        { id: 'ux-10', type: 'hr', prompt: 'Why is this design role a strong fit for you?', guidance: 'Connect motivation to growth and impact.' },
    ],
};

const OPENAI_MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini';
const OPENAI_TTS_MODEL = process.env.OPENAI_TTS_MODEL || 'gpt-4o-mini-tts';
const OPENAI_TTS_VOICE = process.env.OPENAI_TTS_VOICE || 'alloy';
const OPENAI_STT_MODEL = process.env.OPENAI_STT_MODEL || 'whisper-1';
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
const AI_TEXT_PROVIDER = (process.env.AI_TEXT_PROVIDER || 'auto').toLowerCase();

let openai = null;
let gemini = null;

function getOpenAIClient() {
    if (!process.env.OPENAI_API_KEY) {
        return null;
    }

    if (!openai) {
        openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    }

    return openai;
}

function getGeminiClient() {
    if (!process.env.GEMINI_API_KEY) {
        return null;
    }

    if (!gemini) {
        gemini = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    }

    return gemini;
}

function getTextProvider() {
    if (AI_TEXT_PROVIDER === 'gemini') {
        return getGeminiClient() ? 'gemini' : 'none';
    }

    if (AI_TEXT_PROVIDER === 'openai') {
        return getOpenAIClient() ? 'openai' : 'none';
    }

    if (getGeminiClient()) {
        return 'gemini';
    }

    if (getOpenAIClient()) {
        return 'openai';
    }

    return 'none';
}

function normalizeJobRole(jobRole) {
    const normalized = String(jobRole || '').trim().toLowerCase();
    return normalized || 'software-engineer';
}

function formatJobRoleLabel(jobRole) {
    const normalized = normalizeJobRole(jobRole);
    if (JOB_ROLE_LABELS[normalized]) {
        return JOB_ROLE_LABELS[normalized];
    }

    return normalized
        .split(/[-_\s]+/)
        .filter(Boolean)
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(' ');
}

function getFallbackRoleKey(jobRole) {
    const normalized = normalizeJobRole(jobRole);
    if (QUESTION_FALLBACKS[normalized]) {
        return normalized;
    }

    const entry = Object.entries(ROLE_FALLBACK_KEYWORDS).find(([, keywords]) =>
        keywords.some((keyword) => normalized.includes(keyword))
    );

    return entry ? entry[0] : 'software-engineer';
}

function parseJson(text) {
    const cleaned = text.replace(/^```json\s*/i, '').replace(/```$/i, '').trim();
    return JSON.parse(cleaned);
}

function shuffleArray(items) {
    const cloned = [...items];
    for (let index = cloned.length - 1; index > 0; index -= 1) {
        const swapIndex = Math.floor(Math.random() * (index + 1));
        [cloned[index], cloned[swapIndex]] = [cloned[swapIndex], cloned[index]];
    }
    return cloned;
}

function pickRandom(items) {
    return items[Math.floor(Math.random() * items.length)];
}

function buildVariationPack() {
    const pack = pickRandom(SESSION_VARIATION_PACKS);
    const nonce = Math.random().toString(36).slice(2, 8);
    return {
        ...pack,
        nonce,
    };
}

function normalizeDifficulty(difficulty) {
    if (DIFFICULTY_LABELS[difficulty]) {
        return difficulty;
    }

    return 'medium';
}

function normalizeInterviewMode(mode) {
    if (mode === 'with-resume') {
        return 'with-resume';
    }

    return 'without-resume';
}

function normalizeInterviewType(type) {
    if (['technical', 'hr', 'pi'].includes(type)) {
        return type;
    }
    return 'technical';
}

const INTERVIEW_TYPE_DISTRIBUTION = {
    technical: { behavioral: 2, technical: 7, hr: 1 },
    hr:        { behavioral: 4, technical: 1, hr: 5 },
    pi:        { behavioral: 5, technical: 3, hr: 2 },
};

const INTERVIEW_TYPE_LABELS = {
    technical: 'Technical Round',
    hr: 'HR Round',
    pi: 'Personal Interview (PI)',
};

async function extractResumeText(file) {
    const mimetype = (file.mimetype || '').toLowerCase();
    const originalname = String(file.originalname || '').toLowerCase();

    if (mimetype.includes('pdf') || originalname.endsWith('.pdf')) {
        const parsed = await pdfParse(file.buffer);
        return String(parsed.text || '');
    }

    if (
        mimetype.includes('wordprocessingml.document') ||
        originalname.endsWith('.docx')
    ) {
        const parsed = await mammoth.extractRawText({ buffer: file.buffer });
        return String(parsed.value || '');
    }

    if (
        mimetype.startsWith('text/') ||
        originalname.endsWith('.txt') ||
        originalname.endsWith('.md')
    ) {
        return file.buffer.toString('utf8');
    }

    throw new Error('Unsupported resume format. Please upload PDF, DOCX, or TXT.');
}

function getDomainForRole(jobRole) {
    const normalized = normalizeJobRole(jobRole);
    const aiMlKeywords = ['ml', 'machine-learning', 'machine learning', 'ai-researcher', 'ai researcher', 'data-scientist', 'data scientist', 'nlp', 'deep-learning', 'deep learning'];
    const eceKeywords = ['embedded', 'vlsi', 'network-engineer', 'network engineer', 'ece', 'electronics', 'circuit', 'hardware', 'microcontroller', 'microprocessor', 'signal'];
    if (aiMlKeywords.some((kw) => normalized.includes(kw))) return 'ai-ml';
    if (eceKeywords.some((kw) => normalized.includes(kw))) return 'ece';
    return 'cse';
}

function buildQuestionPrompt({ jobRole, difficulty, interviewMode, interviewType, resumeInsights, resumeText, variationPack }) {
    const normalizedType = normalizeInterviewType(interviewType);
    const dist = INTERVIEW_TYPE_DISTRIBUTION[normalizedType];
    const typeLabel = INTERVIEW_TYPE_LABELS[normalizedType];
    const difficultyLabel = DIFFICULTY_LABELS[difficulty];
    const roleLabel = formatJobRoleLabel(jobRole);
    const domain = getDomainForRole(jobRole);
    const domainSamples = shuffleArray(DOMAIN_QUESTION_BANK[domain]).slice(0, 6);

    const resumeSection =
        interviewMode === 'with-resume' && (resumeInsights || resumeText)
            ? [
                '--- RESUME CONTEXT ---',
                resumeInsights ? `Insight summary:\n${resumeInsights}` : '',
                resumeText ? `Resume excerpt (first 2800 chars):\n${String(resumeText).slice(0, 2800)}` : '',
                'INSTRUCTION: Every technical and behavioral question MUST reference the candidate\'s actual projects, tools, frameworks, internships, or achievements from the resume above. Do NOT ask generic role-only questions.',
              ].filter(Boolean).join('\n')
            : '--- NO RESUME --- Do not assume any resume context. Keep all questions role-aligned and broadly applicable.';

    const domainSection = [
        '--- DOMAIN REFERENCE ---',
        `Use the topic depth and style of the following ${domain.toUpperCase()} questions as inspiration.`,
        'Generate FRESH questions of equal quality — do NOT copy these verbatim:',
        ...domainSamples.map((q, i) => `  ${i + 1}. ${q}`),
    ].join('\n');

    const distributionSection = [
        '--- QUESTION DISTRIBUTION ---',
        `Interview type : ${typeLabel}`,
        `Required breakdown (total = ${MIN_QUESTION_COUNT}):`,
        `  • behavioral  (type="behavioral") : ${dist.behavioral} questions — use STAR method framing`,
        `  • technical   (type="technical")  : ${dist.technical} questions — test domain knowledge and problem-solving`,
        `  • hr          (type="hr")         : ${dist.hr} questions — culture fit, motivation, self-awareness`,
        'IMPORTANT: The "type" field in each JSON object MUST be exactly one of: "behavioral", "technical", "hr".',
    ].join('\n');

    const variationSection = [
        '--- SESSION VARIATION (for uniqueness across sessions) ---',
        `Anchor key  : ${variationPack.key}-${variationPack.nonce}`,
        `Behavioral  : ${variationPack.behavioral}`,
        `Technical   : ${variationPack.technical}`,
        `HR          : ${variationPack.hr}`,
    ].join('\n');

    const difficultySection = [
        '--- DIFFICULTY ---',
        `Level : ${difficultyLabel}`,
        `Note  : ${DIFFICULTY_QUESTION_NOTES[difficulty]}`,
    ].join('\n');

    const outputSpec = [
        '--- OUTPUT FORMAT ---',
        `Return a valid JSON array of exactly ${MIN_QUESTION_COUNT} objects. Each object must have:`,
        '  id       : string, unique short slug (e.g. "tech-1", "beh-2")',
        '  type     : "behavioral" | "technical" | "hr"',
        '  prompt   : string, the interview question (clear, concise, high-signal)',
        '  guidance : string, 1-2 sentence answer hint for the candidate',
        'Do NOT wrap output in markdown fences. Return raw JSON only.',
    ].join('\n');

    return [
        `You are a senior FAANG interviewer conducting a ${typeLabel} for a ${roleLabel} candidate at ${difficultyLabel} difficulty.`,
        '',
        outputSpec,
        '',
        distributionSection,
        '',
        difficultySection,
        '',
        domainSection,
        '',
        variationSection,
        '',
        resumeSection,
    ].join('\n');
}

function buildResumeInsightPrompt({ jobRole, difficulty, resumeText }) {
    const clippedResume = String(resumeText || '').slice(0, MAX_RESUME_CHARS);
    const roleLabel = formatJobRoleLabel(jobRole);
    const difficultyLabel = DIFFICULTY_LABELS[difficulty];

    return [
        `You are an expert interview coach preparing a candidate for a ${roleLabel} interview at ${difficultyLabel} difficulty.`,
        '',
        '--- TASK ---',
        'Analyze the resume below and return a concise, recruiter-grade JSON insight object.',
        '',
        '--- OUTPUT FORMAT ---',
        'Return ONLY valid JSON with this exact shape (no markdown fences):',
        '{',
        '  "summary"      : "2-3 sentence overview of the candidate strength and readiness for this role",',
        '  "focusAreas"   : ["area1", "area2", "area3"],',
        '  "projectHooks" : ["specific project or achievement to deep-dive on", "another one"],',
        '  "riskAreas"    : ["potential weakness or thin area an interviewer might probe", "another one"],',
        '  "recommendedTone": "e.g. Confident and specific, or Humble yet technically sharp"',
        '}',
        '',
        '--- INSTRUCTIONS ---',
        `- Tailor every field specifically for a ${roleLabel} interview.`,
        '- focusAreas must be concrete skills or domains (e.g. "System Design", "Model Deployment", not generic phrases).',
        '- projectHooks must reference ACTUAL project names or technologies from the resume.',
        '- riskAreas must identify REAL gaps visible in this resume (missing metrics, thin experience, etc.).',
        '- Keep all string values short and actionable.',
        '',
        '--- RESUME ---',
        clippedResume,
    ].join('\n');
}

async function generateText(provider, { systemPrompt, userPrompt, temperature = 0.7 }) {
    if (provider === 'gemini') {
        const client = getGeminiClient();
        if (!client) {
            throw new Error('Gemini client is not configured.');
        }

        const model = client.getGenerativeModel({
            model: GEMINI_MODEL,
            generationConfig: { temperature },
        });
        const result = await model.generateContent(`${systemPrompt}\n\n${userPrompt}`);
        const text = result.response.text();
        return text || '';
    }

    const client = getOpenAIClient();
    if (!client) {
        throw new Error('OpenAI client is not configured.');
    }

    const response = await client.responses.create({
        model: OPENAI_MODEL,
        temperature,
        input: [
            {
                role: 'system',
                content: [{ type: 'input_text', text: systemPrompt }],
            },
            {
                role: 'user',
                content: [{ type: 'input_text', text: userPrompt }],
            },
        ],
    });

    return response.output_text || '';
}

function buildFallbackQuestions({ jobRole, difficulty, interviewMode, interviewType, resumeInsights, resumeText, variationPack }) {
    const normalizedRole = getFallbackRoleKey(jobRole);
    const normalizedDifficulty = normalizeDifficulty(difficulty);
    const normalizedMode = normalizeInterviewMode(interviewMode);
    const normalizedType = normalizeInterviewType(interviewType);
    const difficultyNote = DIFFICULTY_QUESTION_NOTES[normalizedDifficulty];
    const domain = getDomainForRole(jobRole);
    const dist = INTERVIEW_TYPE_DISTRIBUTION[normalizedType];

    console.log(`[buildFallbackQuestions] role=${normalizedRole} type=${normalizedType} dist=`, dist, `domain=${domain}`);

    const modeNote =
        normalizedMode === 'with-resume' && (resumeInsights || resumeText)
            ? `Use the candidate resume context: ${String(resumeInsights).split('\n')[0] || String(resumeText).slice(0, 180)}`
            : 'Ground the answer in projects, coursework, or internships.';

    // Technical questions from the domain bank (CSE / AI-ML / ECE specific)
    const techPool = shuffleArray(DOMAIN_QUESTION_BANK[domain]);
    const techQuestions = techPool.slice(0, dist.technical).map((q, i) => ({
        id: `fb-tech-${variationPack.key}-${variationPack.nonce}-${i + 1}`,
        type: 'technical',
        prompt: q,
        guidance: `${variationPack.technical} ${difficultyNote} ${modeNote}`.trim(),
    }));

    // Behavioral + HR from the existing role-specific fallback bank
    const bankPool = shuffleArray(QUESTION_FALLBACKS[normalizedRole]);
    const behavioralBank = bankPool.filter((q) => q.type === 'behavioral').slice(0, dist.behavioral).map((q, i) => ({
        ...q,
        id: `fb-beh-${variationPack.key}-${variationPack.nonce}-${i + 1}`,
        prompt: `${q.prompt} ${variationPack.behavioral}`.trim(),
        guidance: `${q.guidance} ${difficultyNote} ${modeNote}`.trim(),
    }));
    const hrBank = bankPool.filter((q) => q.type === 'hr').slice(0, dist.hr).map((q, i) => ({
        ...q,
        id: `fb-hr-${variationPack.key}-${variationPack.nonce}-${i + 1}`,
        prompt: `${q.prompt} ${variationPack.hr}`.trim(),
        guidance: `${q.guidance} ${difficultyNote} ${modeNote}`.trim(),
    }));

    const combined = shuffleArray([...techQuestions, ...behavioralBank, ...hrBank]);

    // Pad to MIN_QUESTION_COUNT if any bucket was underweight
    while (combined.length < MIN_QUESTION_COUNT) {
        const filler = bankPool[combined.length % bankPool.length];
        combined.push({
            ...filler,
            id: `fb-pad-${variationPack.nonce}-${combined.length}`,
            guidance: `${filler.guidance} ${difficultyNote} ${modeNote}`.trim(),
        });
    }

    return combined.slice(0, MIN_QUESTION_COUNT);
}

async function generateResumeInsights({ jobRole, difficulty, resumeText }) {
    const provider = getTextProvider();
    if (provider === 'none') {
        return {
            summary: 'Candidate resume parsed successfully. Questions will be tailored around listed projects and skills.',
            focusAreas: ['Core role fundamentals', 'Project impact storytelling', 'Problem-solving clarity'],
            projectHooks: ['Deep-dive on strongest project', 'Decision-making and tradeoff discussion'],
            riskAreas: ['Lack of quantifiable outcomes', 'Surface-level technical explanations'],
            recommendedTone: 'Confident and specific',
        };
    }

    try {
        const text = await generateText(provider, {
            systemPrompt: 'Return valid JSON only. Do not include markdown code fences.',
            userPrompt: buildResumeInsightPrompt({ jobRole, difficulty, resumeText }),
            temperature: 0.45,
        });

        const parsed = parseJson(text || '{}');
        return {
            summary: String(parsed.summary || '').trim(),
            focusAreas: Array.isArray(parsed.focusAreas) ? parsed.focusAreas.slice(0, 3).map((item) => String(item)) : [],
            projectHooks: Array.isArray(parsed.projectHooks) ? parsed.projectHooks.slice(0, 2).map((item) => String(item)) : [],
            riskAreas: Array.isArray(parsed.riskAreas) ? parsed.riskAreas.slice(0, 2).map((item) => String(item)) : [],
            recommendedTone: String(parsed.recommendedTone || '').trim(),
        };
    } catch (error) {
        console.error(`Resume insight generation failed (${provider}):`, error.message);
        return {
            summary: 'Resume scanned. Interview questions will target your most relevant role experiences.',
            focusAreas: ['STAR clarity', 'Technical depth', 'Role alignment'],
            projectHooks: ['Project architecture choices', 'Business impact articulation'],
            riskAreas: ['Missing measurable outcomes', 'Generic answers'],
            recommendedTone: 'Structured and outcome-focused',
        };
    }
}

function fallbackAnalysis(answerText) {
    const words = String(answerText || '').trim().split(/\s+/).filter(Boolean).length;
    const base = words > 120 ? 8 : words > 80 ? 7 : words > 35 ? 6 : 4;
    return {
        communication_score: base,
        relevance_score: Math.max(0, base - 1),
        technical_depth: Math.max(0, base - 1),
        behavioral_fit: base,
        confidence: Math.min(95, Math.max(40, words)),
        strengths: [
            'Answer addresses the prompt directly',
            'Response includes at least some specific detail',
            'Tone appears composed and professional',
        ],
        improvements: [
            'Structure the answer more clearly with Situation, Task, Action, Result',
            'Add measurable impact or evidence where possible',
            'End with what changed because of your actions',
        ],
        short_feedback: 'The answer is a reasonable start, but it would be stronger with sharper structure, more specific evidence, and a clearer outcome.',
        hr_email_response: 'Thank you for your response. You communicated a thoughtful baseline answer and showed positive intent. To improve future interviews, make your examples more structured, use measurable outcomes, and connect your actions more clearly to the result.',
    };
}

function aggregateAnalysis(answers) {
    if (!answers.length) {
        return fallbackAnalysis('');
    }

    const sum = answers.reduce(
        (acc, answer) => {
            acc.communication_score += answer.analysis.communication_score;
            acc.relevance_score += answer.analysis.relevance_score;
            acc.technical_depth += answer.analysis.technical_depth;
            acc.behavioral_fit += answer.analysis.behavioral_fit;
            acc.confidence += answer.analysis.confidence;
            acc.strengths.push(...(answer.analysis.strengths || []));
            acc.improvements.push(...(answer.analysis.improvements || []));
            return acc;
        },
        {
            communication_score: 0,
            relevance_score: 0,
            technical_depth: 0,
            behavioral_fit: 0,
            confidence: 0,
            strengths: [],
            improvements: [],
        }
    );

    const topItems = (items) => {
        const counts = new Map();
        items.forEach((item) => {
            const normalized = String(item || '').trim();
            if (!normalized) {
                return;
            }
            counts.set(normalized, (counts.get(normalized) || 0) + 1);
        });
        return [...counts.entries()]
            .sort((left, right) => right[1] - left[1])
            .slice(0, 3)
            .map(([item]) => item);
    };

    const count = answers.length;
    return {
        communication_score: Math.round(sum.communication_score / count),
        relevance_score: Math.round(sum.relevance_score / count),
        technical_depth: Math.round(sum.technical_depth / count),
        behavioral_fit: Math.round(sum.behavioral_fit / count),
        confidence: Math.round(sum.confidence / count),
        strengths: topItems(sum.strengths),
        improvements: topItems(sum.improvements),
        short_feedback: 'Overall, the session shows clear potential. The strongest improvement area is making answers more structured and evidence-based across the full interview.',
        hr_email_response: 'Thank you for completing the mock interview. You showed promising communication and role alignment. The next step is to tighten your answer structure, increase specificity, and make the business or technical impact of your work more explicit throughout your responses.',
    };
}

async function generateQuestions({ jobRole, difficulty, interviewMode, interviewType, resumeInsights, resumeText }) {
    const normalizedRole = normalizeJobRole(jobRole);
    const normalizedDifficulty = normalizeDifficulty(difficulty);
    const normalizedMode = normalizeInterviewMode(interviewMode);
    const normalizedType = normalizeInterviewType(interviewType);
    const variationPack = buildVariationPack();
    const provider = getTextProvider();
    const fallbackKey = getFallbackRoleKey(jobRole);

    console.log(`[generateQuestions] role=${normalizedRole} type=${normalizedType} difficulty=${normalizedDifficulty} mode=${normalizedMode} provider=${provider}`);

    if (provider === 'none') {
        throw new Error('AI question generation is unavailable. Configure GEMINI_API_KEY or OPENAI_API_KEY.');
    }

    try {
        const text = await generateText(provider, {
            systemPrompt: 'Return valid JSON only. Do not include markdown code fences.',
            userPrompt: buildQuestionPrompt({
                jobRole: normalizedRole,
                difficulty: normalizedDifficulty,
                interviewMode: normalizedMode,
                interviewType: normalizedType,
                resumeInsights,
                resumeText,
                variationPack,
            }),
            temperature: 1,
        });

        const parsed = parseJson(text || '[]');
        const fallbackSource = QUESTION_FALLBACKS[fallbackKey];
        if (!Array.isArray(parsed) || parsed.length < MIN_QUESTION_COUNT) {
            console.warn(`[generateQuestions] AI returned ${Array.isArray(parsed) ? parsed.length : 'non-array'} questions (need ${MIN_QUESTION_COUNT}) — switching to fallback`);
            return buildFallbackQuestions({
                jobRole,
                difficulty: normalizedDifficulty,
                interviewMode: normalizedMode,
                interviewType: normalizedType,
                resumeInsights,
                resumeText,
                variationPack,
            });
        }

        console.log(`[generateQuestions] AI generated ${parsed.length} questions via ${provider}`);
        return shuffleArray(parsed.slice(0, MIN_QUESTION_COUNT)).map((question, index) => ({
            id: String(question.id || `${normalizedRole}-${index + 1}`),
            type: ['behavioral', 'technical', 'hr'].includes(question.type) ? question.type : (fallbackSource[index] || fallbackSource[0]).type,
            prompt: String(question.prompt || (fallbackSource[index] || fallbackSource[0]).prompt),
            guidance: String(question.guidance || (fallbackSource[index] || fallbackSource[0]).guidance),
        }));
    } catch (error) {
        console.error(`[generateQuestions] AI generation failed (${provider}): ${error.message} — switching to fallback`);
        return buildFallbackQuestions({
            jobRole,
            difficulty: normalizedDifficulty,
            interviewMode: normalizedMode,
            interviewType: normalizedType,
            resumeInsights,
            resumeText,
            variationPack,
        });
    }
}

async function analyzeAnswer({ jobRole, difficulty, questionType, questionText, answerText }) {
    const provider = getTextProvider();

    if (provider === 'none') {
        return fallbackAnalysis(answerText);
    }

    try {
        const text = await generateText(provider, {
            systemPrompt: 'You are a senior FAANG HR interviewer with 10+ years experience. Evaluate the candidate answer using communication clarity, relevance, technical depth, behavioral fit, and overall impression. Use STAR method evaluation. Return valid JSON only in this exact shape: {"communication_score":0,"relevance_score":0,"technical_depth":0,"behavioral_fit":0,"confidence":0,"strengths":["","",""] ,"improvements":["","",""] ,"short_feedback":"","hr_email_response":""}. Do not include markdown code fences.',
            userPrompt: `Candidate role: ${formatJobRoleLabel(jobRole)}\nDifficulty: ${DIFFICULTY_LABELS[normalizeDifficulty(difficulty)]}\nQuestion type: ${questionType}\nQuestion: ${questionText}\nAnswer: ${answerText}`,
            temperature: 0.2,
        });

        const parsed = parseJson(text || '{}');
        return {
            communication_score: Math.max(0, Math.min(10, Math.round(Number(parsed.communication_score) || 0))),
            relevance_score: Math.max(0, Math.min(10, Math.round(Number(parsed.relevance_score) || 0))),
            technical_depth: Math.max(0, Math.min(10, Math.round(Number(parsed.technical_depth) || 0))),
            behavioral_fit: Math.max(0, Math.min(10, Math.round(Number(parsed.behavioral_fit) || 0))),
            confidence: Math.max(0, Math.min(100, Math.round(Number(parsed.confidence) || 0))),
            strengths: Array.isArray(parsed.strengths) ? parsed.strengths.slice(0, 3) : fallbackAnalysis(answerText).strengths,
            improvements: Array.isArray(parsed.improvements) ? parsed.improvements.slice(0, 3) : fallbackAnalysis(answerText).improvements,
            short_feedback: String(parsed.short_feedback || fallbackAnalysis(answerText).short_feedback),
            hr_email_response: String(parsed.hr_email_response || fallbackAnalysis(answerText).hr_email_response),
        };
    } catch (error) {
        console.error(`Answer analysis failed (${provider}):`, error.message);
        return fallbackAnalysis(answerText);
    }
}

function sanitizeSession(session) {
    return {
        id: session._id,
        jobRole: session.jobRole,
        difficulty: session.difficulty,
        interviewMode: session.interviewMode,
        interviewType: session.interviewType,
        resumeOriginalName: session.resumeOriginalName,
        resumeInsights: session.resumeInsights,
        status: session.status,
        questions: session.questions,
        answers: session.answers,
        finalAnalysis: session.finalAnalysis,
        startedAt: session.startedAt,
        completedAt: session.completedAt,
        createdAt: session.createdAt,
        updatedAt: session.updatedAt,
    };
}

router.post('/sessions', auth, isStudent, async (req, res) => {
    try {
        const jobRole = normalizeJobRole(req.body.jobRole);
        const difficulty = normalizeDifficulty(req.body.difficulty);
        const interviewMode = normalizeInterviewMode(req.body.interviewMode);
        const interviewType = normalizeInterviewType(req.body.interviewType);
        const resumeText = interviewMode === 'with-resume' ? String(req.body.resumeText || '').trim().slice(0, MAX_RESUME_CHARS) : '';
        const resumeOriginalName = interviewMode === 'with-resume' ? String(req.body.resumeOriginalName || '').trim() : '';
        const resumeInsights = interviewMode === 'with-resume' ? String(req.body.resumeInsights || '').trim().slice(0, 1800) : '';

        const session = await AIInterviewSession.create({
            student: req.user._id,
            jobRole,
            difficulty,
            interviewMode,
            interviewType,
            resumeText,
            resumeOriginalName,
            resumeInsights,
            status: 'draft',
        });

        res.status(201).json({ session: sanitizeSession(session) });
    } catch (error) {
        console.error('Create AI interview session error:', error);
        res.status(500).json({ message: 'Failed to create interview session.' });
    }
});

router.post('/resume-scan', auth, isStudent, upload.single('resume'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'Resume file is required.' });
        }

        const jobRole = normalizeJobRole(req.body.jobRole);
        const difficulty = normalizeDifficulty(req.body.difficulty);
        const resumeText = (await extractResumeText(req.file)).replace(/\s+/g, ' ').trim();

        if (!resumeText || resumeText.length < 60) {
            return res.status(400).json({ message: 'Resume content is too short. Upload a clearer PDF, DOCX, or TXT file.' });
        }

        const insightObject = await generateResumeInsights({ jobRole, difficulty, resumeText });
        const insightText = [
            `Summary: ${insightObject.summary}`,
            `Focus Areas: ${(insightObject.focusAreas || []).join(', ')}`,
            `Project Hooks: ${(insightObject.projectHooks || []).join(', ')}`,
            `Risk Areas: ${(insightObject.riskAreas || []).join(', ')}`,
            `Recommended Tone: ${insightObject.recommendedTone}`,
        ]
            .filter((line) => !line.endsWith(': '))
            .join('\n');

        res.json({
            resumeText: resumeText.slice(0, MAX_RESUME_CHARS),
            resumeInsights: insightText,
            insightObject,
            fileName: req.file.originalname || 'resume',
        });
    } catch (error) {
        console.error('Resume scan error:', error);
        res.status(500).json({ message: error.message || 'Failed to scan resume.' });
    }
});

router.get('/sessions', auth, isStudent, async (req, res) => {
    try {
        const sessions = await AIInterviewSession.find({ student: req.user._id }).sort({ createdAt: -1 });
        res.json({ sessions: sessions.map(sanitizeSession) });
    } catch (error) {
        console.error('Fetch AI interview sessions error:', error);
        res.status(500).json({ message: 'Failed to fetch interview history.' });
    }
});

router.get('/sessions/:sessionId', auth, isStudent, async (req, res) => {
    try {
        const session = await AIInterviewSession.findOne({ _id: req.params.sessionId, student: req.user._id });

        if (!session) {
            return res.status(404).json({ message: 'Interview session not found.' });
        }

        res.json({ session: sanitizeSession(session) });
    } catch (error) {
        console.error('Fetch AI interview session error:', error);
        res.status(500).json({ message: 'Failed to fetch interview session.' });
    }
});

router.post('/generate-questions', auth, isStudent, async (req, res) => {
    try {
        const { sessionId } = req.body;
        const session = await AIInterviewSession.findOne({ _id: sessionId, student: req.user._id });

        if (!session) {
            return res.status(404).json({ message: 'Interview session not found.' });
        }

        if (session.questions.length >= MIN_QUESTION_COUNT) {
            return res.json({ questions: session.questions, session: sanitizeSession(session) });
        }

        const questions = await generateQuestions({
            jobRole: session.jobRole,
            difficulty: session.difficulty,
            interviewMode: session.interviewMode,
            interviewType: session.interviewType,
            resumeInsights: session.resumeInsights,
            resumeText: session.resumeText,
        });
        session.questions = questions;
        await session.save();

        res.json({ questions, session: sanitizeSession(session) });
    } catch (error) {
        console.error('Generate questions error:', error);
        res.status(error.message.includes('unavailable') ? 503 : 500).json({ message: error.message || 'Failed to generate interview questions.' });
    }
});

router.post('/analyze-answer', auth, isStudent, async (req, res) => {
    try {
        const { sessionId, questionIndex, questionType, questionText, answerText, transcript, timeSpentSeconds } = req.body;
        const session = await AIInterviewSession.findOne({ _id: sessionId, student: req.user._id });

        if (!session) {
            return res.status(404).json({ message: 'Interview session not found.' });
        }

        const analysis = await analyzeAnswer({
            jobRole: session.jobRole,
            difficulty: session.difficulty,
            questionType,
            questionText,
            answerText,
        });

        const answerRecord = {
            questionIndex,
            questionType,
            questionText,
            answerText,
            transcript: transcript || '',
            timeSpentSeconds: Math.max(0, Math.min(60, Number(timeSpentSeconds) || 0)),
            analysis,
        };

        const existingIndex = session.answers.findIndex((item) => item.questionIndex === questionIndex);
        if (existingIndex >= 0) {
            session.answers[existingIndex] = answerRecord;
        } else {
            session.answers.push(answerRecord);
        }

        session.answers.sort((left, right) => left.questionIndex - right.questionIndex);
        await session.save();

        res.json({ analysis, answersSaved: session.answers.length });
    } catch (error) {
        console.error('Analyze answer error:', error);
        res.status(500).json({ message: 'Failed to analyze interview answer.' });
    }
});

router.post('/final-analysis', auth, isStudent, async (req, res) => {
    try {
        const { sessionId } = req.body;
        const session = await AIInterviewSession.findOne({ _id: sessionId, student: req.user._id });

        if (!session) {
            return res.status(404).json({ message: 'Interview session not found.' });
        }

        if (session.answers.length === 0) {
            return res.status(400).json({ message: 'At least one answer is required before final analysis.' });
        }

        const finalAnalysis = aggregateAnalysis(session.answers);
        session.finalAnalysis = finalAnalysis;
        session.status = 'completed';
        session.completedAt = new Date();
        await session.save();

        res.json({ finalAnalysis, session: sanitizeSession(session) });
    } catch (error) {
        console.error('Final analysis error:', error);
        res.status(500).json({ message: 'Failed to prepare final analysis.' });
    }
});

router.post('/speech-to-text', auth, isStudent, upload.single('audio'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'Audio file is required.' });
        }

        const client = getOpenAIClient();
        if (!client) {
            return res.status(503).json({ message: 'Speech-to-text is unavailable because OpenAI is not configured.' });
        }

        const transcription = await client.audio.transcriptions.create({
            file: await OpenAI.toFile(req.file.buffer, req.file.originalname || 'answer.webm', { type: req.file.mimetype || 'audio/webm' }),
            model: OPENAI_STT_MODEL,
        });

        res.json({ text: transcription.text || '' });
    } catch (error) {
        console.error('Speech-to-text error:', error);
        res.status(500).json({ message: 'Failed to transcribe audio.' });
    }
});

router.post('/text-to-speech', auth, isStudent, async (req, res) => {
    try {
        const text = String(req.body.text || '').trim();
        if (!text) {
            return res.status(400).json({ message: 'Text is required.' });
        }

        const client = getOpenAIClient();
        if (!client) {
            return res.status(503).json({ message: 'Text-to-speech is unavailable because OpenAI is not configured.' });
        }

        const audio = await client.audio.speech.create({
            model: OPENAI_TTS_MODEL,
            voice: OPENAI_TTS_VOICE,
            input: text,
            format: 'mp3',
        });

        const buffer = Buffer.from(await audio.arrayBuffer());
        res.setHeader('Content-Type', 'audio/mpeg');
        res.send(buffer);
    } catch (error) {
        console.error('Text-to-speech error:', error);
        res.status(500).json({ message: 'Failed to synthesize speech.' });
    }
});

module.exports = router;