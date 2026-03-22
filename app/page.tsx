'use client'

import { useEffect, useState } from 'react'

type Client = {
  id: string
  company_name: string
  country: string
  entity_type: string
}

type Task = {
  id: string
  client_id: string
  title: string
  description: string
  category: string
  due_date: string
  status: 'Pending' | 'In Progress' | 'Completed'
  priority: 'Low' | 'Medium' | 'High'
}

const CATEGORIES = ['Tax', 'Reporting', 'Audit', 'Legal', 'HR', 'Other']
const STATUSES = ['Pending', 'In Progress', 'Completed'] as const

function isOverdue(task: Task) {
  return task.status !== 'Completed' && new Date(task.due_date) < new Date()
}

export default function Home() {
  const [clients, setClients] = useState<Client[]>([])
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [tasks, setTasks] = useState<Task[]>([])
  const [filterStatus, setFilterStatus] = useState('All')
  const [filterCategory, setFilterCategory] = useState('All')
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(false)

  const [form, setForm] = useState({
    title: '', description: '', category: 'Tax',
    due_date: '', priority: 'Medium'
  })

  useEffect(() => {
    fetch('/api/clients').then(r => r.json()).then(setClients)
  }, [])

  useEffect(() => {
    if (!selectedClient) return
    setLoading(true)
    const params = new URLSearchParams({ client_id: selectedClient.id })
    if (filterStatus !== 'All') params.set('status', filterStatus)
    if (filterCategory !== 'All') params.set('category', filterCategory)
    fetch(`/api/tasks?${params}`).then(r => r.json()).then(data => {
      setTasks(data)
      setLoading(false)
    })
  }, [selectedClient, filterStatus, filterCategory])

  const handleAddTask = async () => {
    if (!form.title || !form.due_date || !selectedClient) return
    const res = await fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, client_id: selectedClient.id })
    })
    const newTask = await res.json()
    setTasks(prev => [...prev, newTask])
    setForm({ title: '', description: '', category: 'Tax', due_date: '', priority: 'Medium' })
    setShowForm(false)
  }

  const handleStatusChange = async (taskId: string, status: string) => {
    const res = await fetch(`/api/tasks/${taskId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    })
    const updated = await res.json()
    setTasks(prev => prev.map(t => t.id === taskId ? updated : t))
  }

  const filteredTasks = tasks.filter(t =>
    t.title.toLowerCase().includes(search.toLowerCase()) ||
    t.category.toLowerCase().includes(search.toLowerCase())
  )

  const stats = {
    total: tasks.length,
    pending: tasks.filter(t => t.status === 'Pending').length,
    completed: tasks.filter(t => t.status === 'Completed').length,
    overdue: tasks.filter(isOverdue).length
  }

  const priorityColor = { Low: '#6b7280', Medium: '#f59e0b', High: '#ef4444' }

  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: 'Inter, sans-serif', background: '#f8fafc' }}>
      {/* Sidebar */}
      <aside style={{ width: 260, background: '#1e293b', color: '#fff', padding: '24px 16px', overflowY: 'auto' }}>
        <h1 style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>⚖️ LedgersCFO</h1>
        <p style={{ fontSize: 12, color: '#94a3b8', marginBottom: 24 }}>Compliance Tracker</p>
        <p style={{ fontSize: 11, fontWeight: 600, color: '#64748b', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1 }}>Clients</p>
        {clients.map(c => (
          <div key={c.id} onClick={() => { setSelectedClient(c); setShowForm(false) }}
            style={{
              padding: '10px 12px', borderRadius: 8, cursor: 'pointer', marginBottom: 4,
              background: selectedClient?.id === c.id ? '#3b82f6' : 'transparent',
              transition: 'background 0.15s'
            }}>
            <div style={{ fontWeight: 600, fontSize: 14 }}>{c.company_name}</div>
            <div style={{ fontSize: 11, color: selectedClient?.id === c.id ? '#bfdbfe' : '#94a3b8' }}>{c.country} · {c.entity_type}</div>
          </div>
        ))}
      </aside>

      {/* Main */}
      <main style={{ flex: 1, padding: 32, overflowY: 'auto' }}>
        {!selectedClient ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#94a3b8' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>👈</div>
            <p style={{ fontSize: 18 }}>Select a client to view their tasks</p>
          </div>
        ) : (
          <>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <div>
                <h2 style={{ fontSize: 24, fontWeight: 700, color: '#1e293b' }}>{selectedClient.company_name}</h2>
                <p style={{ color: '#64748b', fontSize: 14 }}>{selectedClient.country} · {selectedClient.entity_type}</p>
              </div>
              <button onClick={() => setShowForm(!showForm)}
                style={{ background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 20px', cursor: 'pointer', fontWeight: 600, fontSize: 14 }}>
                {showForm ? '✕ Cancel' : '+ Add Task'}
              </button>
            </div>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
              {[
                { label: 'Total', value: stats.total, color: '#6366f1' },
                { label: 'Pending', value: stats.pending, color: '#f59e0b' },
                { label: 'Completed', value: stats.completed, color: '#10b981' },
                { label: 'Overdue', value: stats.overdue, color: '#ef4444' },
              ].map(s => (
                <div key={s.label} style={{ background: '#fff', borderRadius: 12, padding: '16px 20px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', borderLeft: `4px solid ${s.color}` }}>
                  <div style={{ fontSize: 28, fontWeight: 700, color: s.color }}>{s.value}</div>
                  <div style={{ fontSize: 13, color: '#64748b' }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* Add Task Form */}
            {showForm && (
              <div style={{ background: '#fff', borderRadius: 12, padding: 24, marginBottom: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
                <h3 style={{ marginBottom: 16, fontWeight: 600, color: '#1e293b' }}>New Task</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <input placeholder="Title *" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
                    style={inputStyle} />
                  <input placeholder="Description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
                    style={inputStyle} />
                  <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} style={inputStyle}>
                    {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                  <input type="date" value={form.due_date} onChange={e => setForm({ ...form, due_date: e.target.value })}
                    style={inputStyle} />
                  <select value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })} style={inputStyle}>
                    <option>Low</option><option>Medium</option><option>High</option>
                  </select>
                  <button onClick={handleAddTask}
                    style={{ background: '#10b981', color: '#fff', border: 'none', borderRadius: 8, padding: '10px', cursor: 'pointer', fontWeight: 600 }}>
                    ✓ Create Task
                  </button>
                </div>
              </div>
            )}

            {/* Filters */}
            <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
              <input placeholder="🔍 Search tasks..." value={search} onChange={e => setSearch(e.target.value)}
                style={{ ...inputStyle, flex: 1, minWidth: 200 }} />
              <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={inputStyle}>
                <option>All</option>
                {STATUSES.map(s => <option key={s}>{s}</option>)}
              </select>
              <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)} style={inputStyle}>
                <option>All</option>
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>

            {/* Task List */}
            {loading ? (
              <p style={{ color: '#94a3b8', textAlign: 'center', paddingTop: 40 }}>Loading tasks...</p>
            ) : filteredTasks.length === 0 ? (
              <p style={{ color: '#94a3b8', textAlign: 'center', paddingTop: 40 }}>No tasks found.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {filteredTasks.map(task => {
                  const overdue = isOverdue(task)
                  return (
                    <div key={task.id} style={{
                      background: overdue ? '#fff7ed' : '#fff',
                      border: overdue ? '1.5px solid #fb923c' : '1px solid #e2e8f0',
                      borderRadius: 12, padding: '16px 20px',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                      display: 'flex', alignItems: 'center', gap: 16
                    }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                          <span style={{ fontWeight: 600, color: '#1e293b', fontSize: 15 }}>{task.title}</span>
                          {overdue && <span style={{ fontSize: 11, background: '#fef2f2', color: '#ef4444', border: '1px solid #fca5a5', borderRadius: 99, padding: '2px 8px', fontWeight: 700 }}>OVERDUE</span>}
                        </div>
                        {task.description && <p style={{ fontSize: 13, color: '#64748b', marginBottom: 6 }}>{task.description}</p>}
                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                          <Tag color="#e0e7ff" text={`📁 ${task.category}`} />
                          <Tag color="#f0fdf4" text={`📅 ${task.due_date}`} />
                          <Tag color={task.priority === 'High' ? '#fef2f2' : task.priority === 'Medium' ? '#fffbeb' : '#f0fdf4'}
                            text={`⚡ ${task.priority}`} textColor={(priorityColor as any)[task.priority]} />
                        </div>
                      </div>
                      <select value={task.status} onChange={e => handleStatusChange(task.id, e.target.value)}
                        style={{
                          border: '1.5px solid #e2e8f0', borderRadius: 8, padding: '6px 12px', fontSize: 13,
                          background: task.status === 'Completed' ? '#f0fdf4' : task.status === 'In Progress' ? '#fffbeb' : '#fff',
                          fontWeight: 600, color: task.status === 'Completed' ? '#16a34a' : task.status === 'In Progress' ? '#d97706' : '#64748b',
                          cursor: 'pointer'
                        }}>
                        {STATUSES.map(s => <option key={s}>{s}</option>)}
                      </select>
                    </div>
                  )
                })}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}

const inputStyle: React.CSSProperties = {
  padding: '10px 14px', border: '1px solid #e2e8f0', borderRadius: 8,
  fontSize: 14, outline: 'none', background: '#fff', color: '#1e293b', width: '100%', boxSizing: 'border-box'
}

function Tag({ color, text, textColor = '#374151' }: { color: string; text: string; textColor?: string }) {
  return (
    <span style={{ fontSize: 12, background: color, color: textColor, borderRadius: 99, padding: '2px 10px', fontWeight: 500 }}>
      {text}
    </span>
  )
}