import { Blocks } from './Blocks.jsx';
export default function Result({ user, exam, result, session, onLogout }) {
  const f = (n) => Math.round(n * 100) / 100;
  return (<main className="center top"><section className="card wide">
    <h1>Result – {exam.name}</h1><p className={'verdict ' + (result.pass ? 'pass' : 'fail')}>{result.pass ? 'Pass' : 'Fail'} · {f(result.pct)}%</p>
    <dl className="facts">{[['Student', user.name], ['Total questions', exam.questions.length], ['Attempted', result.attempted], ['Correct', result.correct], ['Incorrect', result.wrong],
      ['Unanswered', result.unanswered], ['Maximum marks', f(result.max)], ['Marks obtained', f(result.got)]].map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}</dl>
    <table><thead><tr><th>Section</th><th>Marks obtained</th><th>Maximum marks</th></tr></thead>
      <tbody>{result.sections.map((s) => <tr key={s.id}><td>{s.name}</td><td>{f(s.got)}</td><td>{s.marks}</td></tr>)}</tbody></table>
    <div className="row noprint"><button className="btn" onClick={() => window.print()}>Print / save as PDF</button><button className="link" onClick={onLogout}>Log out</button></div>
    {exam.showReview && <><h2>Question review</h2>{exam.questions.map((q, n) => { const a = session.answers[q.id]; return (
      <article key={q.id} className="rev"><h3>Question {n + 1} <span className={a === q.correct ? 'pass' : 'fail'}>{a === q.correct ? 'Correct' : a ? 'Incorrect' : 'Not answered'}</span></h3>
        {q.groupId && <div className="shared"><Blocks blocks={exam.groups[q.groupId].blocks} /></div>}<Blocks blocks={q.stem} />
        <p>Your answer: <b>{a || '–'}</b> · Correct answer: <b>{q.correct}</b></p></article>); })}</>}</section></main>);
}
