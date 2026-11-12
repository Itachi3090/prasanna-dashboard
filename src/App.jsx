import { useEffect, useState } from 'react';
import { api } from './lib/api.js';
import Login from './components/Login.jsx';
import Instructions from './components/Instructions.jsx';
import Exam from './components/Exam.jsx';
import Result from './components/Result.jsx';
export default function App() {
  const [user, setUser] = useState(api.user()), [exam, setExam] = useState(null), [view, setView] = useState('instr'), [result, setResult] = useState(null);
  useEffect(() => { if (user) api.getExam().then((e) => { setExam(e); const s = api.getSession(user.id + '_' + e.id);
    if (s?.status === 'submitted') { setResult(s.result); setView('instr'); } else if (s) setView('exam'); }); }, [user]);   // resume after refresh
  const logout = () => { api.setUser(null); setUser(null); setResult(null); setView('instr'); };
  if (!user) return <Login onLogin={setUser} />;
  if (!exam) return <main className="center"><p>Loading…</p></main>;
  if (view === 'exam') return <Exam user={user} exam={exam} onDone={(r) => { setResult(r); setView('result'); }} />;
  if (view === 'result') return <Result user={user} exam={exam} result={result} session={api.getSession(user.id + '_' + exam.id)} onLogout={logout} />;
  return <Instructions user={user} exam={exam} submitted={!!result} onStart={() => setView('exam')} onViewResult={() => setView('result')} onReset={() => { api.resetSession(user.id + '_' + exam.id); setResult(null); }} onLogout={logout} />;
}
