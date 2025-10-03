import { useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useStore, questionsForExam, pagesForExam, totals, pctByMajor, parseLinesToQuestions, subsectionsForExam, manualScoresForExam } from '../store'
import { KPI, Progress } from '../components/KPI'

export default function ExamDetail() {
  const { id } = useParams()
  const store = useStore()
  const exam = store.exams.find(e => e.id === id)
  const pages = pagesForExam(store, id!)
  const qs = questionsForExam(store, id!)
  const subs = subsectionsForExam(store, id!)
  const reported = manualScoresForExam(store, id!)

  const t = useMemo(()=>totals(qs), [qs])
  const fPct = useMemo(()=>pctByMajor(qs,'Functions'), [qs])
  const cPct = useMemo(()=>pctByMajor(qs,'Calculus'), [qs])
  const pPct = useMemo(()=>pctByMajor(qs,'Probability'), [qs])

  const [newPageRef, setNewPageRef] = useState('page' + (pages.length + 1))
  const [defaultSection, setDefaultSection] = useState<'A'|'B'>('A')
  const [pageForPaste, setPageForPaste] = useState(pages[0]?.id || '')
  const [paste, setPaste] = useState('')

  const [subName, setSubName] = useState('Section A')
  const [msLabel, setMsLabel] = useState('Reported Overall')
  const [msPct, setMsPct] = useState('')

  if (!exam) return <div className="card">Exam not found.</div>

  function addPage() {
    if (!newPageRef.trim()) return
    const pid = store.addPage({ examId: exam.id, ref: newPageRef.trim(), order: (pages.length+1) })
    setPageForPaste(pid)
    setNewPageRef('page' + (pages.length + 2))
  }
  function doPaste() {
    if (!pageForPaste) return
    const lines = paste.split('\n')
    const p = parseLinesToQuestions(lines, exam.id, pageForPaste, defaultSection)
    if (p.length) { store.addQuestions(p); setPaste('') }
  }
  function addSubsection() {
    if (!subName.trim()) return
    store.addSubsection({ examId: exam.id, name: subName.trim() })
    setSubName('')
  }
  function addManualScore() {
    const pct = Number(msPct)
    if (isNaN(pct) || pct < 0 || pct > 100) { alert('Enter 0..100'); return }
    store.addManualScore({ examId: exam.id, percentage: pct, label: msLabel || undefined })
    setMsPct('')
  }

  return (
    <div>
      <div className="card">
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
          <div>
            <div style={{fontWeight:800, fontSize:18}}>{exam.title}</div>
            <div className="small">{exam.provider || '—'} • {exam.date || 'undated'}</div>
          </div>
          <div className="kpis">
            <KPI label="Total" value={t.pct.toFixed(1)+'%'} />
            <KPI label="Functions" value={fPct.toFixed(1)+'%'} />
            <KPI label="Calculus" value={cPct.toFixed(1)+'%'} />
            <KPI label="Probability" value={pPct.toFixed(1)+'%'} />
            <KPI label="Time (min)" value={String(t.time)} />
            <KPI label="Avg conf" value={t.confAvg.toFixed(2)} />
          </div>
        </div>
        <div style={{marginTop:8}}><Progress pct={t.pct} /></div>
      </div>

      <div className="card">
        <div className="row"><b>Pages</b></div>
        <div className="grid" style={{gridTemplateColumns:'1fr 140px 120px'}}>
          <input className="input" value={newPageRef} onChange={e=>setNewPageRef(e.target.value)} placeholder="page1" />
          <button className="btn" onClick={addPage}>Add Page</button>
          <select className="select" value={pageForPaste} onChange={e=>setPageForPaste(e.target.value)}>
            <option value="">Attach to page…</option>
            {pages.map(p => <option key={p.id} value={p.id}>{p.ref}</option>)}
          </select>
        </div>
        <div className="grid" style={{gridTemplateColumns:'1fr 120px 140px', marginTop:8}}>
          <textarea className="textarea" placeholder='Paste lines here…' value={paste} onChange={e=>setPaste(e.target.value)} />
          <select className="select" value={defaultSection} onChange={e=>setDefaultSection(e.target.value as 'A'|'B')}>
            <option value="A">Section A</option>
            <option value="B">Section B</option>
          </select>
          <button className="btn" onClick={doPaste}>Parse & Add</button>
        </div>
      </div>

      {pages.map(p => (
        <div className="card" key={p.id}>
          <div className="row">
            <div style={{fontWeight:700}}>{p.ref}</div>
            <div className="small">Page ID: {p.id.slice(0,8)}</div>
          </div>
          <table className="table">
            <thead>
              <tr>
                <th>Q#</th><th>Section</th><th>Topic</th><th>max/awarded</th><th>Correct</th><th>Prompt</th><th>Errors</th><th>Conf</th><th>Time</th><th>Ref</th>
              </tr>
            </thead>
            <tbody>
              {qs.filter(q => q.pageId === p.id).sort((a,b)=>a.qNumber-b.qNumber).map(q => (
                <tr key={q.id}>
                  <td>{q.qNumber}</td>
                  <td>{q.section}</td>
                  <td>{q.topicMajor}{q.topicSub ? ' > ' + q.topicSub : ''}</td>
                  <td>{q.maxMarks}/{q.awardedMarks}</td>
                  <td>{q.correct ? 'correct' : 'wrong'}</td>
                  <td>{q.shortPrompt}</td>
                  <td>{(q.errors||[]).join('/')}</td>
                  <td>{q.confidence ?? ''}</td>
                  <td>{q.timeMinutes ?? ''}</td>
                  <td>{q.ref}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}

      <div className="card">
        <div className="row"><b>Manual Subsections & Reported Scores</b></div>
        <div className="grid" style={{gridTemplateColumns:'1fr 120px'}}>
          <input className="input" placeholder="Add subsection (e.g., Section A)" value={subName} onChange={e=>setSubName(e.target.value)} />
          <button className="btn" onClick={addSubsection}>Add Subsection</button>
        </div>
        <div className="separator" />
        <div className="grid" style={{gridTemplateColumns:'1fr 160px 120px'}}>
          <input className="input" placeholder="Label (e.g., Reported Overall or Section A)" value={msLabel} onChange={e=>setMsLabel(e.target.value)} />
          <input className="input" placeholder="% (0..100)" value={msPct} onChange={e=>setMsPct(e.target.value)} />
          <button className="btn" onClick={addManualScore}>Add %</button>
        </div>
        <div className="small" style={{marginTop:6}}>Tip: Add overall and per-subsection manual percentages for this exam.</div>
        <div className="separator" />
        {subs.length > 0 && (
          <div style={{marginTop:4}}>
            <b>Subsections:</b> {subs.map(s => <span key={s.id} className="badge" style={{marginRight:6}}>{s.name}</span>)}
          </div>
        )}
        <div style={{marginTop:8}}>
          <b>Reported Scores:</b>
          <table className="table">
            <thead><tr><th>When</th><th>Label</th><th>%</th></tr></thead>
            <tbody>
              {reported.map(r => (
                <tr key={r.id}><td>{new Date(r.createdAt).toLocaleString()}</td><td>{r.label || '—'}</td><td>{r.percentage}%</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
