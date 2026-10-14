/* Universal quiz importer (admin upload). Works in browser and Node.
   Files: .json  .html/.htm  .php  .js  .txt/.md  .csv  (ya paste kiya hua text)
   - JSON / JS / PHP data:  [ {question, options, answer} ]  {questions:[...]}  [ {q,o,a} ]  $q = array('question'=>..)
   - HTML: <script> ke andar array/JSON, data-attributes, ya page par likhe hue questions (li / radio / class="correct")
   - Text: "Q1. ...  A) ...  B) ...  Answer: B"   (Hindi: प्रश्न / उत्तर / (अ)(ब)(स)(द) bhi chalega)
   Answer: letter A-F, option text, number (0 ya 1 se), correct:true flag, class="correct"
   Public API:  parseQuizJson(raw, base)   parseQuizFile(text, filename, base)                                   */
(function (root) {
  "use strict";
  var Q_KEYS = ["question", "q", "text", "title", "prompt", "Question", "Q", "ques", "que", "statement", "प्रश्न", "सवाल"];
  var OPT_KEYS = ["options", "choices", "opts", "answers", "option", "o", "Options", "Choices", "विकल्प"];
  var ZERO_KEYS = ["correct_option_id", "correct_index", "correctIndex", "answerIndex", "answer_index", "correctOption0", "correct_idx", "answer_idx"];
  var ANY_KEYS = ["correct", "correctAnswer", "correct_answer", "answer", "ans", "right", "rightAnswer", "right_answer", "correctOption", "correct_option", "solution_option", "Answer", "Ans", "Correct", "CorrectAnswer", "correctChoice", "correct_choice", "key", "उत्तर", "सही_उत्तर", "सही उत्तर", "sahi_uttar"];
  var EXP_KEYS = ["explanation", "explain", "reason", "solution", "hint", "e", "Explanation", "exp", "व्याख्या", "हल", "स्पष्टीकरण"];
  var FLAG_KEYS = ["correct", "isCorrect", "is_correct", "right", "isRight", "is_right", "answer"];
  var LETTERS = "abcdef", DEV = "कखगघङच", HI = "अबसद";

  function has(v) { return v !== undefined && v !== null && v !== ""; }
  function pick(o, keys) { for (var i = 0; i < keys.length; i++) { var v = o[keys[i]]; if (has(v)) return v; } }
  function text(x) { return x && typeof x === "object" ? String(x.text != null ? x.text : x.label != null ? x.label : x.value != null ? x.value : x.option != null ? x.option : "") : String(x == null ? "" : x); }
  function truthy(v) { return v === true || v === 1 || /^(true|yes|1|correct|right|y)$/i.test(String(v == null ? "" : v).trim()); }
  function labelIndex(ch) {
    var c = String(ch).toLowerCase(), i = LETTERS.indexOf(c);
    if (i >= 0 && c.length === 1) return i;
    i = DEV.indexOf(ch); if (i >= 0) return i;
    i = HI.indexOf(ch); return i;
  }

  /* ---------- lenient literal parser: JSON / JS / PHP arrays, comments, 'quotes', trailing commas, => ---------- */
  function Lit(s) { this.s = s; this.i = 0; this.n = s.length; }
  Lit.prototype.fail = function (m) { throw new Error(m + " @" + this.i); };
  Lit.prototype.skipLine = function () { var e = this.s.indexOf("\n", this.i); this.i = e < 0 ? this.n : e + 1; };
  Lit.prototype.ws = function () {
    var s = this.s;
    for (;;) {
      var c = s[this.i];
      if (c === undefined) return;
      if (c <= " " || c === "\u00a0" || c === "\ufeff") { this.i++; continue; }
      if (c === "/" && s[this.i + 1] === "/") { this.skipLine(); continue; }
      if (c === "#") { this.skipLine(); continue; }
      if (c === "/" && s[this.i + 1] === "*") { var e = s.indexOf("*/", this.i + 2); this.i = e < 0 ? this.n : e + 2; continue; }
      return;
    }
  };
  Lit.prototype.str = function () {
    var s = this.s, q = s[this.i++], out = "";
    for (;;) {
      if (this.i >= this.n) this.fail("unterminated string");
      var ch = s[this.i++];
      if (ch === q) break;
      if (ch === "\\") {
        var e = s[this.i++];
        if (e === "n") out += "\n"; else if (e === "t") out += "\t"; else if (e === "r") out += "";
        else if (e === "b") out += "\b"; else if (e === "f") out += "\f";
        else if (e === "u") {
          if (s[this.i] === "{") { var cl = s.indexOf("}", this.i); out += String.fromCodePoint(parseInt(s.slice(this.i + 1, cl), 16)); this.i = cl + 1; }
          else { out += String.fromCharCode(parseInt(s.substr(this.i, 4), 16)); this.i += 4; }
        } else if (e === "x") { out += String.fromCharCode(parseInt(s.substr(this.i, 2), 16)); this.i += 2; }
        else if (e === "\n") { /* line continuation */ }
        else out += e;
      } else out += ch;
    }
    // string concatenation: 'a' + 'b'   /   'a' . 'b'
    for (;;) {
      var save = this.i; this.ws();
      var c = this.s[this.i];
      if ((c === "+" || c === ".") && !/[0-9]/.test(this.s[this.i + 1] || "")) {
        this.i++; this.ws();
        var d = this.s[this.i];
        if (d === "'" || d === '"' || d === "`") { out += this.str(); return out; }
      }
      this.i = save; return out;
    }
  };
  Lit.prototype.num = function () {
    var m = /^[+-]?(?:\d+\.?\d*|\.\d+)(?:[eE][+-]?\d+)?/.exec(this.s.slice(this.i, this.i + 40));
    if (!m) this.fail("invalid number"); this.i += m[0].length; return Number(m[0]);
  };
  Lit.prototype.arr = function (close, depth) {
    this.i++; var list = [], obj = null;
    for (;;) {
      this.ws();
      var c = this.s[this.i];
      if (c === undefined) this.fail("unterminated array");
      if (c === close) { this.i++; return obj || list; }
      if (c === ",") { this.i++; continue; }
      var v = this.value(depth + 1); this.ws();
      if (this.s.substr(this.i, 2) === "=>") {
        this.i += 2;
        var val = this.value(depth + 1);
        if (!obj) { obj = {}; list.forEach(function (x, k) { obj[k] = x; }); }
        obj[String(v)] = val;
      } else if (obj) obj[Object.keys(obj).length] = v; else list.push(v);
      this.ws();
      var d = this.s[this.i];
      if (d === ",") this.i++; else if (d !== close) this.fail("expected ','");
    }
  };
  Lit.prototype.obj = function (depth) {
    this.i++; var o = {};
    for (;;) {
      this.ws();
      var c = this.s[this.i];
      if (c === undefined) this.fail("unterminated object");
      if (c === "}") { this.i++; return o; }
      if (c === ",") { this.i++; continue; }
      var key;
      if (c === '"' || c === "'" || c === "`") key = this.str();
      else { var m = /^[^\s:,'"{}\[\]=]+/.exec(this.s.slice(this.i, this.i + 80)); if (!m) this.fail("key galat"); key = m[0]; this.i += key.length; }
      this.ws();
      if (this.s[this.i] === ":") this.i++; else if (this.s.substr(this.i, 2) === "=>") this.i += 2; else this.fail("expected ':'");
      o[key] = this.value(depth + 1); this.ws();
      var d = this.s[this.i];
      if (d === ",") this.i++; else if (d !== "}") this.fail("expected ','");
    }
  };
  Lit.prototype.value = function (depth) {
    if (depth > 40) this.fail("nested too deeply");
    this.ws();
    var c = this.s[this.i];
    if (c === "[") return this.arr("]", depth);
    if (c === "{") return this.obj(depth);
    if (c === "'" || c === '"' || c === "`") return this.str();
    if (c === "-" || c === "+" || c === "." || (c >= "0" && c <= "9")) return this.num();
    var m = /^[A-Za-z_$][\w$]*/.exec(this.s.slice(this.i, this.i + 40));
    if (!m) this.fail("could not understand the value");
    var low = m[0].toLowerCase();
    if (low === "array") { this.i += m[0].length; this.ws(); if (this.s[this.i] === "(") return this.arr(")", depth); this.fail("expected array("); }
    this.i += m[0].length;
    if (low === "true") return true; if (low === "false") return false;
    if (low === "null" || low === "undefined") return null;
    this.fail("unknown value " + m[0]);
  };
  function parseLiteral(s) { var L = new Lit(s); var v = L.value(0); L.ws(); return v; }

  /* ---------- options / answer helpers ---------- */
  function stripLabels(opts) {
    if (opts.length < 2) return opts;
    var re = /^\s*\(?([A-Fa-f]|[कखगघअबसद]|[1-6])\)?\s*[.):\-]\s+/, idx = [];
    for (var i = 0; i < opts.length; i++) {
      var m = re.exec(opts[i]); if (!m) return opts;
      idx.push(/\d/.test(m[1]) ? +m[1] - 1 : labelIndex(m[1]));
    }
    for (var k = 0; k < idx.length; k++) if (idx[k] !== k) return opts;
    return opts.map(function (x) { return x.replace(re, ""); });
  }
  function getOptions(o) {
    var v = pick(o, OPT_KEYS), res = { list: [], fromKeys: false, flag: -1 };
    if (Array.isArray(v)) {
      res.list = v.map(text);
      v.forEach(function (x, i) { if (x && typeof x === "object" && res.flag < 0) for (var k = 0; k < FLAG_KEYS.length; k++) if (x[FLAG_KEYS[k]] !== undefined && typeof x[FLAG_KEYS[k]] !== "string" && truthy(x[FLAG_KEYS[k]])) { res.flag = i; break; } });
      return res;
    }
    if (v && typeof v === "object") { res.list = Object.keys(v).sort().map(function (k) { return text(v[k]); }); return res; }
    var i;
    for (i = 0; i < 6; i++) { var t = pick(o, [LETTERS[i], LETTERS[i].toUpperCase(), "option" + LETTERS[i].toUpperCase(), "option_" + LETTERS[i], "option" + (i + 1), "opt" + (i + 1), "option_" + (i + 1), "choice" + (i + 1), "choice" + LETTERS[i].toUpperCase()]); if (t !== undefined) res.list.push(text(t)); }
    res.fromKeys = true; return res;
  }
  function rawCorrect(o, opt) {
    var i;
    for (i = 0; i < ZERO_KEYS.length; i++) if (has(o[ZERO_KEYS[i]])) return { v: o[ZERO_KEYS[i]], zero: true };
    for (i = 0; i < ANY_KEYS.length; i++) if (has(o[ANY_KEYS[i]])) return { v: o[ANY_KEYS[i]], zero: false };
    if (!opt.fromKeys) { // {q, o, a} wala format (app ka apna): a = 0-based index
      if (has(o.a)) return { v: o.a, zero: "o" in o };
      if (has(o.A)) return { v: o.A, zero: false };
    }
    return null;
  }
  function looksQ(o) { return o && typeof o === "object" && !Array.isArray(o) && has(pick(o, Q_KEYS)) && getOptions(o).list.length >= 2; }
  function isQArray(a) { if (!Array.isArray(a) || !a.length) return false; var n = 0; a.forEach(function (x) { if (looksQ(x)) n++; }); return n >= Math.ceil(a.length / 2); }
  function findQArray(data, depth) {
    if (isQArray(data)) return data;
    if (depth > 4 || !data || typeof data !== "object") return null;
    var kids = Array.isArray(data) ? data : Object.keys(data).map(function (k) { return data[k]; }), res = [];
    kids.forEach(function (c) { if (c && typeof c === "object") { var r = findQArray(c, depth + 1); if (r) res = res.concat(r); } });
    return res.length ? res : null;
  }

  /* ---------- main normaliser: object/array -> {questions:[{q,o,a,e}], warnings, note, total} ---------- */
  function parseQuizJson(raw, base) {
    var data;
    if (typeof raw === "string") {
      var t = raw.replace(/^\uFEFF/, "");
      try { data = JSON.parse(t); }
      catch (e) { try { data = parseLiteral(t); } catch (e2) { throw new Error("Invalid JSON: " + e.message); } }
    } else data = raw;
    var arr = findQArray(data, 0) || (Array.isArray(data) ? data : (data && (data.questions || data.quiz || data.data || data.items || data.mcq)));
    if (!Array.isArray(arr) || !arr.length) throw new Error('No list of questions found. The file must be in the format [ {...}, {...} ] or {"questions":[...]}.');
    if (arr.length > 500) throw new Error("A test can have at most 500 questions (this file has " + arr.length + "). Please split the file into two parts.");
    var mode = base === "0" || base === "1" ? base : null, note = "";
    if (!mode) {
      var has0 = false, any = false;
      arr.forEach(function (o) {
        if (!o || typeof o !== "object") return;
        var rc = rawCorrect(o, getOptions(o)); if (!rc || rc.zero) return;
        var n = typeof rc.v === "number" ? rc.v : (/^\d+$/.test(String(rc.v).trim()) ? +rc.v : null);
        if (n === null) return; any = true; if (n === 0) has0 = true;
      });
      if (any) { mode = has0 ? "0" : "1"; note = has0 ? "Answer numbers 0 se shuru maane gaye." : "Answer numbers were read as starting from 1 (1 = first option)."; }
    }
    var out = [], warn = [];
    arr.forEach(function (o, idx) {
      var n = idx + 1;
      if (!o || typeof o !== "object") { warn.push("Q" + n + ": not an object"); return; }
      var q = String(pick(o, Q_KEYS) || "").trim(), opt = getOptions(o);
      var opts = stripLabels(opt.list.map(function (x) { return x.trim(); }));
      if (!q) { warn.push("Q" + n + ": question text not found"); return; }
      if (opts.length < 2) { warn.push("Q" + n + ": at least 2 options are required"); return; }
      var rc = rawCorrect(o, opt), ai = -1;
      if (rc) {
        var v = rc.v;
        if (typeof v === "number") ai = rc.zero ? v : (mode === "0" ? v : v - 1);
        else {
          var sv = String(v).trim();
          if (/^[A-Fa-f](?:\s*(?:,|&|\/|और|and)\s*[A-Fa-f])+$/.test(sv)) { warn.push("Q" + n + ': two correct answers (' + sv + ') — not supported in a single-answer test, so it was skipped. Keep only one correct answer.'); return; }
          var lm = /^(?:option\s*|ans(?:wer)?\s*[:\-]?\s*)?\(?([A-Fa-fकखगघअबसद])\)?[.):]?$/i.exec(sv), lt = /^\(?([A-Fa-fकखगघअबसद])[.)]\s*\S/.exec(sv);
          if (/^\d+$/.test(sv)) ai = rc.zero ? +sv : (mode === "0" ? +sv : +sv - 1);
          else if (lm) ai = labelIndex(lm[1]);
          else {
            ai = opts.findIndex(function (x) { return x.toLowerCase() === sv.toLowerCase(); });
            if (ai < 0 && lt) ai = labelIndex(lt[1]);
          }
        }
      } else if (opt.flag >= 0) ai = opt.flag;
      if (!(ai >= 0 && ai < opts.length)) { warn.push("Q" + n + ": could not understand the correct answer"); return; }
      var item = { q: q.slice(0, 1500), o: opts.slice(0, 6).map(function (x) { return x.slice(0, 800); }), a: ai };
      var ex = pick(o, EXP_KEYS);
      if (has(ex) && typeof ex !== "number") item.e = String(ex).slice(0, 1500);
      out.push(item);
    });
    if (!out.length) throw new Error("No valid question was found. " + warn.slice(0, 3).join(" | "));
    return { questions: out, warnings: warn, note: note, total: arr.length };
  }

  /* ---------- find literal data inside any text (HTML <script>, PHP, JS) ---------- */
  function candidates(text, out, depth) {
    if (depth > 2) return;
    var m, re = /JSON\s*\.\s*parse\s*\(\s*(?=['"`])/g, tries = 0;
    while ((m = re.exec(text)) && tries++ < 30) { try { var L = new Lit(text); L.i = re.lastIndex; candidates(L.str(), out, depth + 1); } catch (e) { } }
    var start = /\[|\{|\barray\s*\(/gi, work = 0, cap = Math.max(3e6, text.length * 6);
    while ((m = start.exec(text)) && work < cap) {
      var p = m.index, j = p - 1;
      while (j >= 0 && /\s/.test(text[j])) j--;
      var prev = j < 0 ? "" : text[j];
      if (prev !== "" && "=:(,>[{n?".indexOf(prev) < 0) continue;
      var l = new Lit(text); l.i = p;
      try { var v = l.value(0); out.push(v); start.lastIndex = l.i; } catch (e) { }
      work += Math.max(1, l.i - p);
    }
  }

  /* ---------- plain text:  Q1. ... A) ... B) ... Answer: B ---------- */
  var RE_ANS = /^(?:Answer|Ans|Correct(?:\s+(?:Answer|Option))?|Right\s+Answer|सही\s+उत्तर|सही\s+विकल्प|उत्तर)\s*[:\-=.]?\s*(.+)$/i;
  var RE_EXP = /^(?:Explanation|Explain|Solution|Reason|Exp|व्याख्या|हल|स्पष्टीकरण)\s*[:\-=]\s*(.*)$/i;
  var RE_QP = /^(?:Q(?:uestion)?|प्रश्न|सवाल)\s*\.?\s*\d*\s*[.):\-]?\s*(.+)$/i;
  var RE_QN = /^(\d{1,3})\s*[.):\-]\s*(.+)$/;
  var RE_OL = /^\(?([A-Fa-fकखगघअबसद])\s*[.):\]]\s*(.+)$/;
  var RE_ON = /^\(?([1-6])\s*[)\]]\s*(.+)$/;
  var RE_MARK = /(?:\s*(?:✓|✔|☑|✅|\((?:correct|right|sahi)\)|\[(?:correct|right)\]))+\s*$/i;
  function parseQuizText(txt, base) {
    var lines = txt.replace(/\r/g, "").split("\n").map(function (s) { return s.replace(/[\u00a0\t]+/g, " ").trim(); });
    var items = [], cur = null, mode = "";
    function fin() { if (cur && cur.options.length >= 2) items.push(cur); cur = null; }
    function start(q) { fin(); cur = { question: q, options: [], flag: -1 }; mode = "q"; }
    lines.forEach(function (ln) {
      if (!ln) return;
      var m;
      if ((m = RE_EXP.exec(ln)) && cur) { cur.explanation = m[1]; mode = "e"; return; }
      if ((m = RE_ANS.exec(ln)) && cur && cur.options.length) { cur.answer = m[1].trim(); mode = "a"; return; }
      if (cur && cur.question && (mode === "q" || mode === "o")) {
        var om = RE_OL.exec(ln), idx = om ? labelIndex(om[1]) : -1, txtv = om ? om[2] : "";
        if (!om || idx !== cur.options.length) {
          om = RE_ON.exec(ln);
          if (om && (+om[1] - 1 === cur.options.length) && (cur.options.length > 0 || /^\(/.test(ln))) { idx = +om[1] - 1; txtv = om[2]; } else om = null;
        }
        if (om && idx === cur.options.length && cur.options.length < 6) {
          var mk = RE_MARK.test(txtv) || /^\*\s*/.test(txtv); txtv = txtv.replace(RE_MARK, "").replace(/^\*\s*/, "");
          if (mk && cur.flag < 0) cur.flag = idx;
          cur.options.push(txtv.trim()); mode = "o"; return;
        }
      }
      var qm = RE_QP.exec(ln), nm = RE_QN.exec(ln);
      var canStart = !cur || cur.options.length >= 2 || mode === "a" || mode === "e";
      if (canStart && (qm || nm)) { start(String((qm && qm[1]) || nm[2]).trim()); return; }
      if (cur && cur.options.length >= 2 && /[?？]$/.test(ln)) { start(ln); return; }
      if (!cur || mode === "a" || mode === "e" && cur.options.length >= 2 && !cur.explanation) { if (!cur || mode === "a") { start(ln); return; } }
      if (mode === "q") cur.question += " " + ln;
      else if (mode === "o" && cur.options.length) cur.options[cur.options.length - 1] += " " + ln;
      else if (mode === "e") cur.explanation = (cur.explanation || "") + " " + ln;
    });
    fin();
    if (!items.length) throw new Error("No questions found in the text.");
    return parseQuizJson(items.map(function (it) {
      var o = { question: it.question, options: it.options };
      if (it.answer !== undefined) o.answer = it.answer; else if (it.flag >= 0) o.correct_index = it.flag;
      if (it.explanation) o.explanation = it.explanation;
      return o;
    }), base);
  }
  function htmlToText(h) {
    return h.replace(/<(script|style|noscript|template)[\s\S]*?<\/\1>/gi, " ").replace(/<!--[\s\S]*?-->/g, " ").replace(/<\?[\s\S]*?\?>/g, " ")
      .replace(/<br\s*\/?>|<\/(p|div|li|tr|td|h[1-6]|ul|ol|label|option|section|article|fieldset|form|table|span)>/gi, "\n").replace(/<[^>]+>/g, " ")
      .replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#0?39;/g, "'");
  }

  /* ---------- HTML page par likhe questions (DOM) ---------- */
  var OPT_CLS = /(^|[\s_-])(opt|option|options|choice|choices|ans|answer-?option)($|[\s_-])/i;
  var CORRECT_CLS = /(^|[\s_-])(correct|right|is-?correct|correct-?answer|right-?answer|answer-?key)($|[\s_-])/i;
  var EXP_CLS = /explan|solution|reason|hint|व्याख्या/i;
  var ANS_CLS = /(^|[\s_-])(answer|ans|result|correct-?answer)($|[\s_-])/i;
  function cls(el) { var c = el.getAttribute && el.getAttribute("class"); return c || ""; }
  function isOptEl(el) {
    var t = el.tagName;
    if (t === "LI" || t === "LABEL" || t === "OPTION") return true;
    if (OPT_CLS.test(cls(el))) return true;
    return !!(el.querySelector && el.querySelector("input[type=radio],input[type=checkbox]") && el.children.length < 6);
  }
  function attrCorrect(el) {
    var a = ["data-correct", "data-right", "data-is-correct", "data-iscorrect", "data-answer-key"];
    for (var i = 0; i < a.length; i++) if (el.hasAttribute && el.hasAttribute(a[i]) && truthy(el.getAttribute(a[i]) || "true")) return true;
    return false;
  }
  function elCorrect(el) {
    if (CORRECT_CLS.test(cls(el)) || attrCorrect(el)) return true;
    return !!(el.querySelector && el.querySelector(".correct,.right,.is-correct,.correct-answer,[data-correct],[data-right]") && Array.prototype.some.call(el.querySelectorAll(".correct,.right,.is-correct,.correct-answer,[data-correct],[data-right]"), function (x) { return CORRECT_CLS.test(cls(x)) || attrCorrect(x); }));
  }
  function clean(s) { return String(s || "").replace(/\s+/g, " ").trim(); }
  var BLOCK = /^(P|DIV|LI|BR|H[1-6]|TR|TD|TH|UL|OL|SECTION|ARTICLE|LABEL|FIELDSET|TABLE|FORM|PRE|BLOCKQUOTE|OPTION|DT|DD)$/;
  function txtOf(n) { // block elements ke beech space, inline (<sub>, <b>) ke beech nahi
    if (n.nodeType === 3) return n.nodeValue;
    if (n.nodeType !== 1) return "";
    var s = ""; for (var i = 0; i < n.childNodes.length; i++) s += txtOf(n.childNodes[i]);
    return BLOCK.test(n.tagName) ? " " + s + " " : s;
  }
  function parseHtmlDom(html, base) {
    if (typeof root.DOMParser === "undefined") throw new Error("DOM not available");
    var doc = new root.DOMParser().parseFromString(html, "text/html");
    Array.prototype.forEach.call(doc.querySelectorAll("script,style,noscript,template,nav,header,footer"), function (n) { n.remove(); });
    var body = doc.body || doc.documentElement, groups = [];
    Array.prototype.forEach.call(body.querySelectorAll("*"), function (P) {
      var kids = Array.prototype.slice.call(P.children), ok = kids.filter(isOptEl);
      if (ok.length < 2 || ok.length > 6 || ok.length < kids.length - 2) return;
      if (ok.some(function (k) { return clean(k.textContent).length > 400; })) return;
      if (ok.every(function (k) { return !clean(k.textContent); })) return;
      groups.push(P);
    });
    groups = groups.filter(function (g) { return !groups.some(function (h) { return h !== g && g.contains(h); }); });
    if (!groups.length) throw new Error("Could not find the options structure in the HTML.");
    var items = [];
    groups.forEach(function (P) {
      var c = P;
      while (c.parentElement && c.parentElement !== body) { var par = c.parentElement, n = groups.filter(function (g) { return par.contains(g); }).length; if (n > 1) break; c = par; }
      var optEls = Array.prototype.slice.call(P.children).filter(isOptEl);
      var options = optEls.map(function (e) { var cl = e.cloneNode(true); Array.prototype.forEach.call(cl.querySelectorAll("input,select,button,svg"), function (x) { x.remove(); }); return clean(txtOf(cl)).replace(RE_MARK, ""); });
      var flag = -1;
      optEls.forEach(function (e, i) { if (flag < 0 && elCorrect(e)) flag = i; });
      if (flag < 0) optEls.forEach(function (e, i) { if (flag < 0 && e.querySelector && e.querySelector("input[checked]")) flag = i; });
      if (flag < 0) optEls.forEach(function (e, i) { if (flag < 0 && RE_MARK.test(e.textContent)) flag = i; });
      // container ka clone: options + explanation/answer elements hata kar baaki text = question
      var cc = c.cloneNode(true), expText = "", ansText = "";
      var targets = optEls.map(function (e) {
        var path = [], n2 = e; while (n2 && n2 !== c) { path.unshift(Array.prototype.indexOf.call(n2.parentNode.childNodes, n2)); n2 = n2.parentNode; }
        var t = cc; path.forEach(function (ix) { t = t && t.childNodes[ix]; }); return t;
      });
      Array.prototype.forEach.call(cc.querySelectorAll("*"), function (x) {
        if (targets.indexOf(x) >= 0) return;
        var k = cls(x);
        if (EXP_CLS.test(k)) { expText = expText || clean(x.textContent); x.setAttribute("data-rm", "1"); }
        else if (ANS_CLS.test(k) && !OPT_CLS.test(k) && !CORRECT_CLS.test(k)) { ansText = ansText || clean(x.textContent); x.setAttribute("data-rm", "1"); }
      });
      targets.forEach(function (t) { if (t && t.parentNode) t.parentNode.removeChild(t); });
      Array.prototype.forEach.call(cc.querySelectorAll("[data-rm]"), function (x) { if (x.parentNode) x.parentNode.removeChild(x); });
      var qt = clean(txtOf(cc)), full = clean(txtOf(c));
      var cut = /\s+(?=(?:Answer|Ans|Correct Answer|Explanation|Solution|सही उत्तर|उत्तर|व्याख्या)\s*[:\-=])/i;
      var parts = qt.split(cut), ea = parts.length > 1 ? (RE_ANS.exec(parts.slice(1).join(" ")) || [])[1] : "";
      qt = parts[0].replace(/^(?:Q(?:uestion)?\.?\s*)?\d{1,3}\s*[.):\-]\s*/i, "");
      var em = /(?:Explanation|Solution|व्याख्या)\s*[:\-=]\s*(.+)$/i.exec(full);
      var o = { question: qt, options: options };
      var attr = null;
      ["data-answer", "data-correct", "data-ans", "data-correct-answer", "data-correct-index"].forEach(function (a) { if (!attr && c.hasAttribute && c.hasAttribute(a) && c.getAttribute(a)) attr = c.getAttribute(a); });
      if (flag >= 0) o.correct_index = flag;
      else if (attr) o.answer = attr;
      else if (ansText) { var am = RE_ANS.exec(ansText); o.answer = am ? am[1] : ansText.replace(/^.*?[:\-=]\s*/, ""); }
      else if (ea) o.answer = ea;
      var ex = expText || (em && em[1]); if (ex) o.explanation = ex.replace(RE_EXP, "$1");
      items.push(o);
    });
    return parseQuizJson(items, base);
  }

  /* ---------- CSV ---------- */
  function parseCsv(txt) {
    var rows = [], row = [], cell = "", q = false, i, c, d = /\t/.test(txt.split("\n")[0]) && !/,/.test(txt.split("\n")[0]) ? "\t" : ",";
    for (i = 0; i < txt.length; i++) {
      c = txt[i];
      if (q) { if (c === '"') { if (txt[i + 1] === '"') { cell += '"'; i++; } else q = false; } else cell += c; }
      else if (c === '"') q = true;
      else if (c === d) { row.push(cell); cell = ""; }
      else if (c === "\n") { row.push(cell); rows.push(row); row = []; cell = ""; }
      else if (c !== "\r") cell += c;
    }
    row.push(cell); rows.push(row);
    return rows.filter(function (r) { return r.some(function (x) { return x.trim(); }); });
  }
  function csvToItems(txt) {
    var rows = parseCsv(txt); if (rows.length < 2) throw new Error("The CSV has no data.");
    var head = rows[0].map(function (h) {
      var k = h.trim().toLowerCase().replace(/[\s_\-]+/g, ""), m = /^(?:opt(?:ion)?|choice)([a-f1-6])$/.exec(k);
      if (m) return "option" + (/\d/.test(m[1]) ? m[1] : m[1].toUpperCase());
      if (/^(question|q|prashn|प्रश्न|ques)$/.test(k)) return "question";
      if (/^(answer|ans|correct|correctanswer|उत्तर|sahiuttar)$/.test(k)) return "answer";
      if (/^(explanation|solution|reason|exp|व्याख्या)$/.test(k)) return "explanation";
      return k;
    });
    return rows.slice(1).map(function (r) { var o = {}; head.forEach(function (h, i) { if (r[i] !== undefined && r[i] !== "") o[h] = r[i]; }); return o; });
  }

  /* ---------- entry point: koi bhi file ---------- */
  function parseQuizFile(raw, name, base) {
    var txt = String(raw == null ? "" : raw).replace(/^\uFEFF/, "");
    if (!txt.trim()) throw new Error("The file is empty.");
    var ext = ((/\.([a-z0-9]+)$/i.exec(name || "") || [])[1] || "").toLowerCase();
    var found = [], errs = [];
    function attempt(label, fn) { try { var r = fn(); if (r && r.questions && r.questions.length) { r.source = label; found.push(r); } } catch (e) { errs.push(label + ": " + e.message); } }
    var looksHtml = /<\s*(html|body|div|script|ul|ol|form|p|table|h[1-6]|li)\b/i.test(txt);
    if (ext === "csv" || ext === "tsv") attempt("CSV", function () { return parseQuizJson(csvToItems(txt), base); });
    if (!found.length && /^\s*[\[{]/.test(txt)) attempt("JSON", function () { return parseQuizJson(txt, base); });
    if (!found.length) {
      var cands = []; candidates(txt, cands, 0);
      if (typeof root.DOMParser !== "undefined" && looksHtml) {
        try { var d0 = new root.DOMParser().parseFromString(txt, "text/html"); Array.prototype.forEach.call(d0.querySelectorAll("*"), function (el) { Array.prototype.forEach.call(el.attributes || [], function (a) { if (/^\s*[\[{]/.test(a.value) && a.value.length > 20) candidates(a.value, cands, 1); }); }); } catch (e) { }
      }
      cands.forEach(function (v) { attempt(ext === "php" ? "PHP data" : looksHtml ? "HTML (script data)" : "JS data", function () { return parseQuizJson(v, base); }); });
      if (found.length > 1) { found.sort(function (a, b) { return b.questions.length - a.questions.length || a.warnings.length - b.warnings.length; }); found = [found[0]]; }
    }
    if (!found.length && looksHtml) attempt("HTML page", function () { return parseHtmlDom(txt, base); });
    if (!found.length) attempt("Text", function () { return parseQuizText(looksHtml ? htmlToText(txt) : txt, base); });
    if (!found.length) {
      var lim = errs.filter(function (e) { return /max 500/.test(e); })[0];
      if (lim) throw new Error(lim.replace(/^[^:]+: /, ""));
      var hint = errs.filter(function (e) { return !/^Text:|DOM|structure/.test(e); })[0] || errs[0] || "";
      throw new Error("No questions found in this file. Expected format: [{question, options, answer}] (JSON/HTML/PHP) or Q1. ... A) ... Answer: B (text). " + hint);
    }
    found.sort(function (a, b) { return b.questions.length - a.questions.length; });
    return found[0];
  }

  /* ---------- quizRich: question/option text ko safe HTML mein badalta hai ----------
     Sirf <img src="https://...">, <br>, <sub>, <sup>, <b>, <i>, <u> allowed. Baaki sab text ban jata hai / hata diya jata hai. */
  function escH(s) { return String(s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function decEnt(s) { return s.replace(/&nbsp;/g, " ").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#0?39;/g, "'").replace(/&amp;/g, "&"); }
  function quizRich(src) {
    var s = String(src == null ? "" : src), out = "", last = 0, m, stack = [];
    var re = /<\s*(\/?)\s*([a-zA-Z][a-zA-Z0-9]*)\b([^>]*)>/g;
    while ((m = re.exec(s))) {
      out += escH(decEnt(s.slice(last, m.index))); last = re.lastIndex;
      var close = m[1] === "/", tag = m[2].toLowerCase(), attrs = m[3] || "";
      if (tag === "img") {
        if (close) continue;
        var sm = /\bsrc\s*=\s*(?:"([^"]*)"|'([^']*)')/i.exec(attrs), url = sm ? decEnt((sm[1] || sm[2] || "").trim()) : "";
        if (!/^https:\/\//i.test(url)) continue;
        var am = /\balt\s*=\s*(?:"([^"]*)"|'([^']*)')/i.exec(attrs), alt = am ? decEnt(am[1] || am[2] || "") : "";
        out += '<img class="rimg" loading="lazy" referrerpolicy="no-referrer" src="' + escH(url) + '" alt="' + escH(alt) + '">';
      } else if (tag === "br") { if (!close) out += "<br>"; }
      else if (/^(sub|sup|b|i|u)$/.test(tag)) {
        if (!close) { stack.push(tag); out += "<" + tag + ">"; }
        else { var k = stack.lastIndexOf(tag); if (k >= 0) { while (stack.length > k) out += "</" + stack.pop() + ">"; } }
      } else if (/^(strong)$/.test(tag)) { if (!close) { stack.push("b"); out += "<b>"; } else { var k2 = stack.lastIndexOf("b"); if (k2 >= 0) { while (stack.length > k2) out += "</" + stack.pop() + ">"; } } }
      else if (/^(em)$/.test(tag)) { if (!close) { stack.push("i"); out += "<i>"; } else { var k3 = stack.lastIndexOf("i"); if (k3 >= 0) { while (stack.length > k3) out += "</" + stack.pop() + ">"; } } }
      else if (/^(p|div|li|tr)$/.test(tag) && close) out += " ";
      /* baaki tags (script, style, span, a ...) hata diye jate hain */
    }
    out += escH(decEnt(s.slice(last)));
    while (stack.length) out += "</" + stack.pop() + ">";
    return out;
  }

  root.quizRich = quizRich;
  root.parseQuizJson = parseQuizJson;
  root.parseQuizFile = parseQuizFile;
  if (typeof module !== "undefined") module.exports = { parseQuizJson: parseQuizJson, parseQuizFile: parseQuizFile, parseLiteral: parseLiteral };
})(typeof window !== "undefined" ? window : globalThis);
