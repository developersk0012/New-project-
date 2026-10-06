# Telegram Quiz Publisher V3

Vercel root:
- `/` Home
- `/seema.html` Quiz Panel
- `/error.html` Error Checker
- `/test-quiz.json` One-question testing JSON
- `/api/send-quiz` Telegram serverless function

Deploy the CONTENTS of this folder as the Vercel project root.
Do not put the files inside another nested folder.

For a test, open Seema Panel and upload `test-quiz.json`.
The test JSON contains exactly one complete question with 4 options and correctOption.

Bot token is entered at runtime and is not stored in source code.
