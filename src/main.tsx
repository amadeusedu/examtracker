import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import App from './App'
import Dashboard from './pages/Dashboard'
import ExamsList from './pages/ExamsList'
import ExamDetail from './pages/ExamDetail'
import './styles.css'

const router = createBrowserRouter([
  { path: '/', element: <App />, children: [
    { index: true, element: <Dashboard /> },
    { path: 'exams', element: <ExamsList /> },
    { path: 'exam/:id', element: <ExamDetail /> },
  ]}
])

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
)

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(console.error);
  });
}
