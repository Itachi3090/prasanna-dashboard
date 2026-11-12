# Prassanna Publication – Online Exam Platform (React + Vite, JSX)
    npm install && npm run dev      # login: STU001 / demo123

## Architecture
- `src/data/sampleExam.js` – the exam JSON contract the Admin Dashboard should produce: `sections`, `groups` (shared passage/table/diagram, stored once), `questions` (`stem` + `options` made of typed **blocks**).
- `src/components/Blocks.jsx` – block registry (`text`, `math` via KaTeX, `image` with zoom, `table`). New content type = one registry entry. Options are blocks too, so image options just work.
- `src/components/Exam.jsx` – one generic screen: shared group + current question, palette, section tabs, timer from persisted `startedAt` (refresh-safe), auto-save, submit modal.
- `src/lib/api.js` – localStorage mock. Replace with REST calls to the shared DB.

## Before production (not implemented here)
Server-side timer/time offset, server-side grading (never ship `correct` to the client), real auth/OTP, offline save queue, Admin Dashboard question/passage/table editors, PDF export beyond browser print, role-based access, exam-window enforcement.
Login: STU001 / demo123 (or mobile 9999999999). Registration and reset are demo-only (in memory).
