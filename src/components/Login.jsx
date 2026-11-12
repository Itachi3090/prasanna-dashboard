import { useState } from 'react';
import { api } from '../lib/api.js';
import { exam, students } from '../data/sampleExam.js';
import LOGO from '../assets/logo.jpeg';

export const Logo = () => <div className="logo"><img src={LOGO} alt="Prassanna Publication logo" /><span>Prassanna Publication</span></div>;

export default function Login({ onLogin }) {
  const [id, setId] = useState(''), [pw, setPw] = useState(''), [show, setShow] = useState(false), [rem, setRem] = useState(true),
    [err, setErr] = useState(''), [note, setNote] = useState(''), [reg, setReg] = useState(false), [rn, setRn] = useState(''), [rm, setRm] = useState(''), [rp, setRp] = useState('');
  const go = async (e) => { e.preventDefault(); setErr(''); try { const u = await api.login(id, pw); if (rem) api.setUser(u); onLogin(u); } catch (x) { setErr(x.message); } };
  const doReg = (e) => { e.preventDefault();
    if (!rn.trim()) return setErr('Enter your full name.');
    if (!/^\d{10}$/.test(rm)) return setErr('Enter a 10-digit mobile number.');
    if (rp.length < 6) return setErr('Password must be at least 6 characters.');
    if (students.some((x) => x.mobile === rm)) return setErr('This mobile number is already registered.');
    const sid = 'STU' + String(100 + students.length);
    students.push({ id: sid, mobile: rm, password: rp, name: rn.trim(), exams: [exam.id] }); // demo only: call your registration API here
    setReg(false); setId(sid); setPw(''); setErr(''); setNote('Registered. Your Student ID is ' + sid + '. Log in with it or your mobile number.'); };
  const Brand = (<div className="brand"><img className="biglogo" src={LOGO} alt="Prassanna Publication logo" /><p>Online Examination Platform</p></div>);

  if (reg) return (<main className="split">{Brand}<div className="formside"><form className="login" onSubmit={doReg}><h1>Register</h1>
    <label>Full name<input value={rn} onChange={(e) => setRn(e.target.value)} required /></label>
    <label>Mobile number<input value={rm} onChange={(e) => setRm(e.target.value.replace(/\D/g, '').slice(0, 10))} inputMode="numeric" required /></label>
    <label>Create password<input type="password" value={rp} onChange={(e) => setRp(e.target.value)} required /></label>
    {err && <p className="err" role="alert">{err}</p>}<button className="btn">Register now</button>
    <button type="button" className="link" onClick={() => { setReg(false); setErr(''); }}>Back to login</button></form></div></main>);

  return (<main className="split">{Brand}<div className="formside"><form className="login" onSubmit={go}>
    <h1>Student login</h1>
    <label>Student ID or registered mobile number<input value={id} onChange={(e) => setId(e.target.value)} autoComplete="username" autoCapitalize="off" autoCorrect="off" required /></label>
    <label>Password<span className="pw"><input type={show ? 'text' : 'password'} value={pw} onChange={(e) => setPw(e.target.value)} autoComplete="current-password" required />
      <button type="button" className="link" onClick={() => setShow(!show)}>{show ? 'Hide' : 'Show'}</button></span></label>
    <label className="row"><input type="checkbox" checked={rem} onChange={(e) => setRem(e.target.checked)} />Remember me</label>
    {err && <p className="err" role="alert">{err}</p>}{note && <p className="ok">{note}</p>}
    <button className="btn">Log in</button>
    <div className="row between"><button type="button" className="link" onClick={() => setNote('Password reset link will be sent to your registered mobile (connect SMS/OTP service).')}>Forgot password?</button>
      <button type="button" className="link" onClick={() => setNote('A new OTP will be sent to your registered mobile (connect SMS/OTP service).')}>Resend OTP</button></div>
    <button type="button" className="btn ghost" onClick={() => { setId('STU001'); setPw('demo123'); setErr(''); }}>Fill demo login (STU001 / demo123)</button>
    <div className="or">New student?</div>
    <button type="button" className="btn ghost" onClick={() => { setReg(true); setErr(''); setNote(''); }}>Register now</button></form></div></main>);
}
