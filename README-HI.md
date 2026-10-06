# Telegram Quiz Publisher — Vercel Ready

## Vercel
इस project को Vercel में deploy करें। Root URL पर `index.html` खुलेगा।

Routes:
- `/` → Home
- `/seema` → Quiz Publisher
- `/seema.html` → Quiz Publisher
- `/api/send-quiz` → Telegram serverless API

Vercel को `vercel.json` और `api/send-quiz.js` serverless endpoint दिया गया है।

## Local
```bash
npm install
npm start
```

## Security
Bot token source code में hard-code नहीं है। Panel से runtime पर दिया जाता है।
यदि कोई bot token public/share हो चुका है तो उसे BotFather से regenerate करें।
