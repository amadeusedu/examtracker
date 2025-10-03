export function KPI({label, value}:{label:string, value:string}) {
  return <div className="kpi"><b>{label}</b>&nbsp;{value}</div>
}
export function Progress({pct}:{pct:number}){
  return <div className="progress"><div style={{width: `${Math.max(0, Math.min(100, pct)).toFixed(1)}%`}}/></div>
}
