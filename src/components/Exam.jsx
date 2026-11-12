import { useEffect, useMemo, useRef, useState } from 'react';
import { api, serverNow } from '../lib/api.js';
import { Blocks } from './Blocks.jsx';
import { Logo } from './Login.jsx';
const pad = (n) => String(n).padStart(2, '0');
const hms = (ms) => { const s = Math.max(0, Math.floor(ms / 1000)); return `${pad(Math.floor(s / 3600))}:${pad(Math.floor(s / 60) % 60)}:${pad(s % 60)}`; };

export default function Exam({ user, exam, onDone }) {
  const sid = user.id + '_' + exam.id;
  const [s, setS] = useState(() => api.startSession(sid));        // survives refresh: startedAt is persisted, not reset
  const [i, setI] = useState(0), [confirm, setConfirm] = useState(false), [warn, setWarn] = useState(''), [now, setNow] = useState(serverNow()), [rough, setRough] = useState(false), [note, setNote] = useState('');
  const qs = exam.questions, q = qs[i], sec = exam.sections.find((x) => x.id === q.sectionId), g = q.groupId && exam.groups[q.groupId];
  const left = s.startedAt + exam.durationMin * 60000 - now, warned = useRef({});
  const upd = (patch) => setS((p) => { const n = { ...p, ...patch }; api.saveSession(sid, n); return n; });    // auto-save on every change
  const submit = () => onDone(api.submit(sid, s, exam));

  useEffect(() => { const t = setInterval(() => setNow(serverNow()), 1000); return () => clearInterval(t); }, []);
  useEffect(() => { if (!s.visited[q.id]) upd({ visited: { ...s.visited, [q.id]: 1 } }); }, [i]);
  useEffect(() => { if (left <= 0) submit(); else for (const [m, k] of [[300000, '5 minutes'], [60000, '1 minute']]) if (left <= m && !warned.current[m]) { warned.current[m] = 1; setWarn(k + ' remaining'); } }, [left]);
  const pick = (id) => upd({ answers: { ...s.answers, [q.id]: id } });
  const clear = () => { const a = { ...s.answers }; delete a[q.id]; upd({ answers: a }); };
  const go = (n) => { if (!exam.allowSectionSwitch && qs[n].sectionId !== q.sectionId) return setNote('Section switching is disabled for this exam.'); setNote(''); setI(n); };
  const stat = (x, n) => (n === i ? 'cur' : s.answers[x.id] ? 'ans' : s.visited[x.id] ? 'vis' : 'new');
  const counts = useMemo(() => ({ ans: qs.filter((x) => s.answers[x.id]).length, vis: qs.filter((x) => s.visited[x.id] && !s.answers[x.id]).length, nv: qs.filter((x) => !s.visited[x.id]).length }), [s]);
  const low = left < 300000;

  return (<div className="exam">
    <header className="bar"><Logo /><div className="ename">{exam.name}</div><div className="who">{user.name}</div>
      <div className={'timer' + (low ? ' low' : '')} aria-live="off">{hms(left)}</div><div className="status">In progress</div></header>
    {warn && <div className="banner" role="alert">{warn}. <button className="link" onClick={() => setWarn('')}>Dismiss</button></div>}
    <nav className="tabs">{exam.sections.map((x) => { const L = qs.filter((y) => y.sectionId === x.id); return (
      <button key={x.id} className={x.id === q.sectionId ? 'on' : ''} onClick={() => go(qs.indexOf(L[0]))}>{x.short} <small>{L.filter((y) => s.answers[y.id]).length}/{L.length}</small></button>); })}</nav>
    <div className="body"><main className="main">
      {g && <section className="shared"><h3>{g.title}</h3><Blocks blocks={g.blocks} /></section>}
      <section className="q"><h2>Question {i + 1}</h2><Blocks blocks={q.stem} />
        <div className={'opts' + (q.options.some((o) => o.blocks.some((b) => b.type === 'image')) ? ' grid' : '')} role="radiogroup">
          {q.options.map((o) => <label key={o.id} className={'opt' + (s.answers[q.id] === o.id ? ' sel' : '')}>
            <input type="radio" name={'q' + q.id} checked={s.answers[q.id] === o.id} onChange={() => pick(o.id)} /><b>({o.id})</b><div><Blocks blocks={o.blocks} /></div></label>)}</div>
        {s.answers[q.id] && <button className="link" onClick={clear}>Clear answer</button>}
        {note && <p className="err">{note}</p>}</section>
      <div className="nav"><button className="btn ghost" disabled={i === 0} onClick={() => go(i - 1)}>Previous</button>
        <button className="link" onClick={() => setRough(!rough)}>{rough ? 'Hide' : 'Show'} rough work</button>
        {i === qs.length - 1 ? <button className="btn" onClick={() => setConfirm(true)}>Submit test</button> : <button className="btn" onClick={() => go(i + 1)}>Next</button>}</div>
      {rough && <textarea className="rough" placeholder="Rough work (not saved, not graded)" />}
    </main>
    <aside className="pal"><h3>{sec.name}</h3><div className="grid">{qs.map((x, n) => <button key={x.id} className={'pn ' + stat(x, n)} onClick={() => go(n)} aria-label={`Question ${n + 1}`}>{n + 1}</button>)}</div>
      <ul className="legend"><li><i className="ans" />Answered</li><li><i className="new" />Not visited</li><li><i className="vis" />Not answered</li><li><i className="cur" />Current</li></ul>
      <button className="btn full" onClick={() => setConfirm(true)}>Submit test</button></aside></div>
    {confirm && <div className="modal"><div className="card"><h2>Are you sure you want to submit?</h2>
      <dl className="facts">{[['Total questions', qs.length], ['Answered', counts.ans], ['Unanswered', qs.length - counts.ans], ['Not visited', counts.nv]].map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}</dl>
      <div className="row between"><button className="btn ghost" onClick={() => setConfirm(false)}>Continue examination</button><button className="btn" onClick={submit}>Yes, submit test</button></div></div></div>}
  </div>);
}
