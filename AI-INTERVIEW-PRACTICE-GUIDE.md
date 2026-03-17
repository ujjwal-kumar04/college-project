# AI Interview Practice Feature Guide

This feature is integrated into the existing McqQuiz frontend and backend.

## Student-only access

- Only authenticated users with `role: student` can access the feature.
- Frontend routes:
  - `/ai-interview`
  - `/ai-interview/session`
  - `/ai-interview/results/:sessionId`
  - `/ai-interview/history`

## Backend API routes

The feature is available under both namespaces below so it can be consumed cleanly inside the current app:

- `/api/ai-interviews/sessions`
- `/api/ai-interviews/generate-questions`
- `/api/ai-interviews/analyze-answer`
- `/api/ai-interviews/final-analysis`
- `/api/ai-interviews/speech-to-text`
- `/api/ai-interviews/text-to-speech`

Alias endpoints also exist at:

- `/api/sessions`
- `/api/generate-questions`
- `/api/analyze-answer`
- `/api/final-analysis`
- `/api/speech-to-text`
- `/api/text-to-speech`

## Database storage

Interview sessions are stored in MongoDB using the `AIInterviewSession` model.

Stored fields include:

- `student`
- `jobRole`
- `status`
- `questions`
- `answers`
- `finalAnalysis`
- `startedAt`
- `completedAt`

## Required backend environment variables

Add these to the backend environment used by `server.js`:

```env
OPENAI_API_KEY=
OPENAI_MODEL=gpt-4o-mini
OPENAI_TTS_MODEL=gpt-4o-mini-tts
OPENAI_TTS_VOICE=alloy
OPENAI_STT_MODEL=whisper-1
GEMINI_API_KEY=
GEMINI_MODEL=gemini-1.5-flash
AI_TEXT_PROVIDER=auto
JWT_SECRET=
SESSION_SECRET=
MONGODB_URI=
```

Notes:

- If `AI_TEXT_PROVIDER=auto`, backend first uses Gemini (when `GEMINI_API_KEY` is present), then falls back to OpenAI, then local deterministic fallback.
- Set `AI_TEXT_PROVIDER=gemini` to force Gemini for question generation and answer scoring.
- Set `AI_TEXT_PROVIDER=openai` to force OpenAI for question generation and answer scoring.
- Speech-to-text and text-to-speech require OpenAI to be configured.

## Frontend dependencies added

- `framer-motion`
- `recharts`
- `lucide-react`

## Local run steps

### Backend

```bash
cd backend
npm install
npm run dev
```

### Frontend

```bash
cd frontend
npm install
npm start
```

## Deployment notes

- Ensure the frontend `REACT_APP_API_URL` points to the deployed Express backend.
- Ensure CORS in `backend/server.js` includes the deployed frontend origin.
- For production speech features, deploy on HTTPS so microphone access works correctly in browsers.