import { useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { KPI, Progress } from '../components/KPI'
import { useStore, totals, pctByMajor } from '../store'

export default function Dashboard() {
  const store = useStore()
  const allQs = store.questions
  const agg = useMemo(()=>totals(allQs), [allQs])
  const fPct = useMemo(()=>pctByMajor(allQs, 'Functions'), [allQs])
  const cPct = useMemo(()=>pctByMajor(allQs, 'Calculus'), [allQs])
  const pPct = useMemo(()=>pctByMajor(allQs, 'Probability'), [allQs])

  const fileRef = useRef<HTMLInputElement>(null)
  const [addExamTitle, setAddExamTitle] = useState('')

  function onExport(){
    const blob = new Blob([store.exportAll()], {type:'application/json'})
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = 'exam-tracker-data.json'; a.click(); URL.revokeObjectURL(url)
  }
  function onImport(e: React.ChangeEvent<HTMLInputElement>){
    const f = e.target.files?.[0]; if (!f) return
    const fr = new FileReader(); fr.onload = () => store.importAll(String(fr.result||'')); fr.readAsText(f)
  }
  function addExam(){
    if (!addExamTitle.trim()) return
    store.addExam({ subjectId: store.subjects[0]?.id || 'subject-1', title: addExamTitle.trim() })
    setAddExamTitle('')
  }

  return (
    <div>
      <div className="card">
        <div className="kpis">
          <KPI label="Total" value={agg.pct.toFixed(1) + '%'} />
          <KPI label="Functions" value={fPct.toFixed(1) + '%'} />
          <KPI label="Calculus" value={cPct.toFixed(1) + '%'} />
          <KPI label="Probability" value={pPct.toFixed(1) + '%'} />
          <KPI label="Questions" value={String(store.questions.length)} />
          <KPI label="Time (min)" value={String(agg.time)} />
          <KPI label="Avg conf" value={agg.confAvg.toFixed(2)} />
        </div>
        <div style={{marginTop:8}}>
          <div className="small">Overall accuracy</div>
          <Progress pct={agg.pct} />
        </div>
      </div>

      <div className="card">
        <div className="row"><b>Quick actions</b></div>
        <div className="grid" style={{gridTemplateColumns:'1fr 120px 120px'}}>
          <input className="input" placeholder="Add exam (e.g., NEAP 2024)" value={addExamTitle} onChange={e=>setAddExamTitle(e.target.value)} />
          <button className="btn" onClick={addExam}>Add Exam</button>
          <Link to="/exams" className="btn secondary" style={{textAlign:'center'}}>Manage Exams</Link>
        </div>
        <div className="flex" style={{marginTop:10}}>
          <button className="btn secondary" onClick={onExport}>Export JSON</button>
          <input ref={fileRef} type="file" accept="application/json" style={{display:'none'}} onChange={onImport} />
          <button className="btn secondary" onClick={()=>fileRef.current?.click()}>Import JSON</button>
        </div>
      </div>

      <div className="card">
        <div className="row"><b>Exams</b><span className="small">Click a card to view details</span></div>
        <div className="flex">
          {store.exams.map(ex => {
            const qs = store.questions.filter(q => q.examId === ex.id)
            const t = totals(qs)
            return (
              <div key={ex.id} className="card" style={{minWidth:260}}>
                <div style={{fontWeight:700}}>{ex.title}</div>
                <div className="small">{ex.provider || '—'} • {ex.date || 'undated'}</div>
                <div style={{marginTop:8}}><Progress pct={t.pct} /></div>
                <div className="flex" style={{justifyContent:'space-between', marginTop:8}}>
                  <span className="badge">{t.pct.toFixed(1)}%</span>
                  <Link to={`/exam/${ex.id}`} className="btn">Open</Link>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
