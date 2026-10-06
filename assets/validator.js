/* Quiz JSON validator — used by seema.html and error.html */
(function (root) {
  var LIM = { q: 300, opt: 100, exp: 200, minOpt: 2, maxOpt: 10 };

  function validate(text) {
    var errors = [], data;
    try { data = JSON.parse(text); }
    catch (e) { return { ok: false, errors: ["JSON syntax galat hai: " + e.message], questions: [] }; }

    var list = Array.isArray(data) ? data : data && data.questions;
    if (!Array.isArray(list)) return { ok: false, errors: ['JSON mein "questions" naam ki array honi chahiye.'], questions: [] };
    if (!list.length) return { ok: false, errors: ['"questions" array khaali hai.'], questions: [] };

    var out = [];
    list.forEach(function (item, i) {
      var n = "Question " + (i + 1) + ": ";
      if (!item || typeof item !== "object") { errors.push(n + "object hona chahiye."); return; }
      var bad = false;
      function err(m) { errors.push(n + m); bad = true; }

      if (typeof item.question !== "string" || !item.question.trim()) err('"question" text missing ya khaali hai.');
      else if (item.question.length > LIM.q) err('"question" ' + item.question.length + " characters ka hai (max " + LIM.q + ").");

      var opts = item.options;
      if (!Array.isArray(opts)) err('"options" array honi chahiye.');
      else {
        if (opts.length < LIM.minOpt || opts.length > LIM.maxOpt) err("options " + LIM.minOpt + " se " + LIM.maxOpt + " ke beech hone chahiye (abhi " + opts.length + ").");
        var seen = {};
        opts.forEach(function (o, k) {
          if (typeof o !== "string" || !o.trim()) err("option " + (k + 1) + " khaali ya text nahi hai.");
          else {
            if (o.length > LIM.opt) err("option " + (k + 1) + " " + o.length + " characters ka hai (max " + LIM.opt + ").");
            if (seen[o.trim()]) err('option "' + o + '" do baar aaya hai.');
            seen[o.trim()] = 1;
          }
        });
      }

      if (typeof item.correct_answer !== "string" || !item.correct_answer.trim()) err('"correct_answer" missing hai.');
      else if (Array.isArray(opts) && opts.map(function (o) { return String(o).trim(); }).indexOf(item.correct_answer.trim()) === -1)
        err('"correct_answer" (' + item.correct_answer + ") options mein nahi mila. Option ka text bilkul same likhein.");

      if (item.explanation != null) {
        if (typeof item.explanation !== "string") err('"explanation" text honi chahiye.');
        else if (item.explanation.length > LIM.exp) err('"explanation" ' + item.explanation.length + " characters ki hai (max " + LIM.exp + ").");
      }

      if (!bad) out.push({
        question: item.question.trim(),
        options: opts.map(function (o) { return o.trim(); }),
        correct_answer: item.correct_answer.trim(),
        explanation: item.explanation ? item.explanation.trim() : ""
      });
    });
    return { ok: errors.length === 0, errors: errors, questions: out };
  }

  var api = { validate: validate, LIMITS: LIM };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.QuizValidator = api;
})(this);
