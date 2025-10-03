import { create } from './tinyStore'

export type TopicMajor = 'Functions' | 'Calculus' | 'Probability'
export const SUB_TO_MAJOR: Record<string, TopicMajor> = {
  'Functions & Relations': 'Functions',
  'Polynomials': 'Functions',
  'Exponentials & Logs': 'Functions',
  'Circular Functions': 'Functions',
  'Differentiation': 'Calculus',
  'Applications of Diff': 'Calculus',
  'Integration': 'Calculus',
  'Probability': 'Probability',
  'Statistics': 'Probability',
}

export interface Subject { id: string; name: string; taxonomy: { major: TopicMajor, subs: string[] }[] }
export interface Exam { id: string; subjectId: string; title: string; provider?: string; date?: string; notes?: string }
export interface Page { id: string; examId: string; ref: string; order?: number }
export interface Question {
  id: string; examId: string; pageId: string; qNumber: number; section: 'A'|'B';
  topicMajor: TopicMajor; topicSub?: string; maxMarks: number; awardedMarks: number; correct: boolean;
  shortPrompt: string; errors?: string[]; confidence?: number; timeMinutes?: number; ref?: string;
}
export interface Subsection { id: string; examId: string; name: string }
export interface ManualScore { id: string; examId: string; subsectionId?: string; label?: string; percentage: number; notes?: string; createdAt: string }

type State = {
  theme: 'light'|'dark'
  subjects: Subject[]; exams: Exam[]; pages: Page[]; questions: Question[]; subsections: Subsection[]; manualScores: ManualScore[]
  toggleTheme: () => void
  addSubject: (s: Omit<Subject,'id'>) => string
  addExam: (e: Omit<Exam,'id'>) => string
  addPage: (p: Omit<Page,'id'>) => string
  addQuestions: (qs: Omit<Question,'id'>[]) => void
  addSubsection: (s: Omit<Subsection,'id'>) => string
  addManualScore: (m: Omit<ManualScore,'id'|'createdAt'>) => void
  seedIfEmpty: () => void
  exportAll: () => string
  importAll: (raw: string) => void
}

const STORAGE_KEY = 'exam-tracker-full-state-v1'
function load(){ try{ const raw = localStorage.getItem(STORAGE_KEY); return raw?JSON.parse(raw):null } catch{ return null } }
function save(data:any){ localStorage.setItem(STORAGE_KEY, JSON.stringify(data)) }

export const useStore = create<State>((set,get)=>({
  theme: (load()?.theme ?? 'light'),
  subjects: (load()?.subjects ?? []),
  exams: (load()?.exams ?? []),
  pages: (load()?.pages ?? []),
  questions: (load()?.questions ?? []),
  subsections: (load()?.subsections ?? []),
  manualScores: (load()?.manualScores ?? []),

  toggleTheme: () => { const next = get().theme==='dark'?'light':'dark'; const s={...get(),theme:next}; set(s); save(s) },
  addSubject: (s) => { const o={id:crypto.randomUUID(),...s}; const n={...get(),subjects:[...get().subjects,o]}; set(n); save(n); return o.id },
  addExam: (e) => { const o={id:crypto.randomUUID(),...e}; const n={...get(),exams:[...get().exams,o]}; set(n); save(n); return o.id },
  addPage: (p) => { const o={id:crypto.randomUUID(),...p}; const n={...get(),pages:[...get().pages,o]}; set(n); save(n); return o.id },
  addQuestions: (qs) => { const list = qs.map(q=>({id:crypto.randomUUID(),...q})); const n={...get(),questions:[...get().questions,...list]}; set(n); save(n) },
  addSubsection: (s) => { const o={id:crypto.randomUUID(),...s}; const n={...get(),subsections:[...get().subsections,o]}; set(n); save(n); return o.id },
  addManualScore: (m) => { const o={id:crypto.randomUUID(),createdAt:new Date().toISOString(),...m}; const n={...get(),manualScores:[...get().manualScores,o]}; set(n); save(n) },

  seedIfEmpty: () => {
    if (get().subjects.length) return
    const subj = get().addSubject({
      name: 'Methods',
      taxonomy: [
        { major: 'Functions', subs: ['Functions & Relations','Polynomials','Exponentials & Logs','Circular Functions'] },
        { major: 'Calculus', subs: ['Differentiation','Applications of Diff','Integration'] },
        { major: 'Probability', subs: ['Probability','Statistics'] },
      ]
    })
    const ex = get().addExam({ subjectId: subj, title: 'Sample Exam', provider: 'Sample', date: '2025-10-01' })
    const p1 = get().addPage({ examId: ex, ref: 'page1', order: 1 })
    get().addQuestions([{
      examId: ex, pageId: p1, qNumber: 1, section: 'A', topicMajor: 'Functions', topicSub: 'Polynomials',
      maxMarks: 2, awardedMarks: 2, correct: true, shortPrompt: 'factorise cubic', errors: [], confidence: 4, timeMinutes: 2, ref: 'page1'
    }])
    const s1 = get().addSubsection({ examId: ex, name: 'Section A' })
    get().addManualScore({ examId: ex, subsectionId: s1, label: 'Reported A', percentage: 85 })
    get().addManualScore({ examId: ex, label: 'Reported Overall', percentage: 78 })
  },

  exportAll: () => JSON.stringify({
    theme:get().theme, subjects:get().subjects, exams:get().exams, pages:get().pages,
    questions:get().questions, subsections:get().subsections, manualScores:get().manualScores
  }, null, 2),

  importAll: (raw) => {
    try {
      const data = JSON.parse(raw)
      const s = {
        theme: data.theme ?? 'light',
        subjects: data.subjects ?? [],
        exams: data.exams ?? [],
        pages: data.pages ?? [],
        questions: data.questions ?? [],
        subsections: data.subsections ?? [],
        manualScores: data.manualScores ?? [],
      }
      set(s); save(s)
    } catch { alert('Invalid JSON') }
  }
}))

export function questionsForExam(state: ReturnType<typeof useStore>, examId: string){
  return state.questions.filter(q => q.examId === examId)
}
export function pagesForExam(state: ReturnType<typeof useStore>, examId: string){
  return state.pages.filter(p => p.examId === examId).sort((a,b)=>(a.order??0)-(b.order??0))
}
export function subsectionsForExam(state: ReturnType<typeof useStore>, examId: string){
  return state.subsections.filter(s => s.examId === examId)
}
export function manualScoresForExam(state: ReturnType<typeof useStore>, examId: string){
  return state.manualScores.filter(s => s.examId === examId).sort((a,b)=>a.createdAt.localeCompare(b.createdAt))
}

export function totals(qs: Question[]){
  const max = qs.reduce((a,b)=>a+b.maxMarks,0)
  const got = qs.reduce((a,b)=>a+b.awardedMarks,0)
  const pct = max ? (got/max)*100 : 0
  const time = qs.reduce((a,b)=>a+(b.timeMinutes||0),0)
  const confAvg = qs.length ? (qs.reduce((a,b)=>a+(b.confidence||0),0)/qs.length) : 0
  return { max, got, pct, time, confAvg }
}
export function pctByMajor(qs: Question[], major: TopicMajor){
  const inM = qs.filter(q => q.topicMajor === major)
  const t = totals(inM); return t.pct
}

const LINE_RX = /^Q(?<num>\d+)\s*\|\s*(?<topicMajor>[^>|]+?)\s*>\s*(?<topicSub>[^|]*)\|\s*(?<marks>\d+)\s*\/\s*(?<awarded>\d+)\s*\|\s*(?<correct>correct|wrong)\s*\|\s*"(?<prompt>[^"]+)"\s*\|\s*(?:error:\s*(?<errors>[^|]+)\s*\|\s*)?conf:(?<conf>[1-5])\s*\|\s*time:(?<time>\d*)\s*\|\s*ref:\s*(?<ref>.+)$/i
export function parseLinesToQuestions(lines:string[], examId:string, pageId:string, defaultSection:'A'|'B'='A'): Omit<Question,'id'>[]{
  const out: Omit<Question,'id'>[] = []
  for (const raw of lines){
    const line = raw.trim(); if (!line) continue
    const m = line.match(LINE_RX) as any; if (!m || !m.groups) continue
    const tMajor = m.groups.topicMajor.trim()
    const topicSub = (m.groups.topicSub || '').trim() || undefined
    const major = (['Functions','Calculus','Probability'] as TopicMajor[]).includes(tMajor as TopicMajor)
      ? (tMajor as TopicMajor)
      : (topicSub && SUB_TO_MAJOR[topicSub]) || 'Functions'
    const maxMarks = Number(m.groups.marks)
    const awardedMarks = Number(m.groups.awarded)
    const correct = m.groups.correct.toLowerCase() === 'correct'
    const errRaw = (m.groups.errors || '').trim()
    const errors = errRaw ? errRaw.split('/').map((s:string)=>s.trim()) : []
    out.push({
      examId, pageId,
      qNumber: Number(m.groups.num), section: defaultSection,
      topicMajor: major, topicSub,
      maxMarks, awardedMarks, correct,
      shortPrompt: m.groups.prompt.trim(), errors,
      confidence: Number(m.groups.conf),
      timeMinutes: m.groups.time ? Number(m.groups.time) : undefined,
      ref: m.groups.ref.trim(),
    })
  }
  return out
}
