import React, { useState, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import "./index.css";
import {
  FileText,
  HelpCircle,
  Users,
  BarChart3,
  Plus,
  Bell,
  Menu as MenuIcon,
  MoreVertical,
  Trash2,
  Pencil,
  Eye,
  EyeOff,
  LogOut,
  Upload,
  Download,
  Check,
  PanelLeft,
  ChevronLeft,
  X,
  Printer,
} from "lucide-react";

/* ───────── constants & helpers ───────── */
const KEY = "pp_v1";
const SUBJ = ["Mathematics", "Science", "English", "Social Science", "Marathi"];
const CLS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
const MED = ["Marathi", "English", "Semi-English"];
const TYPES = [
  ["MCQ", "MCQ – Text question"],
  ["Image Question", "Image in Question"],
  ["Image Options", "Image in Options"],
  ["Paragraph MCQ", "Paragraph + 4 Options"],
];
const HD = [
  "class",
  "subject",
  "topic",
  "question",
  "optionA",
  "optionB",
  "optionC",
  "optionD",
  "correct",
  "difficulty",
  "marks",
  "explanation",
  "paragraph",
];
const td = () => new Date().toISOString().slice(0, 10);
const addD = (n) => new Date(Date.now() + n * 864e5).toISOString().slice(0, 10);
const pad = (n, l = 4) => String(n).padStart(l, "0");
const dm = (d) =>
  new Date(d + "T00:00").toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
const ini = (n) =>
  n
    .split(" ")
    .map((x) => x[0])
    .join("")
    .slice(0, 2);
const rng = (s) => () =>
  (s = (s * 1664525 + 1013904223) % 4294967296) / 4294967296;
const st = (e) =>
  !e.pub
    ? "Draft"
    : e.date > td()
      ? "Upcoming"
      : e.date === td()
        ? "Active"
        : "Completed";
const mt = (e) => e.qs.length * e.mpq;
const ob = (e, a) => Math.max(0, a.c * e.mpq - (e.neg ? (a.w * e.mpq) / 4 : 0));
const chk = (rules) =>
  Object.fromEntries(rules.filter((r) => !r[1]).map((r) => [r[0], r[2]]));
const csv = (name, rows) => {
  const b = new Blob(
    [
      rows
        .map((r) =>
          r
            .map((c) => '"' + String(c ?? "").replace(/"/g, '""') + '"')
            .join(","),
        )
        .join("\n"),
    ],
    { type: "text/csv" },
  );
  const a = document.createElement("a");
  a.href = URL.createObjectURL(b);
  a.download = name;
  a.click();
};
const readImg = (file, max, cb, fail) => {
  if (!file) return;
  if (file.size > max)
    return fail(`Image must be under ${Math.round(max / 1000)} KB`);
  const r = new FileReader();
  r.onload = () => cb(r.result);
  r.readAsDataURL(file);
};

/* results: rank by marks, then fewer wrong answers, then earlier student ID */
function res(S, e) {
  const m = mt(e);
  const r = S.att
    .filter((a) => a.e === e.id)
    .map((a) => ({
      ...a,
      tm: m,
      ob: ob(e, a),
      pc: m ? (ob(e, a) / m) * 100 : 0,
      un: Math.max(0, e.qs.length - a.c - a.w),
    }));
  r.sort((x, y) => y.ob - x.ob || x.w - y.w || (x.s > y.s ? 1 : -1));
  r.forEach((x, i) => {
    x.rk = i + 1;
    x.rs = x.pc >= e.pass ? "Passed" : "Failed";
  });
  return r;
}
const reg = (S, e) =>
  Math.max(
    S.stu.filter((s) => s.cls === e.cls).length,
    S.att.filter((a) => a.e === e.id).length,
  );
function qw(S, e, x) {
  const n = e.qs.length,
    a = [...Array(n)].map((_, i) =>
      i < x.c ? "C" : i < x.c + x.w ? "W" : "U",
    ),
    r = rng(+x.s.slice(4) + n);
  for (let i = n - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return e.qs.map((id, i) => ({ q: S.qs.find((q) => q.id === id), s: a[i] }));
}

/* ───────── data layer (localStorage now; swap for API calls later) ───────── */
function seed() {
  const qs = [];
  const mk = (cls, subj, topic, q, o, c, diff, m) =>
    qs.push({
      id: "Q-" + pad(qs.length + 1),
      cls,
      subj,
      topic,
      q,
      o: o.map(String),
      c,
      diff,
      m,
      type: "MCQ",
      para: "",
      oi: ["", "", "", ""],
      exp: "",
      img: "",
      date: addD(-30 + qs.length),
    });
  for (let i = 1; i <= 10; i++) {
    const r = i * 3 * (i + 2),
      o = [r + 1, r + 3, r - 2];
    o.splice(i % 4, 0, r);
    mk(
      8,
      "Mathematics",
      "Arithmetic",
      `What is ${i * 3} × ${i + 2}?`,
      o,
      i % 4,
      ["Easy", "Medium", "Hard"][i % 3],
      2,
    );
  }
  for (let i = 3; i <= 10; i++) {
    const o = [i + 1, i + 2, i - 1];
    o.splice(i % 4, 0, i);
    mk(
      9,
      "Mathematics",
      "Roots",
      `What is the square root of ${i * i}?`,
      o,
      i % 4,
      i < 6 ? "Easy" : "Medium",
      3,
    );
  }
  [
    [
      "Which gas do plants absorb for photosynthesis?",
      ["Oxygen", "Carbon dioxide", "Nitrogen", "Hydrogen"],
      1,
      "Plants",
    ],
    [
      "The SI unit of force is?",
      ["Joule", "Watt", "Newton", "Pascal"],
      2,
      "Force",
    ],
    [
      "Which organelle is the powerhouse of the cell?",
      ["Nucleus", "Ribosome", "Mitochondria", "Golgi body"],
      2,
      "Cell",
    ],
    [
      "Water boils at what temperature (°C) at sea level?",
      ["90", "100", "110", "120"],
      1,
      "Heat",
    ],
    [
      "Which of these is a non-metal?",
      ["Iron", "Copper", "Sulphur", "Zinc"],
      2,
      "Materials",
    ],
    [
      "Sound cannot travel through?",
      ["Water", "Air", "Steel", "Vacuum"],
      3,
      "Sound",
    ],
  ].forEach((x, i) =>
    mk(8, "Science", x[3], x[0], x[1], x[2], i % 2 ? "Medium" : "Easy", 5),
  );
  const nm = [
    "Aarav Patil",
    "Ananya Deshmukh",
    "Rohan Kulkarni",
    "Sneha Joshi",
    "Vedant Shinde",
    "Isha More",
    "Om Jadhav",
    "Prisha Pawar",
    "Arjun Gaikwad",
    "Kavya Bhosale",
    "Siddharth Kale",
    "Riya Chavan",
    "Yash Thorat",
    "Mira Salunkhe",
    "Atharva Kamble",
    "Tanvi Mane",
  ];
  const sc = [
    "Z.P. High School, Pune",
    "Modern English School",
    "Saraswati Vidyalaya",
  ];
  const stu = nm.map((n, i) => ({
    id: "STU-" + (1001 + i),
    name: n,
    mobile: "98220" + String(10000 + i * 137).slice(-5),
    email: n.split(" ")[0].toLowerCase() + "@example.com",
    cls: i % 3 === 2 ? 9 : 8,
    school: sc[i % 3],
    medium: MED[(i + 1) % 3],
    reg: addD(-90 + i * 4),
    status: i === 5 || i === 11 ? "Inactive" : "Active",
    addr: "Pune, Maharashtra",
  }));
  const ex = (id, name, cls, subj, a, b, mpq, neg, d, pub, dur) => ({
    id: "EX-" + id,
    name,
    cls,
    subj,
    desc: "",
    qs: qs.slice(a, b).map((q) => q.id),
    mpq,
    neg,
    date: addD(d),
    start: "10:00",
    dur,
    pass: 40,
    ins: "Read each question carefully.",
    pub,
  });
  const exs = [
    ex(
      1,
      "Class 8 Maths Unit Test",
      8,
      "Mathematics",
      0,
      10,
      2,
      false,
      -10,
      true,
      30,
    ),
    ex(2, "Class 8 Science Test", 8, "Science", 18, 24, 5, true, -3, true, 20),
    ex(
      3,
      "Class 9 Maths Mid Term",
      9,
      "Mathematics",
      10,
      18,
      3,
      false,
      -6,
      true,
      30,
    ),
    ex(
      4,
      "Class 9 Maths Weekly Quiz",
      9,
      "Mathematics",
      10,
      15,
      2,
      false,
      0,
      true,
      15,
    ),
    ex(
      5,
      "Class 9 Maths Unit Test",
      9,
      "Mathematics",
      10,
      18,
      3,
      false,
      4,
      true,
      30,
    ),
    ex(
      6,
      "Class 8 Science Practice",
      8,
      "Science",
      18,
      24,
      5,
      false,
      8,
      false,
      20,
    ),
  ];
  const att = [];
  exs.forEach((e, k) => {
    if (!e.pub || e.date >= td()) return;
    const r = rng(k + 7),
      n = e.qs.length;
    stu
      .filter((s) => s.cls === e.cls)
      .forEach((s) => {
        if (r() < 0.88) {
          const c = Math.min(n, Math.floor(r() * n * 1.05) + 1),
            w = Math.floor(r() * (n - c + 1));
          att.push({
            e: e.id,
            s: s.id,
            c,
            w,
            sn: s.name,
            ss: s.school,
            sc: s.cls,
          });
        }
      });
  });
  return { qs, stu, arch: [], ex: exs, att, seq: { ex: 6, q: qs.length } };
}
const load = () => {
  try {
    const x = localStorage.getItem(KEY);
    if (x) return JSON.parse(x);
  } catch (e) {}
  return seed();
};

/* ───────── reusable UI ───────── */
const Badge = ({ s }) => <span className={"bd " + s}>{s}</span>;
const Stats = ({ items }) => (
  <div className="stats">
    {items.map(([l, v, k]) => (
      <div key={l} className="st" style={{ "--k": `var(--${k})` }}>
        <span>{l}</span>
        <b>{v}</b>
      </div>
    ))}
  </div>
);
const Head = ({ t, p, children }) => (
  <div className="ph">
    <div>
      <h2>{t}</h2>
      <p>{p}</p>
    </div>
    <div className="acts">{children}</div>
  </div>
);
const Btn = ({ icon: Ic, children, kind = "", ...r }) => (
  <button className={"bt " + kind} {...r}>
    {Ic && <Ic size={16} />}
    {children}
  </button>
);
const Fld = ({ label, err, req, cls = "", children }) => (
  <div className={"f " + cls}>
    <label>
      {label}
      {req && " *"}
    </label>
    {children}
    <small className="er">{err}</small>
  </div>
);
const Sel = ({ value, onChange, list, placeholder, err, ...r }) => (
  <select
    value={value}
    onChange={(e) => onChange(e.target.value)}
    className={err ? "bad" : ""}
    {...r}
  >
    {placeholder !== undefined && <option value="">{placeholder}</option>}
    {list.map((o) => {
      const [a, b] = Array.isArray(o) ? o : [o, o];
      return (
        <option key={a} value={a}>
          {b}
        </option>
      );
    })}
  </select>
);
function Modal({ title, children, foot, w = 560, onClose }) {
  return createPortal(
    <div
      className="ov"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="modal" style={{ maxWidth: w }}>
        <div className="mh">
          <b>{title}</b>
          <button className="ib" onClick={onClose}>
            <X size={18} />
          </button>
        </div>
        <div className="mb">{children}</div>
        {foot && <div className="mf">{foot}</div>}
      </div>
    </div>,
    document.body,
  );
}
const Confirm = ({ msg, label = "Delete", onYes, onNo }) =>
  createPortal(
    <div className="ov" style={{ zIndex: 65 }}>
      <div className="modal" style={{ maxWidth: 420 }}>
        <div className="mb">
          <b style={{ fontSize: 16 }}>Are you sure?</b>
          <p style={{ color: "var(--t2)" }}>{msg}</p>
        </div>
        <div className="mf">
          <Btn onClick={onNo}>Cancel</Btn>
          <Btn kind="dg" onClick={onYes}>
            {label}
          </Btn>
        </div>
      </div>
    </div>,
    document.body,
  );
function RowMenu({ items }) {
  const [pos, setPos] = useState(null);
  useEffect(() => {
    if (!pos) return;
    const h = () => setPos(null);
    window.addEventListener("click", h);
    return () => window.removeEventListener("click", h);
  }, [pos]);
  return (
    <>
      <button
        className="ib"
        aria-label="Actions"
        onClick={(e) => {
          e.stopPropagation();
          const r = e.currentTarget.getBoundingClientRect();
          setPos({
            t: Math.min(r.bottom + 4, innerHeight - items.length * 40 - 12),
            l: Math.max(8, r.right - 180),
          });
        }}
      >
        <MoreVertical size={18} />
      </button>
      {pos &&
        createPortal(
          <div id="dd" style={{ top: pos.t, left: pos.l }}>
            {items.map(([l, Ic, fn, x]) => (
              <button key={l} className={x ? "x" : ""} onClick={fn}>
                <Ic size={15} />
                {l}
              </button>
            ))}
          </div>,
          document.body,
        )}
    </>
  );
}
function Table({ cols, rows, actions }) {
  const [p, setP] = useState(1),
    [n, setN] = useState(5),
    [k, setK] = useState(null),
    [d, setD] = useState(1);
  const sorted = useMemo(() => {
    if (!k) return rows;
    const c = cols.find((c) => c.k === k),
      v = (r) => (c.v ? c.v(r) : r[k]);
    return [...rows].sort((a, b) => {
      const x = v(a),
        y = v(b);
      return (x > y ? 1 : x < y ? -1 : 0) * d;
    });
  }, [rows, k, d]);
  useEffect(() => setP(1), [rows.length]);
  const pg = Math.max(1, Math.ceil(sorted.length / n)),
    pp = Math.min(p, pg),
    sl = sorted.slice((pp - 1) * n, pp * n);
  return (
    <div className="card">
      <div className="tw">
        <table>
          <thead>
            <tr>
              {cols.map((c) => (
                <th
                  key={c.l}
                  className={c.k ? "sr" : ""}
                  onClick={() =>
                    c.k && (k === c.k ? setD(-d) : (setK(c.k), setD(1)))
                  }
                >
                  {c.l}
                  {k === c.k && c.k ? (d > 0 ? " ↑" : " ↓") : ""}
                </th>
              ))}
              {actions && <th />}
            </tr>
          </thead>
          <tbody>
            {sl.map((r, i) => (
              <tr key={r.id || r.s || i}>
                {cols.map((c) => (
                  <td key={c.l}>{c.f ? c.f(r) : String(r[c.k] ?? "")}</td>
                ))}
                {actions && (
                  <td className="ac">
                    <RowMenu items={actions(r)} />
                  </td>
                )}
              </tr>
            ))}
            {!sl.length && (
              <tr>
                <td colSpan={99}>
                  <div className="empty">
                    <b>No records found</b>
                    <span>Try changing the search or filters.</span>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="pgn">
        <span>
          {rows.length} result{rows.length === 1 ? "" : "s"}
        </span>
        <div>
          <select
            value={n}
            onChange={(e) => {
              setN(+e.target.value);
              setP(1);
            }}
          >
            {[5, 10, 25].map((x) => (
              <option key={x}>{x}</option>
            ))}
          </select>{" "}
          per page &nbsp;
          <button disabled={pp < 2} onClick={() => setP(pp - 1)}>
            ‹
          </button>{" "}
          {pp} / {pg}{" "}
          <button disabled={pp >= pg} onClick={() => setP(pp + 1)}>
            ›
          </button>
        </div>
      </div>
    </div>
  );
}
const Bar = ({ children }) => <div className="bar">{children}</div>;
const Search = ({ value, onChange, ph }) => (
  <input
    type="search"
    placeholder={ph}
    value={value}
    onChange={(e) => onChange(e.target.value)}
  />
);

/* ───────── Exams ───────── */
function ExamsView({ C }) {
  const { S, upd, toast, ask, setM } = C;
  const [q, setQ] = useState(""),
    [s, setS] = useState("");
  const rows = S.ex.filter(
    (e) =>
      (!q || e.name.toLowerCase().includes(q.toLowerCase())) &&
      (!s || st(e) === s),
  );
  const c = (x) => S.ex.filter((e) => st(e) === x).length;
  const pub = (e) => {
    if (!e.pub && !e.qs.length)
      return toast("Add questions before publishing", "e");
    upd((d) => {
      const x = d.ex.find((z) => z.id === e.id);
      x.pub = !x.pub;
    });
    toast(e.pub ? "Exam moved to draft" : "Exam published");
  };
  const del = (e) =>
    ask("This exam and its results will be permanently removed.", () => {
      upd((d) => {
        d.ex = d.ex.filter((x) => x.id !== e.id);
        d.att = d.att.filter((a) => a.e !== e.id);
      });
      toast("Exam deleted");
    });
  return (
    <>
      <Head t="Exams" p="Create, schedule and manage examinations">
        <Btn kind="pr" icon={Plus} onClick={() => setM({ k: "exForm" })}>
          Create Exam
        </Btn>
      </Head>
      <Stats
        items={[
          ["Total Exams", S.ex.length, "n"],
          ["Active Exams", c("Active"), "g"],
          ["Upcoming Exams", c("Upcoming"), "c"],
          ["Completed Exams", c("Completed"), "p"],
        ]}
      />
      <Bar>
        <Search value={q} onChange={setQ} ph="Search by exam name" />
        <Sel
          value={s}
          onChange={setS}
          placeholder="All statuses"
          list={["Draft", "Upcoming", "Active", "Completed"]}
        />
      </Bar>
      <Table
        rows={rows}
        cols={[
          { l: "Exam Name", k: "name", f: (e) => <b>{e.name}</b> },
          { l: "Class", k: "cls", f: (e) => e.cls + "th" },
          { l: "Subject", k: "subj" },
          {
            l: "Questions",
            k: "qn",
            v: (e) => e.qs.length,
            f: (e) => e.qs.length,
          },
          { l: "Marks", k: "mk", v: mt, f: mt },
          { l: "Date", k: "date", f: (e) => dm(e.date) },
          { l: "Start", k: "start" },
          { l: "Duration", k: "dur", f: (e) => e.dur + " min" },
          { l: "Status", k: "stt", v: st, f: (e) => <Badge s={st(e)} /> },
        ]}
        actions={(e) => [
          ["View Exam", Eye, () => setM({ k: "exView", id: e.id })],
          ["Edit Exam", Pencil, () => setM({ k: "exForm", id: e.id })],
          [e.pub ? "Unpublish" : "Publish", Check, () => pub(e)],
          ["Delete Exam", Trash2, () => del(e), 1],
        ]}
      />
    </>
  );
}
function ExamView({ C, id, onClose }) {
  const { S } = C,
    e = S.ex.find((x) => x.id === id);
  return (
    <Modal title="Exam Details" onClose={onClose} w={620}>
      <div className="kv">
        <span>Name</span>
        <b>{e.name}</b>
        <span>Class / Subject</span>
        {e.cls}th · {e.subj}
        <span>Status</span>
        <Badge s={st(e)} />
        <span>Schedule</span>
        {dm(e.date)}, {e.start} ({e.dur} min)<span>Marks</span>
        {mt(e)} ({e.qs.length} Q × {e.mpq}
        {e.neg ? ", negative marking ¼" : ""})<span>Pass %</span>
        {e.pass}%<span>Instructions</span>
        {e.ins || "—"}
      </div>
      <b>Questions</b>
      {e.qs
        .map((i) => S.qs.find((q) => q.id === i))
        .filter(Boolean)
        .map((q) => (
          <div className="pv" key={q.id}>
            {q.q}
          </div>
        ))}
    </Modal>
  );
}
function ExamForm({ C, id, onClose }) {
  const { S, upd, toast } = C,
    old = S.ex.find((x) => x.id === id);
  const [f, setF] = useState(
    old || {
      name: "",
      cls: 8,
      subj: "Mathematics",
      desc: "",
      qs: [],
      mpq: 1,
      neg: false,
      date: addD(7),
      start: "10:00",
      dur: 30,
      pass: 40,
      ins: "",
      pub: false,
    },
  );
  const [er, setEr] = useState({});
  const set = (k, v) => setF((x) => ({ ...x, [k]: v }));
  const list = S.qs.filter((q) => q.cls === +f.cls && q.subj === f.subj),
    sel = f.qs.filter((i) => list.some((q) => q.id === i));
  const save = (pub) => {
    const e = chk([
      ["name", f.name.trim().length >= 3, "Enter an exam name"],
      ["mpq", +f.mpq > 0, "Must be greater than 0"],
      ["pass", f.pass !== "" && +f.pass >= 0 && +f.pass <= 100, "0 to 100"],
      ["date", f.date, "Pick a date"],
      ["start", f.start, "Pick a time"],
      ["dur", +f.dur > 0, "Enter duration"],
      ["qs", !pub || sel.length > 0, "Select at least one question to publish"],
    ]);
    setEr(e);
    if (Object.keys(e).length)
      return toast("Please fix the highlighted fields", "e");
    const o = {
      ...f,
      cls: +f.cls,
      mpq: +f.mpq,
      dur: +f.dur,
      pass: +f.pass,
      qs: sel,
      pub,
    };
    upd((d) => {
      if (id) d.ex[d.ex.findIndex((x) => x.id === id)] = o;
      else {
        d.seq.ex++;
        d.ex.push({ ...o, id: "EX-" + d.seq.ex });
      }
    });
    toast(id ? "Exam updated" : pub ? "Exam published" : "Exam saved as draft");
    onClose();
  };
  const cl = (k) => (er[k] ? "bad" : "");
  return (
    <Modal
      title={id ? "Edit Exam" : "Create Exam"}
      w={720}
      onClose={onClose}
      foot={
        <>
          <Btn onClick={onClose}>Cancel</Btn>
          <Btn onClick={() => save(false)}>Save as Draft</Btn>
          <Btn kind="pr" onClick={() => save(true)}>
            {id ? "Save & Publish" : "Publish Exam"}
          </Btn>
        </>
      }
    >
      <div className="g2">
        <Fld label="Exam Name" req err={er.name} cls="w">
          <input
            className={cl("name")}
            value={f.name}
            onChange={(e) => set("name", e.target.value)}
          />
        </Fld>
        <Fld label="Class / Standard" req>
          <Sel
            value={f.cls}
            onChange={(v) => set("cls", v)}
            list={CLS.map((c) => [c, c + "th"])}
          />
        </Fld>
        <Fld label="Subject" req>
          <Sel value={f.subj} onChange={(v) => set("subj", v)} list={SUBJ} />
        </Fld>
        <Fld label="Marks Per Question" req err={er.mpq}>
          <input
            type="number"
            min="1"
            className={cl("mpq")}
            value={f.mpq}
            onChange={(e) => set("mpq", e.target.value)}
          />
        </Fld>
        <Fld label="Description" cls="w">
          <textarea
            rows="2"
            value={f.desc}
            onChange={(e) => set("desc", e.target.value)}
          />
        </Fld>
        <Fld label="Select Questions" err={er.qs} cls="w">
          <div className="ql">
            {list.map((q) => (
              <label key={q.id}>
                <input
                  type="checkbox"
                  checked={sel.includes(q.id)}
                  onChange={(e) =>
                    set(
                      "qs",
                      e.target.checked
                        ? [...sel, q.id]
                        : sel.filter((i) => i !== q.id),
                    )
                  }
                />
                <span>{q.q.slice(0, 70) || "(image question)"}</span>
              </label>
            ))}
            {!list.length && (
              <span style={{ color: "var(--t2)", padding: 6 }}>
                No questions for this class and subject yet.
              </span>
            )}
          </div>
        </Fld>
        <Fld label="Total Questions (auto)">
          <input readOnly value={sel.length} />
        </Fld>
        <Fld label="Total Marks (auto)">
          <input readOnly value={sel.length * (+f.mpq || 0)} />
        </Fld>
        <Fld label="Negative Marking">
          <Sel
            value={f.neg ? "y" : "n"}
            onChange={(v) => set("neg", v === "y")}
            list={[
              ["n", "No"],
              ["y", "Yes (¼ per wrong)"],
            ]}
          />
        </Fld>
        <Fld label="Passing %" req err={er.pass}>
          <input
            type="number"
            className={cl("pass")}
            value={f.pass}
            onChange={(e) => set("pass", e.target.value)}
          />
        </Fld>
        <Fld label="Exam Date" req err={er.date}>
          <input
            type="date"
            className={cl("date")}
            value={f.date}
            onChange={(e) => set("date", e.target.value)}
          />
        </Fld>
        <Fld label="Start Time" req err={er.start}>
          <input
            type="time"
            className={cl("start")}
            value={f.start}
            onChange={(e) => set("start", e.target.value)}
          />
        </Fld>
        <Fld label="Duration (minutes)" req err={er.dur}>
          <input
            type="number"
            className={cl("dur")}
            value={f.dur}
            onChange={(e) => set("dur", e.target.value)}
          />
        </Fld>
        <Fld label="Instructions" cls="w">
          <textarea
            rows="2"
            value={f.ins}
            onChange={(e) => set("ins", e.target.value)}
          />
        </Fld>
      </div>
    </Modal>
  );
}

/* ───────── Questions ───────── */
function QuestionsView({ C }) {
  const { S, upd, toast, ask, setM } = C;
  const [F, setFl] = useState({ q: "", c: "", s: "", d: "", t: "" }),
    sf = (k) => (v) => setFl((x) => ({ ...x, [k]: v }));
  const rows = S.qs.filter(
    (x) =>
      (!F.q || (x.q + x.topic).toLowerCase().includes(F.q.toLowerCase())) &&
      (!F.c || x.cls === +F.c) &&
      (!F.s || x.subj === F.s) &&
      (!F.d || x.diff === F.d) &&
      (!F.t || x.type === F.t),
  );
  const n = (d) => S.qs.filter((x) => x.diff === d).length;
  const del = (q) => {
    const k = S.ex.filter((e) => e.qs.includes(q.id)).length;
    ask(
      "Delete this question?" +
        (k ? ` It will also be removed from ${k} exam(s).` : ""),
      () => {
        upd((d) => {
          d.qs = d.qs.filter((x) => x.id !== q.id);
          d.ex.forEach((e) => (e.qs = e.qs.filter((i) => i !== q.id)));
        });
        toast("Question deleted");
      },
    );
  };
  return (
    <>
      <Head t="Question Bank" p="Manage MCQ questions for your examinations">
        <Btn icon={Upload} onClick={() => setM({ k: "bulk" })}>
          Bulk Upload
        </Btn>
        <Btn kind="pr" icon={Plus} onClick={() => setM({ k: "qForm" })}>
          Add Question
        </Btn>
      </Head>
      <Stats
        items={[
          ["Total Questions", S.qs.length, "n"],
          ["Subjects", new Set(S.qs.map((x) => x.subj)).size, "c"],
          ["Easy", n("Easy"), "g"],
          ["Medium", n("Medium"), "o"],
          ["Hard", n("Hard"), "p"],
        ]}
      />
      <Bar>
        <Search value={F.q} onChange={sf("q")} ph="Search question or topic" />
        <Sel
          value={F.c}
          onChange={sf("c")}
          placeholder="All classes"
          list={CLS.map((c) => [c, c + "th"])}
        />
        <Sel
          value={F.s}
          onChange={sf("s")}
          placeholder="All subjects"
          list={SUBJ}
        />
        <Sel
          value={F.d}
          onChange={sf("d")}
          placeholder="All levels"
          list={["Easy", "Medium", "Hard"]}
        />
        <Sel
          value={F.t}
          onChange={sf("t")}
          placeholder="All types"
          list={TYPES}
        />
      </Bar>
      <Table
        rows={rows}
        cols={[
          {
            l: "Question",
            k: "q",
            f: (x) =>
              (x.para ? "[Para] " : "") +
              (x.img ? "[Img] " : "") +
              x.q.slice(0, 45) +
              (x.q.length > 45 ? "…" : ""),
          },
          { l: "Subject", k: "subj" },
          { l: "Class", k: "cls", f: (x) => x.cls + "th" },
          { l: "Topic", k: "topic" },
          { l: "Difficulty", k: "diff", f: (x) => <Badge s={x.diff} /> },
          {
            l: "Type",
            k: "type",
            f: (x) => (TYPES.find((t) => t[0] === x.type) || [0, x.type])[1],
          },
          { l: "Marks", k: "m" },
          { l: "Created", k: "date", f: (x) => dm(x.date) },
        ]}
        actions={(x) => [
          ["View Question", Eye, () => setM({ k: "qView", id: x.id })],
          ["Edit Question", Pencil, () => setM({ k: "qForm", id: x.id })],
          ["Delete Question", Trash2, () => del(x), 1],
        ]}
      />
    </>
  );
}
function QuestionView({ C, id, onClose }) {
  const q = C.S.qs.find((x) => x.id === id);
  return (
    <Modal title={"Question Details"} onClose={onClose}>
      {q.para && (
        <div className="pv" style={{ background: "var(--bg)" }}>
          {q.para}
        </div>
      )}
      <p>
        <b>{q.q}</b>
      </p>
      {q.img && (
        <img src={q.img} alt="" style={{ maxWidth: "100%", borderRadius: 8 }} />
      )}
      {q.o.map((o, i) => (
        <div
          key={i}
          className="pv"
          style={
            i === q.c
              ? { borderColor: "var(--g)", background: "#E4F5EE" }
              : null
          }
        >
          {"ABCD"[i]}. {o}
          {q.oi?.[i] && (
            <>
              <br />
              <img
                src={q.oi[i]}
                alt=""
                style={{ maxHeight: 90, borderRadius: 6 }}
              />
            </>
          )}
        </div>
      ))}
      <div className="kv">
        <span>Class / Subject</span>
        {q.cls}th · {q.subj}
        <span>Topic</span>
        {q.topic}
        <span>Difficulty</span>
        <Badge s={q.diff} />
        <span>Marks</span>
        {q.m}
        <span>Explanation</span>
        {q.exp || "—"}
      </div>
    </Modal>
  );
}
function QuestionForm({ C, id, onClose }) {
  const { S, upd, toast } = C,
    old = S.qs.find((x) => x.id === id);
  const blank = () => ({ q: "", o: ["", "", "", ""], c: 0, exp: "" });
  const [f, setF] = useState(
    old
      ? { ...old, oi: old.oi || ["", "", "", ""] }
      : {
          cls: 8,
          subj: "Mathematics",
          topic: "",
          q: "",
          o: ["", "", "", ""],
          c: 0,
          exp: "",
          diff: "Easy",
          m: 1,
          img: "",
          type: "MCQ",
          para: "",
          oi: ["", "", "", ""],
        },
  );
  const [subs, setSubs] = useState(
    old
      ? [{ q: old.q, o: [...old.o], c: old.c, exp: old.exp || "" }]
      : [blank()],
  );
  const [er, setEr] = useState({});
  const set = (k, v) => setF((x) => ({ ...x, [k]: v }));
  const arr = (k, i, v) =>
    setF((x) => ({ ...x, [k]: x[k].map((y, j) => (j === i ? v : y)) }));
  const sub = (i, k, v) =>
    setSubs((a) => a.map((x, j) => (j === i ? { ...x, [k]: v } : x)));
  const subO = (i, k, v) =>
    setSubs((a) =>
      a.map((x, j) =>
        j === i ? { ...x, o: x.o.map((y, z) => (z === k ? v : y)) } : x,
      ),
    );
  const isP = f.type === "Paragraph MCQ",
    ImgOpt = f.type === "Image Options",
    cl = (k) => (er[k] ? "bad" : "");
  const save = () => {
    const common = [
      ["topic", f.topic.trim(), "Required"],
      ["m", +f.m > 0, "Must be greater than 0"],
    ];
    const e = isP
      ? chk([
          ...common,
          ["para", f.para.trim().length >= 10, "Enter the paragraph"],
          ...subs.flatMap((x, i) => [
            ["s" + i + "q", x.q.trim().length >= 5, "Enter the question"],
            ...x.o.map((v, j) => ["s" + i + "o" + j, v.trim(), "Required"]),
          ]),
        ])
      : chk([
          ...common,
          [
            "q",
            f.q.trim().length >= 5 || (f.type === "Image Question" && f.img),
            "Enter the question",
          ],
          [
            "img",
            f.type !== "Image Question" || f.img,
            "Upload the question image",
          ],
          ...f.o.map((v, i) => [
            "o" + i,
            v.trim() || (ImgOpt && f.oi[i]),
            ImgOpt ? "Add text or image" : "Required",
          ]),
        ]);
    setEr(e);
    if (Object.keys(e).length)
      return toast("Please fix the highlighted fields", "e");
    if (isP) {
      const base = {
        cls: +f.cls,
        subj: f.subj,
        topic: f.topic,
        diff: f.diff,
        m: +f.m,
        type: f.type,
        para: f.para,
        img: "",
        oi: ["", "", "", ""],
      };
      upd((d) => {
        const grp = old?.grp || "G-" + Date.now();
        subs.forEach((x, i) => {
          const rec = { ...base, grp, q: x.q, o: x.o, c: +x.c, exp: x.exp };
          if (id && i === 0) {
            const ix = d.qs.findIndex((z) => z.id === id);
            d.qs[ix] = { ...d.qs[ix], ...rec };
          } else {
            d.seq.q++;
            d.qs.push({ ...rec, id: "Q-" + pad(d.seq.q), date: td() });
          }
        });
        if (old?.grp)
          d.qs.forEach((z) => {
            if (z.grp === old.grp) z.para = f.para;
          });
      });
      toast(
        subs.length > 1
          ? `${subs.length} questions saved under this paragraph`
          : id
            ? "Question updated"
            : "Question added",
      );
    } else {
      const o = {
        ...f,
        cls: +f.cls,
        c: +f.c,
        m: +f.m,
        para: "",
        oi: ImgOpt ? f.oi : ["", "", "", ""],
      };
      upd((d) => {
        if (id) d.qs[d.qs.findIndex((x) => x.id === id)] = o;
        else {
          d.seq.q++;
          d.qs.push({ ...o, id: "Q-" + pad(d.seq.q), date: td() });
        }
      });
      toast(id ? "Question updated" : "Question added");
    }
    onClose();
  };
  return (
    <Modal
      title={id ? "Edit Question" : "Add Question"}
      w={760}
      onClose={onClose}
      foot={
        <>
          <Btn onClick={onClose}>Cancel</Btn>
          <Btn kind="pr" onClick={save}>
            {id
              ? "Update"
              : isP && subs.length > 1
                ? "Save Questions"
                : "Save Question"}
          </Btn>
        </>
      }
    >
      <div className="g2">
        <Fld label="Class" req>
          <Sel
            value={f.cls}
            onChange={(v) => set("cls", v)}
            list={CLS.map((c) => [c, c + "th"])}
          />
        </Fld>
        <Fld label="Subject" req>
          <Sel value={f.subj} onChange={(v) => set("subj", v)} list={SUBJ} />
        </Fld>
        <Fld label="Topic" req err={er.topic}>
          <input
            className={cl("topic")}
            value={f.topic}
            onChange={(e) => set("topic", e.target.value)}
          />
        </Fld>
        <Fld label="Question Type" req>
          <Sel value={f.type} onChange={(v) => set("type", v)} list={TYPES} />
        </Fld>
        <Fld label="Difficulty" req>
          <Sel
            value={f.diff}
            onChange={(v) => set("diff", v)}
            list={["Easy", "Medium", "Hard"]}
          />
        </Fld>
        <Fld label={isP ? "Marks (per question)" : "Marks"} req err={er.m}>
          <input
            type="number"
            min="1"
            className={cl("m")}
            value={f.m}
            onChange={(e) => set("m", e.target.value)}
          />
        </Fld>
        {isP ? (
          <>
            <Fld label="Paragraph / Passage" req err={er.para} cls="w">
              <textarea
                rows="5"
                className={cl("para")}
                value={f.para}
                onChange={(e) => set("para", e.target.value)}
              />
            </Fld>
            {subs.map((x, i) => (
              <div className="w sq" key={i}>
                <div className="sqh">
                  <b>Question {i + 1}</b>
                  {subs.length > 1 && !(id && i === 0) && (
                    <button
                      type="button"
                      className="ib"
                      aria-label="Remove question"
                      onClick={() =>
                        setSubs((a) => a.filter((_, j) => j !== i))
                      }
                    >
                      <Trash2 size={15} />
                    </button>
                  )}
                </div>
                <div className="g2">
                  <Fld
                    label="Question Text"
                    req
                    err={er["s" + i + "q"]}
                    cls="w"
                  >
                    <textarea
                      rows="2"
                      className={cl("s" + i + "q")}
                      value={x.q}
                      onChange={(e) => sub(i, "q", e.target.value)}
                    />
                  </Fld>
                  {["A", "B", "C", "D"].map((l, j) => (
                    <Fld
                      key={l}
                      label={"Option " + l}
                      req
                      err={er["s" + i + "o" + j]}
                    >
                      <input
                        className={cl("s" + i + "o" + j)}
                        value={x.o[j]}
                        onChange={(e) => subO(i, j, e.target.value)}
                      />
                    </Fld>
                  ))}
                  <Fld label="Correct Answer" req>
                    <Sel
                      value={x.c}
                      onChange={(v) => sub(i, "c", v)}
                      list={[
                        [0, "A"],
                        [1, "B"],
                        [2, "C"],
                        [3, "D"],
                      ]}
                    />
                  </Fld>
                  <Fld label="Explanation (optional)">
                    <input
                      value={x.exp}
                      onChange={(e) => sub(i, "exp", e.target.value)}
                    />
                  </Fld>
                </div>
              </div>
            ))}
            <div className="w">
              <Btn
                type="button"
                icon={Plus}
                onClick={() => setSubs((a) => [...a, blank()])}
              >
                Add Question
              </Btn>
            </div>
          </>
        ) : (
          <>
            <Fld label="Question Text" req err={er.q} cls="w">
              <textarea
                rows="3"
                className={cl("q")}
                value={f.q}
                onChange={(e) => set("q", e.target.value)}
              />
            </Fld>
            <Fld
              label={
                f.type === "Image Question"
                  ? "Question Image"
                  : "Question Image (optional)"
              }
              req={f.type === "Image Question"}
              err={er.img}
              cls="w"
            >
              <input
                type="file"
                accept="image/*"
                onChange={(e) =>
                  readImg(
                    e.target.files[0],
                    500000,
                    (v) => set("img", v),
                    (m) => toast(m, "e"),
                  )
                }
              />
              {f.img && (
                <img
                  src={f.img}
                  alt=""
                  style={{ maxHeight: 80, marginTop: 6, borderRadius: 6 }}
                />
              )}
            </Fld>
            {["A", "B", "C", "D"].map((l, i) => (
              <Fld key={l} label={"Option " + l} req err={er["o" + i]}>
                <input
                  className={cl("o" + i)}
                  value={f.o[i]}
                  onChange={(e) => arr("o", i, e.target.value)}
                />
                {ImgOpt && (
                  <>
                    <input
                      type="file"
                      accept="image/*"
                      style={{ marginTop: 6 }}
                      onChange={(e) =>
                        readImg(
                          e.target.files[0],
                          300000,
                          (v) => arr("oi", i, v),
                          (m) => toast(m, "e"),
                        )
                      }
                    />
                    {f.oi[i] && (
                      <img
                        src={f.oi[i]}
                        alt=""
                        style={{ maxHeight: 70, marginTop: 6, borderRadius: 6 }}
                      />
                    )}
                  </>
                )}
              </Fld>
            ))}
            <Fld label="Correct Answer" req>
              <Sel
                value={f.c}
                onChange={(v) => set("c", v)}
                list={[
                  [0, "A"],
                  [1, "B"],
                  [2, "C"],
                  [3, "D"],
                ]}
              />
            </Fld>
            <Fld label="Explanation (optional)">
              <input
                value={f.exp}
                onChange={(e) => set("exp", e.target.value)}
              />
            </Fld>
          </>
        )}
      </div>
    </Modal>
  );
}
function parseCsv(t) {
  const R = [];
  let r = [],
    c = "",
    q = false;
  for (let i = 0; i < t.length; i++) {
    const h = t[i];
    if (q) {
      if (h === '"' && t[i + 1] === '"') {
        c += '"';
        i++;
      } else if (h === '"') q = false;
      else c += h;
    } else if (h === '"') q = true;
    else if (h === ",") {
      r.push(c);
      c = "";
    } else if (h === "\n" || h === "\r") {
      if (h === "\r" && t[i + 1] === "\n") i++;
      r.push(c);
      c = "";
      if (r.some((x) => x.trim())) R.push(r);
      r = [];
    } else c += h;
  }
  r.push(c);
  if (r.some((x) => x.trim())) R.push(r);
  return R;
}
function BulkUpload({ C, onClose }) {
  const { S, upd, toast } = C,
    [rows, setRows] = useState([]);
  const onFile = (file) => {
    if (!file) return;
    const rd = new FileReader();
    rd.onload = () => {
      const seen = new Set(S.qs.map((q) => q.cls + q.subj + q.q.toLowerCase()));
      setRows(
        parseCsv(String(rd.result).replace(/^\uFEFF/, ""))
          .slice(1)
          .map((r, k) => {
            const v = r.map((x) => x.trim()),
              er = [];
            HD.slice(0, 11).forEach((h, j) => {
              if (!v[j]) er.push(h + " missing");
            });
            if (v[0] && !CLS.includes(+v[0])) er.push("class must be 1–10");
            if (v[8] && !/^[ABCD]$/i.test(v[8])) er.push("correct must be A–D");
            if (
              v[9] &&
              !["easy", "medium", "hard"].includes(v[9].toLowerCase())
            )
              er.push("invalid difficulty");
            if (v[10] && !(+v[10] > 0)) er.push("invalid marks");
            const key = v[0] + v[1] + (v[3] || "").toLowerCase();
            if (!er.length) {
              if (seen.has(key)) er.push("duplicate question");
              else seen.add(key);
            }
            return { n: k + 2, v, er };
          }),
      );
    };
    rd.readAsText(file);
  };
  const ok = rows.filter((x) => !x.er.length);
  const imp = () => {
    upd((d) =>
      ok.forEach(({ v }) => {
        d.seq.q++;
        d.qs.push({
          id: "Q-" + pad(d.seq.q),
          cls: +v[0],
          subj: v[1],
          topic: v[2],
          q: v[3],
          o: v.slice(4, 8),
          c: "ABCD".indexOf(v[8].toUpperCase()),
          diff: v[9][0].toUpperCase() + v[9].slice(1).toLowerCase(),
          m: +v[10],
          exp: v[11] || "",
          para: v[12] || "",
          type: v[12] ? "Paragraph MCQ" : "MCQ",
          img: "",
          oi: ["", "", "", ""],
          date: td(),
        });
      }),
    );
    toast(
      `Imported ${ok.length} question(s); ${rows.length - ok.length} failed`,
    );
    onClose();
  };
  return (
    <Modal
      title="Bulk Upload Questions"
      w={860}
      onClose={onClose}
      foot={
        <>
          <Btn onClick={onClose}>Close</Btn>
          <Btn kind="pr" disabled={!ok.length} onClick={imp}>
            Import Valid Questions
          </Btn>
        </>
      }
    >
      <p style={{ color: "var(--t2)", marginTop: 0 }}>
        Upload a CSV file (in Excel, use Save As → CSV). Required: class,
        subject, topic, question, four options, correct (A–D), difficulty,
        marks. Optional: explanation, paragraph.
      </p>
      <div className="acts" style={{ marginBottom: 12 }}>
        <Btn
          icon={Download}
          onClick={() =>
            csv("question-template.csv", [
              HD,
              [
                8,
                "Mathematics",
                "Algebra",
                "What is 2+3?",
                "4",
                "5",
                "6",
                "7",
                "B",
                "Easy",
                1,
                "2+3=5",
                "",
              ],
            ])
          }
        >
          Download Template
        </Btn>
        <input
          type="file"
          accept=".csv"
          onChange={(e) => onFile(e.target.files[0])}
        />
      </div>
      {rows.length > 0 && (
        <>
          <div style={{ marginBottom: 8 }}>
            <span className="bd Passed">{ok.length} valid</span>{" "}
            <span className="bd Failed">
              {rows.length - ok.length} with errors
            </span>
          </div>
          <div className="tw" style={{ maxHeight: 300, overflow: "auto" }}>
            <table>
              <thead>
                <tr>
                  <th>Row</th>
                  <th>Question</th>
                  <th>Subject</th>
                  <th>Class</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((x) => (
                  <tr key={x.n}>
                    <td>{x.n}</td>
                    <td>{(x.v[3] || "").slice(0, 50)}</td>
                    <td>{x.v[1]}</td>
                    <td>{x.v[0]}</td>
                    <td>
                      {x.er.length ? (
                        <span style={{ color: "var(--r)" }}>
                          {x.er.join("; ")}
                        </span>
                      ) : (
                        <span style={{ color: "var(--g)" }}>OK</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </Modal>
  );
}

/* ───────── Students (no “Add Student”: students self-register) ───────── */
function StudentsView({ C }) {
  const { S, upd, toast, ask, setM } = C;
  const [F, setFl] = useState({ q: "", c: "", sc: "", s: "", d: "" }),
    sf = (k) => (v) => setFl((x) => ({ ...x, [k]: v }));
  const rows = S.stu.filter(
    (s) =>
      (!F.q || (s.name + s.mobile).toLowerCase().includes(F.q.toLowerCase())) &&
      (!F.c || s.cls === +F.c) &&
      (!F.sc || s.school === F.sc) &&
      (!F.s || s.status === F.s) &&
      (!F.d || s.reg >= F.d),
  );
  const n = (x) => S.stu.filter((s) => s.status === x).length;
  const del = (s) =>
    ask(
      `Delete ${s.name}? Their exam history stays in the results records.`,
      () => {
        upd((d) => {
          d.arch.push(s);
          d.stu = d.stu.filter((x) => x.id !== s.id);
        });
        toast("Student deleted");
      },
    );
  return (
    <>
      <Head
        t="Students"
        p="Students register themselves through the student registration system"
      />
      <Stats
        items={[
          ["Registered Students", S.stu.length, "n"],
          ["Active", n("Active"), "g"],
          ["Inactive", n("Inactive"), "o"],
          [
            "Exam Participants",
            new Set(
              S.att
                .filter((a) => S.stu.some((s) => s.id === a.s))
                .map((a) => a.s),
            ).size,
            "c",
          ],
        ]}
      />
      <Bar>
        <Search value={F.q} onChange={sf("q")} ph="Search by name or mobile" />
        <Sel
          value={F.c}
          onChange={sf("c")}
          placeholder="All classes"
          list={CLS.map((c) => [c, c + "th"])}
        />
        <Sel
          value={F.sc}
          onChange={sf("sc")}
          placeholder="All schools"
          list={[...new Set(S.stu.map((s) => s.school))]}
        />
        <Sel
          value={F.s}
          onChange={sf("s")}
          placeholder="All statuses"
          list={["Active", "Inactive"]}
        />
        <input
          type="date"
          title="Registered on or after"
          value={F.d}
          onChange={(e) => sf("d")(e.target.value)}
        />
      </Bar>
      <Table
        rows={rows}
        cols={[
          { l: "Student", k: "name", f: (s) => <b>{s.name}</b> },
          { l: "Mobile", k: "mobile" },
          { l: "Email", k: "email" },
          { l: "Class", k: "cls", f: (s) => s.cls + "th" },
          { l: "School", k: "school" },
          { l: "Registered", k: "reg", f: (s) => dm(s.reg) },
          { l: "Status", k: "status", f: (s) => <Badge s={s.status} /> },
        ]}
        actions={(s) => [
          ["View Student", Eye, () => setM({ k: "sView", id: s.id })],
          ["Edit Student", Pencil, () => setM({ k: "sForm", id: s.id })],
          ["Delete Student", Trash2, () => del(s), 1],
        ]}
      />
    </>
  );
}
function StudentView({ C, id, onClose }) {
  const { S } = C,
    s = S.stu.find((x) => x.id === id) || S.arch.find((x) => x.id === id);
  const h = S.att
    .filter((a) => a.s === id)
    .map((a) => {
      const e = S.ex.find((x) => x.id === a.e);
      return e && { e, r: res(S, e).find((x) => x.s === id) };
    })
    .filter(Boolean);
  const avg = h.length
    ? (h.reduce((t, x) => t + x.r.pc, 0) / h.length).toFixed(1) + "%"
    : "—";
  return (
    <Modal title="Student Profile" onClose={onClose}>
      <p style={{ margin: "0 0 12px" }}>
        <b style={{ fontSize: 16 }}>{s.name}</b>
      </p>
      <div className="kv">
        <span>Mobile</span>
        {s.mobile}
        <span>Email</span>
        {s.email}
        <span>Class</span>
        {s.cls}th<span>School</span>
        {s.school}
        <span>Address</span>
        {s.addr}
        <span>Registered</span>
        {dm(s.reg)}
        <span>Exams attempted</span>
        {h.length}
        <span>Overall performance</span>
        <b>{avg}</b>
      </div>
      <b>Exam history</b>
      {h.map((x) => (
        <div className="pv" key={x.e.id}>
          {x.e.name} — {x.r.ob}/{x.r.tm} ({x.r.pc.toFixed(1)}%) · Rank {x.r.rk}{" "}
          · {x.r.rs}
        </div>
      ))}
      {!h.length && (
        <p style={{ color: "var(--t2)" }}>No exams attempted yet.</p>
      )}
    </Modal>
  );
}
function StudentForm({ C, id, onClose }) {
  const { S, upd, toast } = C,
    [f, setF] = useState({ ...S.stu.find((x) => x.id === id) }),
    [er, setEr] = useState({});
  const set = (k, v) => setF((x) => ({ ...x, [k]: v })),
    cl = (k) => (er[k] ? "bad" : "");
  const save = () => {
    const e = chk([
      ["name", f.name.trim().length >= 3, "Enter full name"],
      ["mobile", /^[6-9]\d{9}$/.test(f.mobile), "Valid 10-digit mobile"],
      ["email", /^\S+@\S+\.\S+$/.test(f.email), "Valid email"],
      ["school", f.school.trim(), "Required"],
    ]);
    setEr(e);
    if (Object.keys(e).length)
      return toast("Please fix the highlighted fields", "e");
    upd((d) => {
      d.stu[d.stu.findIndex((x) => x.id === id)] = { ...f, cls: +f.cls };
    });
    toast("Student updated");
    onClose();
  };
  return (
    <Modal
      title="Edit Student"
      onClose={onClose}
      foot={
        <>
          <Btn onClick={onClose}>Cancel</Btn>
          <Btn kind="pr" onClick={save}>
            Save Changes
          </Btn>
        </>
      }
    >
      <div className="g2">
        <Fld label="Full Name" req err={er.name} cls="w">
          <input
            className={cl("name")}
            value={f.name}
            onChange={(e) => set("name", e.target.value)}
          />
        </Fld>
        <Fld label="Mobile" req err={er.mobile}>
          <input
            type="tel"
            className={cl("mobile")}
            value={f.mobile}
            onChange={(e) => set("mobile", e.target.value)}
          />
        </Fld>
        <Fld label="Email" req err={er.email}>
          <input
            type="email"
            className={cl("email")}
            value={f.email}
            onChange={(e) => set("email", e.target.value)}
          />
        </Fld>
        <Fld label="Class" req>
          <Sel
            value={f.cls}
            onChange={(v) => set("cls", v)}
            list={CLS.map((c) => [c, c + "th"])}
          />
        </Fld>
        <Fld label="School Name" req err={er.school} cls="w">
          <input
            className={cl("school")}
            value={f.school}
            onChange={(e) => set("school", e.target.value)}
          />
        </Fld>
        <Fld label="Address" cls="w">
          <input value={f.addr} onChange={(e) => set("addr", e.target.value)} />
        </Fld>
        <Fld label="Status">
          <Sel
            value={f.status}
            onChange={(v) => set("status", v)}
            list={["Active", "Inactive"]}
          />
        </Fld>
      </div>
    </Modal>
  );
}

/* ───────── Results ───────── */
function ResultsView({ C }) {
  const { S, sub, setSub } = C,
    [q, setQ] = useState("");
  if (sub) return <ResultDetail C={C} id={sub} />;
  const ex = S.ex.filter((e) => st(e) !== "Draft"),
    all = ex.flatMap((e) => res(S, e)),
    A = S.att.filter((a) => S.ex.some((e) => e.id === a.e));
  const av = all.length
    ? (all.reduce((t, x) => t + x.pc, 0) / all.length).toFixed(1)
    : 0;
  return (
    <>
      <Head t="Results" p="Examination-wise result management" />
      <Stats
        items={[
          ["Exam Attempts", A.length, "n"],
          ["Students Appeared", new Set(A.map((a) => a.s)).size, "c"],
          ["Average %", av + "%", "o"],
          ["Passed", all.filter((x) => x.rs === "Passed").length, "g"],
          ["Failed", all.filter((x) => x.rs === "Failed").length, "p"],
        ]}
      />
      <Bar>
        <Search value={q} onChange={setQ} ph="Search exam name" />
      </Bar>
      <Table
        rows={ex.filter(
          (e) => !q || e.name.toLowerCase().includes(q.toLowerCase()),
        )}
        cols={[
          { l: "Exam Name", k: "name", f: (e) => <b>{e.name}</b> },
          { l: "Class", k: "cls", f: (e) => e.cls + "th" },
          { l: "Date", k: "date", f: (e) => dm(e.date) },
          {
            l: "Registered",
            k: "rg",
            v: (e) => reg(S, e),
            f: (e) => reg(S, e),
          },
          {
            l: "Appeared",
            k: "ap",
            v: (e) => res(S, e).length,
            f: (e) => res(S, e).length,
          },
          {
            l: "Absent",
            f: (e) =>
              st(e) === "Completed"
                ? Math.max(0, reg(S, e) - res(S, e).length)
                : "—",
          },
          {
            l: "Avg Score",
            f: (e) => {
              const r = res(S, e);
              return r.length
                ? (r.reduce((t, x) => t + x.ob, 0) / r.length).toFixed(1) +
                    "/" +
                    mt(e)
                : "—";
            },
          },
          { l: "Highest", f: (e) => res(S, e)[0]?.ob ?? "—" },
          {
            l: "Status",
            f: (e) => (
              <Badge s={st(e) === "Completed" ? "Published" : "Pending"} />
            ),
          },
          {
            l: "Action",
            f: (e) => <Btn onClick={() => setSub(e.id)}>View Results</Btn>,
          },
        ]}
      />
    </>
  );
}
function ResultDetail({ C, id }) {
  const { S, setSub, setM } = C,
    e = S.ex.find((x) => x.id === id),
    all = res(S, e);
  const [F, setFl] = useState({ q: "", sc: "", r: "", t: "" }),
    sf = (k) => (v) => setFl((x) => ({ ...x, [k]: v }));
  const rows = all.filter(
    (x) =>
      (!F.q || (x.sn + x.s).toLowerCase().includes(F.q.toLowerCase())) &&
      (!F.sc || x.ss === F.sc) &&
      (!F.r || x.rs === F.r) &&
      (!F.t || x.rk <= +F.t),
  );
  const P = all.filter((x) => x.rs === "Passed").length,
    rg = reg(S, e);
  const exp = () =>
    csv(e.name.replace(/\W+/g, "-") + "-results.csv", [
      [
        "Rank",
        "Student ID",
        "Name",
        "School",
        "Class",
        "Total",
        "Obtained",
        "Percentage",
        "Correct",
        "Wrong",
        "Unattempted",
        "Result",
      ],
      ...all.map((x) => [
        x.rk,
        x.s,
        x.sn,
        x.ss,
        x.sc,
        x.tm,
        x.ob,
        x.pc.toFixed(1),
        x.c,
        x.w,
        x.un,
        x.rs,
      ]),
    ]);
  return (
    <>
      <Btn
        icon={ChevronLeft}
        style={{ marginBottom: 12 }}
        onClick={() => setSub(null)}
      >
        All exams
      </Btn>
      <Head
        t={e.name}
        p={`Class ${e.cls} · ${dm(e.date)} · Ranks use marks, then fewer wrong answers, then earlier student ID`}
      >
        <Btn icon={Download} onClick={exp}>
          Export Excel
        </Btn>
        <Btn icon={Printer} onClick={() => window.print()}>
          Export PDF
        </Btn>
        <Btn icon={Printer} onClick={() => window.print()}>
          Print
        </Btn>
      </Head>
      <Stats
        items={[
          ["Total Students", rg, "n"],
          ["Appeared", all.length, "c"],
          ["Absent", Math.max(0, rg - all.length), "o"],
          ["Passed", P, "g"],
          ["Failed", all.length - P, "p"],
          ["Highest Marks", all[0]?.ob ?? 0, "n"],
          [
            "Average Marks",
            all.length
              ? (all.reduce((t, x) => t + x.ob, 0) / all.length).toFixed(1)
              : 0,
            "c",
          ],
          [
            "Pass %",
            all.length ? ((P / all.length) * 100).toFixed(0) + "%" : "0%",
            "g",
          ],
        ]}
      />
      <Bar>
        <Search value={F.q} onChange={sf("q")} ph="Search student name or ID" />
        <Sel
          value={F.sc}
          onChange={sf("sc")}
          placeholder="All schools"
          list={[...new Set(all.map((x) => x.ss))]}
        />
        <Sel
          value={F.r}
          onChange={sf("r")}
          placeholder="Pass / Fail"
          list={["Passed", "Failed"]}
        />
        <Sel
          value={F.t}
          onChange={sf("t")}
          placeholder="All ranks"
          list={[
            [3, "Top 3"],
            [5, "Top 5"],
            [10, "Top 10"],
          ]}
        />
      </Bar>
      <Table
        rows={rows}
        cols={[
          { l: "Rank", k: "rk" },
          { l: "ID", k: "s" },
          { l: "Student", k: "sn", f: (x) => <b>{x.sn}</b> },
          { l: "School", k: "ss" },
          { l: "Class", k: "sc", f: (x) => x.sc + "th" },
          { l: "Total", k: "tm" },
          { l: "Obtained", k: "ob" },
          { l: "%", k: "pc", f: (x) => x.pc.toFixed(1) + "%" },
          { l: "Correct", k: "c" },
          { l: "Wrong", k: "w" },
          { l: "Unattempted", k: "un" },
          { l: "Result", k: "rs", f: (x) => <Badge s={x.rs} /> },
        ]}
        actions={(x) => [
          ["Individual Result", Eye, () => setM({ k: "rView", e: id, s: x.s })],
          [
            "Answer Analysis",
            FileText,
            () => setM({ k: "rView", e: id, s: x.s }),
          ],
          ["Download Result", Download, () => rDl(S, e, x)],
          [
            "Print Result",
            Printer,
            () => setM({ k: "rView", e: id, s: x.s, print: 1 }),
          ],
        ]}
      />
    </>
  );
}
const rDl = (S, e, x) =>
  csv(`${x.sn.replace(/\W+/g, "-")}-${e.name.replace(/\W+/g, "-")}.csv`, [
    ["Student", x.sn],
    ["Rank", x.rk],
    ["Obtained", x.ob + "/" + x.tm],
    ["Result", x.rs],
    [],
    ["#", "Question", "Correct Answer", "Outcome"],
    ...qw(S, e, x).map((l, i) => [
      i + 1,
      l.q?.q,
      l.q ? "ABCD"[l.q.c] : "",
      l.s,
    ]),
  ]);
function StudentResult({ C, eid, sid, print, onClose }) {
  const { S } = C,
    e = S.ex.find((z) => z.id === eid),
    x = res(S, e).find((z) => z.s === sid),
    L = qw(S, e, x);
  const doPrint = () => {
    document.body.classList.add("pm");
    window.print();
    document.body.classList.remove("pm");
  };
  useEffect(() => {
    if (print) setTimeout(doPrint, 200);
  }, []);
  const col = { C: "var(--g)", W: "var(--r)", U: "var(--t2)" },
    lab = { C: "Correct", W: "Wrong", U: "Unattempted" };
  return (
    <Modal
      title={"Result · " + x.sn}
      w={720}
      onClose={onClose}
      foot={
        <>
          <Btn icon={Download} onClick={() => rDl(S, e, x)}>
            Download
          </Btn>
          <Btn kind="pr" icon={Printer} onClick={doPrint}>
            Print
          </Btn>
        </>
      }
    >
      <div className="kv">
        <span>Exam</span>
        {e.name}
        <span>Rank</span>#{x.rk}
        <span>Marks</span>
        {x.ob}/{x.tm} ({x.pc.toFixed(1)}%)<span>Result</span>
        <Badge s={x.rs} />
        <span>Correct / Wrong / Unattempted</span>
        {x.c} / {x.w} / {x.un}
      </div>
      <div className="tw">
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Question</th>
              <th>Correct Ans</th>
              <th>Outcome</th>
            </tr>
          </thead>
          <tbody>
            {L.map((l, i) => (
              <tr key={i}>
                <td>{i + 1}</td>
                <td style={{ whiteSpace: "normal" }}>
                  {l.q ? l.q.q || "(image question)" : "(deleted)"}
                </td>
                <td>{l.q ? "ABCD"[l.q.c] : "—"}</td>
                <td style={{ color: col[l.s] }}>{lab[l.s]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Modal>
  );
}

/* ───────── Auth screens (demo only: credentials are checked in the browser) ───────── */
const AUTH_KEY = "pp_auth",
  DEMO = { email: "admin@prasanna.in", pass: "Admin@123" };
const getSession = () => {
  try {
    return localStorage.getItem(AUTH_KEY) || sessionStorage.getItem(AUTH_KEY);
  } catch (e) {
    return null;
  }
};
function Login({ onDone }) {
  const [f, setF] = useState({ email: "", pass: "", keep: true }),
    [er, setEr] = useState({}),
    [show, setShow] = useState(false),
    [busy, setBusy] = useState(false),
    [fail, setFail] = useState("");
  const submit = (ev) => {
    ev.preventDefault();
    setFail("");
    const e = chk([
      [
        "email",
        /^\S+@\S+\.\S+$/.test(f.email.trim()),
        "Enter a valid email address",
      ],
      ["pass", f.pass.length > 0, "Enter your password"],
    ]);
    setEr(e);
    if (Object.keys(e).length) return;
    setBusy(true);
    setTimeout(() => {
      setBusy(false);
      if (f.email.trim().toLowerCase() === DEMO.email && f.pass === DEMO.pass) {
        try {
          (f.keep ? localStorage : sessionStorage).setItem(
            AUTH_KEY,
            DEMO.email,
          );
        } catch (x) {}
        onDone();
      } else setFail("Email or password is incorrect.");
    }, 600);
  };
  return (
    <div className="auth">
      <div className="authL">
        <div className="brand">
          <div
            className="logo"
            style={{ background: "#fff", color: "var(--n)" }}
          >
            PP
          </div>
          <div>
            <b>Prasanna Publication</b>
            <small>Examination Management System</small>
          </div>
        </div>
        <div>
          <h1>Manage exams, questions, students and results in one place.</h1>
          <p>Sign in with your administrator account to continue.</p>
        </div>
        <small>© Prasanna Publication</small>
      </div>
      <div className="authR">
        <form className="authF" onSubmit={submit} noValidate>
          <h2>Sign in</h2>
          <p className="mut">Use your administrator credentials.</p>
          {fail && (
            <div className="alert" role="alert">
              {fail}
            </div>
          )}
          <Fld label="Email" err={er.email}>
            <input
              type="email"
              autoFocus
              autoComplete="username"
              className={er.email ? "bad" : ""}
              value={f.email}
              onChange={(e) => setF({ ...f, email: e.target.value })}
            />
          </Fld>
          <Fld label="Password" err={er.pass}>
            <div className="pw">
              <input
                type={show ? "text" : "password"}
                autoComplete="current-password"
                className={er.pass ? "bad" : ""}
                value={f.pass}
                onChange={(e) => setF({ ...f, pass: e.target.value })}
              />
              <button
                type="button"
                className="ib"
                aria-label={show ? "Hide password" : "Show password"}
                onClick={() => setShow(!show)}
              >
                {show ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </Fld>
          <label className="chk">
            <input
              type="checkbox"
              checked={f.keep}
              onChange={(e) => setF({ ...f, keep: e.target.checked })}
            />{" "}
            Keep me signed in
          </label>
          <button className="bt pr full" disabled={busy}>
            {busy ? "Signing in…" : "Sign in"}
          </button>
          <div className="hint">
            Demo login: {DEMO.email} / {DEMO.pass}
          </div>
          <div className="hint">
            Forgot your password? Contact the system owner.
          </div>
        </form>
      </div>
    </div>
  );
}
function LoggedOut({ onBack }) {
  return (
    <div className="auth one">
      <div className="authF center">
        <div className="okc">
          <Check size={28} />
        </div>
        <h2>You have been logged out</h2>
        <p className="mut">
          Your session has ended. Sign in again to continue managing
          examinations.
        </p>
        <button className="bt pr full" onClick={onBack}>
          Sign in again
        </button>
      </div>
    </div>
  );
}

/* ───────── App shell ───────── */
const TABS = [
  ["exam", "Exam", FileText, "Exams"],
  ["questions", "Questions", HelpCircle, "Question Bank"],
  ["students", "Students", Users, "Students"],
  ["results", "Results", BarChart3, "Results"],
];
export default function PrasannaDashboard() {
  const [S, setS] = useState(null),
    [tab, setTab] = useState("exam"),
    [sub, setSub] = useState(null),
    [m, setM] = useState(null),
    [cf, setCf] = useState(null);
  const [toasts, setToasts] = useState([]),
    [col, setCol] = useState(false),
    [open, setOpen] = useState(false);
  const [view, setView] = useState(() => (getSession() ? "app" : "login"));
  useEffect(() => {
    const t = setTimeout(() => setS(load()), 350);
    return () => clearTimeout(t);
  }, []);
  useEffect(() => {
    if (S)
      try {
        localStorage.setItem(KEY, JSON.stringify(S));
      } catch (e) {}
  }, [S]);
  const upd = (fn) =>
    setS((s) => {
      const n = JSON.parse(JSON.stringify(s));
      fn(n);
      return n;
    });
  const toast = (msg, t = "s") => {
    const id = Math.random();
    setToasts((x) => [...x, { id, msg, t }]);
    setTimeout(() => setToasts((x) => x.filter((y) => y.id !== id)), 3200);
  };
  const ask = (msg, fn, label) => setCf({ msg, fn, label });
  const C = { S, upd, toast, ask, setM, sub, setSub },
    close = () => setM(null);
  const go = (k) => {
    setTab(k);
    setSub(null);
    setOpen(false);
  };
  const logout = () => {
    try {
      localStorage.removeItem(AUTH_KEY);
      sessionStorage.removeItem(AUTH_KEY);
    } catch (e) {}
    setTab("exam");
    setSub(null);
    setM(null);
    setOpen(false);
    setView("out");
  };
  const cur = TABS.find((t) => t[0] === tab);
  if (view === "login") return <Login onDone={() => setView("app")} />;
  if (view === "out") return <LoggedOut onBack={() => setView("login")} />;
  return (
    <>
      <div id="app" className={(col ? "col " : "") + (open ? "op" : "")}>
        <div className="bk" onClick={() => setOpen(false)} />
        <aside>
          <div className="brand">
            <div className="logo">
              PP
              {/* Replace with <img src={logo} alt="Prasanna Publication" /> */}
            </div>
            <div className="lb">
              <b>Prasanna Publication</b>
              <small>Examination Management System</small>
            </div>
          </div>
          <nav>
            {TABS.map(([k, l, Ic]) => (
              <button
                key={k}
                className={"nv " + (tab === k ? "on" : "")}
                onClick={() => go(k)}
              >
                <Ic size={18} />
                <span className="lb">{l}</span>
              </button>
            ))}
          </nav>
          <div className="sp" />
          <button className="nv" onClick={() => setCol(!col)}>
            <PanelLeft size={18} />
            <span className="lb">Collapse</span>
          </button>
          <div className="me">
            <div className="av">AD</div>
            <div className="lb">
              <b>Admin</b>
              <br />
              <small style={{ color: "var(--t2)" }}>admin@prasanna.in</small>
            </div>
          </div>
          <button
            className="nv"
            onClick={() =>
              ask(
                "You will need to sign in again to access the dashboard.",
                logout,
                "Logout",
              )
            }
          >
            <LogOut size={18} />
            <span className="lb">Logout</span>
          </button>
        </aside>
        <div className="mainw">
          <header>
            <button
              className="ib mnu"
              onClick={() => setOpen(true)}
              aria-label="Menu"
            >
              <MenuIcon size={18} />
            </button>
            <div>
              <div className="bc">
                Prasanna Publication / {cur[3]}
                {sub ? " / Detail" : ""}
              </div>
              <h1>{cur[3]}</h1>
            </div>
            <div className="hs" />
            <span className="dt">
              {new Date().toLocaleDateString("en-IN", {
                weekday: "short",
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </span>
            <button
              className="ib"
              aria-label="Notifications"
              onClick={() => toast("No new notifications")}
            >
              <Bell size={18} />
            </button>
            <div
              className="av"
              onClick={() => toast("Profile: Admin")}
              style={{ cursor: "pointer" }}
            >
              AD
            </div>
          </header>
          <main id="main">
            {!S ? (
              <>
                <div className="sk" />
                <div className="sk" />
                <div className="sk" style={{ height: 240 }} />
              </>
            ) : tab === "exam" ? (
              <ExamsView C={C} />
            ) : tab === "questions" ? (
              <QuestionsView C={C} />
            ) : tab === "students" ? (
              <StudentsView C={C} />
            ) : (
              <ResultsView C={C} />
            )}
          </main>
        </div>
      </div>
      {S && m?.k === "exForm" && <ExamForm C={C} id={m.id} onClose={close} />}
      {S && m?.k === "exView" && <ExamView C={C} id={m.id} onClose={close} />}
      {S && m?.k === "qForm" && (
        <QuestionForm C={C} id={m.id} onClose={close} />
      )}
      {S && m?.k === "qView" && (
        <QuestionView C={C} id={m.id} onClose={close} />
      )}
      {S && m?.k === "bulk" && <BulkUpload C={C} onClose={close} />}
      {S && m?.k === "sForm" && <StudentForm C={C} id={m.id} onClose={close} />}
      {S && m?.k === "sView" && <StudentView C={C} id={m.id} onClose={close} />}
      {S && m?.k === "rView" && (
        <StudentResult
          C={C}
          eid={m.e}
          sid={m.s}
          print={m.print}
          onClose={close}
        />
      )}
      {cf && (
        <Confirm
          msg={cf.msg}
          label={cf.label}
          onNo={() => setCf(null)}
          onYes={() => {
            const f = cf.fn;
            setCf(null);
            f();
          }}
        />
      )}
      {createPortal(
        <div id="ts">
          {toasts.map((t) => (
            <div key={t.id} className={"ts " + t.t}>
              {t.msg}
            </div>
          ))}
        </div>,
        document.body,
      )}
    </>
  );
}
