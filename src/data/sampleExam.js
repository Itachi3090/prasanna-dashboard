const svg = (body) => 'data:image/svg+xml;utf8,' + encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100" fill="none" stroke="#0B2A5B" stroke-width="4">${body}</svg>`);
const shapes = { sq: svg('<rect x="15" y="15" width="70" height="70"/>'), ci: svg('<circle cx="50" cy="50" r="38"/>'),
  tr: svg('<polygon points="50,12 88,86 12,86"/>'), st: svg('<polygon points="50,10 61,38 92,38 67,57 77,88 50,70 23,88 33,57 8,38 39,38"/>') };
const img = (src, alt) => ({ type: 'image', src, alt });
const t = (text) => ({ type: 'text', text });
const m = (tex) => ({ type: 'math', tex });
const opts = (arr) => arr.map((b, i) => ({ id: 'ABCD'[i], blocks: Array.isArray(b) ? b : [t(b)] }));

// Exam config: everything is data. Sections, shared groups (passage/table/diagram) and questions are fully dynamic.
// Shared content lives ONCE in `groups`; questions reference it via groupId.
export const exam = {
  id: 'EX-SETD-AHADMPUR', name: 'SET D – Ahadmpur', standard: 5, subject: 'Marathi Medium – Scholarship',
  durationMin: 120, totalMarks: 100, negativeMarking: 0, allowSectionSwitch: true, showReview: true, passPercent: 35,
  startTime: '2026-11-12T09:00', endTime: '2026-11-12T23:59',
  sections: [
    { id: 'S1', name: 'Mental Ability Test', short: 'Mental Ability', marks: 25 },
    { id: 'S2', name: 'Environmental Studies', short: 'Environmental Studies', marks: 25 },
    { id: 'S3', name: 'Mathematics', short: 'Mathematics', marks: 25 },
    { id: 'S4', name: 'Marathi Language Test', short: 'Marathi Language', marks: 25 } ],
  groups: {
    P1: { title: 'Passage 1', blocks: [t('एका गावात एक शेतकरी राहत होता. तो रोज पहाटे उठून शेतात जात असे. त्याच्याकडे दोन बैल आणि एक गाय होती.')] },
    T1: { title: 'Table 1', blocks: [{ type: 'table', head: ['Day', 'Mathematics', 'EVS', 'Language'],
      rows: [['Monday', 35, 25, 20], ['Tuesday', 40, 30, 25], ['Wednesday', 30, 45, 35], ['Thursday', 50, 35, 30], ['Friday', 45, 40, 40]] }] } },
  questions: [
    { id: 1, sectionId: 'S1', marks: 1.25, stem: [t('Find the missing figure.'), img(shapes.sq, 'Question figure')],
      options: opts([[img(shapes.ci, 'A')], [img(shapes.tr, 'B')], [img(shapes.st, 'C')], [img(shapes.sq, 'D')]]), correct: 'D' },
    { id: 2, sectionId: 'S2', marks: 1.25, stem: [t('सूर्य कोणत्या दिशेला उगवतो?')], options: opts(['पूर्व', 'पश्चिम', 'उत्तर', 'दक्षिण']), correct: 'A' },
    { id: 3, sectionId: 'S3', marks: 1.25, stem: [t('Add the fractions:'), m('\\frac{2}{7}+\\frac{3}{7}')],
      options: opts([[m('\\frac{5}{14}')], [m('\\frac{5}{7}')], [m('\\frac{6}{49}')], [m('\\frac{1}{7}')]]), correct: 'B' },
    { id: 4, sectionId: 'S3', marks: 1.25, stem: [t('Each angle of a square is:')], options: opts([[m('45^\\circ')], [m('60^\\circ')], [m('90^\\circ')], [m('180^\\circ')]]), correct: 'C' },
    { id: 5, sectionId: 'S3', marks: 1.25, groupId: 'T1', stem: [t('On which day was EVS time the highest?')], options: opts(['Monday', 'Wednesday', 'Thursday', 'Friday']), correct: 'B' },
    { id: 6, sectionId: 'S3', marks: 1.25, groupId: 'T1', stem: [t('Total minutes spent on Mathematics on Monday and Tuesday?')], options: opts(['65', '75', '70', '80']), correct: 'B' },
    { id: 7, sectionId: 'S4', marks: 1.25, groupId: 'P1', stem: [t('शेतकरी रोज केव्हा उठत असे?')], options: opts(['पहाटे', 'दुपारी', 'सायंकाळी', 'रात्री']), correct: 'A' },
    { id: 8, sectionId: 'S4', marks: 1.25, groupId: 'P1', stem: [t('शेतकऱ्याकडे किती बैल होते?')], options: opts(['एक', 'दोन', 'तीन', 'चार']), correct: 'B' } ] };

export const students = [{ id: 'STU001', mobile: '9999999999', password: 'demo123', name: 'Aarav Patil', exams: ['EX-SETD-AHADMPUR'] }];
