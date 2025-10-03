import { useSyncExternalStore } from 'react'
type Listener = () => void
export function create<T>(init: (set:(v:Partial<T>)=>void, get:()=>T)=>T) {
  let state = {} as T
  const listeners = new Set<Listener>()
  const set = (update: Partial<T>) => { state = { ...state, ...update }; listeners.forEach(l=>l()) }
  const get = () => state
  state = init(set, get)
  const subscribe = (l:Listener) => { listeners.add(l); return () => listeners.delete(l) }
  const useStore = () => useSyncExternalStore(subscribe, () => state, () => state)
  return useStore as unknown as (()=>T)
}
