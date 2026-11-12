import { useState } from 'react';
import { Logo } from './Login.jsx';
export default function Instructions({ user, exam, submitted, onStart, onViewResult, onReset, onLogout }) {
  const [ok, setOk] = useState(false); const fmt = (d) => new Date(d).toLocaleString();
  const rules = ['The examination contains multiple sections.', 'Each question has four answer options.', 'Select the single correct answer unless the question says otherwise.',
    'Attempt every question if the examination rules require it.', 'Use Previous and Next, or the question palette, to move around.', 'Your answers are saved automatically.',
    'The examination submits by itself when the timer reaches zero.', 'You cannot change answers after final submission.'];
  return (<main className="center top"><section className="card wide"><header className="between row"><Logo /><button className="link" onClick={onLogout}>Log out</button></header>
    <h1>{exam.name}</h1>
    <dl className="facts">{[['Student', user.name], ['Student ID', user.id], ['Standard', exam.standard], ['Subject', exam.subject], ['Questions', exam.questions.length], ['Total marks', exam.totalMarks],
      ['Duration', exam.durationMin + ' minutes'], ['Negative marking', exam.negativeMarking ? `−${exam.negativeMarking} per wrong answer` : 'None'], ['Starts', fmt(exam.startTime)], ['Ends', fmt(exam.endTime)]]
      .map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}</dl>
    <h2>Sections</h2><ul className="secs">{exam.sections.map((s) => <li key={s.id}><b>{s.name}</b> – {exam.questions.filter((q) => q.sectionId === s.id).length} questions, {s.marks} marks</li>)}</ul>
    <h2>Instructions</h2><ol>{rules.map((r) => <li key={r}>{r}</li>)}</ol>
    <label className="row"><input type="checkbox" checked={ok} onChange={(e) => setOk(e.target.checked)} />I have read and understood all examination instructions.</label>
    {submitted ? <div className="row"><p className="ok">You have already submitted this exam.</p><button className="btn" onClick={onViewResult}>View result</button><button className="link" onClick={onReset}>Reset attempt (demo only)</button></div> : <button className="btn" disabled={!ok} onClick={onStart}>Start exam</button>}</section></main>);
}
