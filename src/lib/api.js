// Mock backend persisted in localStorage. Replace each function with fetch() calls to the shared server/DB.
import { exam, students } from '../data/sampleExam.js';
const K = (k) => 'pp_' + k;
const load = (k, d) => { try { return JSON.parse(localStorage.getItem(K(k))) ?? d; } catch { return d; } };
const save = (k, v) => { try { localStorage.setItem(K(k), JSON.stringify(v)); } catch {} };
export const serverNow = () => Date.now(); // TODO: apply server clock offset from /api/time
export const api = {
  login: async (id, pw) => { id = String(id).trim().toLowerCase(); pw = String(pw).trim();
    const s = students.find((x) => (x.id.toLowerCase() === id || x.mobile === id) && x.password === pw);
    if (!s) throw new Error('Student ID or password is incorrect.'); const { password, ...safe } = s; return safe; },
  getExam: async () => exam,
  getSession: (sid) => load('session_' + sid, null),
  startSession: (sid) => { const s = load('session_' + sid, null) || { startedAt: serverNow(), answers: {}, visited: {}, status: 'active' }; save('session_' + sid, s); return s; },
  saveSession: (sid, s) => save('session_' + sid, s), // auto-save; queue + retry when offline in production
  submit: (sid, s, ex) => { if (s.status === 'submitted') return s.result; const result = grade(ex, s.answers);
    save('session_' + sid, { ...s, status: 'submitted', result }); return result; },
  resetSession: (sid) => { try { localStorage.removeItem(K('session_' + sid)); } catch {} },
  user: () => load('user', null), setUser: (u) => (u ? save('user', u) : (() => { try { localStorage.removeItem(K('user')); } catch {} })()) };

export function grade(ex, answers) { // production: run on the server only
  const sec = Object.fromEntries(ex.sections.map((s) => [s.id, { ...s, got: 0 }])); let c = 0, w = 0, u = 0, got = 0;
  ex.questions.forEach((q) => { const a = answers[q.id];
    if (!a) u++; else if (a === q.correct) { c++; got += q.marks; sec[q.sectionId].got += q.marks; }
    else { w++; got -= ex.negativeMarking; sec[q.sectionId].got -= ex.negativeMarking; } });
  const max = ex.questions.reduce((s, q) => s + q.marks, 0);
  return { correct: c, wrong: w, unanswered: u, attempted: c + w, got, max, pct: (got / max) * 100, pass: (got / max) * 100 >= ex.passPercent, sections: Object.values(sec) }; }
