import { Link, Outlet, useLocation } from "react-router-dom";
import { useEffect } from "react";

export default function App() {
  useEffect(() => {
    // keep it simple; theme toggle can be added later if you want
    document.title = "Exam Tracker";
  }, []);

  const loc = useLocation();
  return (
    <div className="app-shell">
      <div className="header">
        <div className="brand">{loc.pathname === "/" ? "Overall" : "Exam Tracker"}</div>
        <div style={{ display: "flex", gap: 8 }}>
          <Link className="btn secondary" to="/">Overall</Link>
          <Link className="btn secondary" to="/exams">Exams</Link>
        </div>
      </div>
      <Outlet />
    </div>
  );
}
