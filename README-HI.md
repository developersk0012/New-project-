# Telegram Account Quiz Publisher

यह वेबसाइट **आपके अपने Telegram account** को MTProto के जरिए login कराकर group में quiz polls भेजती है। Bot Token की जरूरत नहीं है।

## जरूरी बातें
- Node.js 22+ recommended.
- `npm install`
- `npm start`
- Browser में `http://localhost:3000` खोलें.
- API ID/API Hash को public HTML/JS में नहीं डालना है.
- Login session `data/session.txt` में server-side रखा जाता है; इस file को share न करें.
- Vercel serverless पर यह login flow recommended नहीं है क्योंकि Telegram session और interactive authorization के लिए persistent server चाहिए. VPS/Render/Railway जैसी persistent Node hosting बेहतर है.

## Login flow
1. API ID + API Hash + अपना phone number डालें.
2. Send Login Code.
3. Telegram में आया code डालें.
4. अगर 2FA है तो 2FA password डालें.
5. Group ID check करें.
6. JSON load करें.
7. पहले Send Test Quiz करें.
8. सही होने पर Publish All.

## JSON format
```json
{
  "questions": [
    {
      "question": "2 + 2 = ?",
      "options": ["3", "4", "5", "6"],
      "correctOption": 1,
      "explanation": "2 + 2 = 4"
    }
  ]
}
```
`correctOption` zero-based है: A=0, B=1, C=2, D=3.

## Security
- API Hash और session string को GitHub/public ZIP में real values के साथ upload न करें.
- यदि API Hash कहीं public हो गया है, Telegram app credentials को सुरक्षित तरीके से बदलने/rotate करने पर विचार करें.
- केवल अपने account और authorized groups का उपयोग करें.
- Telegram rate limits को bypass करने की कोशिश न करें; delay बढ़ाएँ.
