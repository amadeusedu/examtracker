import { Link } from 'react-router-dom'
import { useStore, totals } from '../store'

export default function ExamsList() {
  const store = useStore()
  return (
    <div>
      <div className="card"><b>All Exams</b></div>
      {store.exams.map(ex => {
        const qs = store.questions.filter(q => q.examId === ex.id)
        const t = totals(qs)
        return (
          <div key={ex.id} className="card">
            <div className="row">
              <div>
                <div style={{fontWeight:700}}>{ex.title}</div>
                <div className="small">{ex.provider || '—'} • {ex.date || 'undated'}</div>
              </div>
              <div style={{display:'flex', alignItems:'center', gap:10}}>
                <div className="badge">{t.pct.toFixed(1)}%</div>
                <Link to={`/exam/${ex.id}`} className="btn">Open</Link>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
