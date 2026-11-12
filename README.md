# Prasanna Publication – Examination Management Dashboard

React (JSX) + Vite. Tabs: Exam, Questions, Students, Results.

## Run
    npm install
    npm run dev        # http://localhost:5173
    npm run build      # production build in dist/

## Notes
- Data is saved in browser localStorage (key `pp_v1`). To use a real backend, replace `load()` and `upd()` in `src/PrasannaDashboard.jsx`.
- Login (demo): admin@prasanna.in / Admin@123. Credentials are checked in the browser only, so replace `DEMO` and the submit handler in `Login` with a real API before going live.
- Logo: put your logo in `public/logo.png` and in the sidebar replace the "PP" box with `<img src="/logo.png" alt="Prasanna Publication" />`.
- Bulk upload accepts CSV (Excel: Save As CSV).
