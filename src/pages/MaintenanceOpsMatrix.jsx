import React, { useState, useEffect } from 'react'
import { maintenanceService } from '../services/maintenanceService.js'

const MaintenanceOpsMatrix = () => {
  const [isLogModalOpen, setIsLogModalOpen] = useState(false)
  const [tickets, setTickets] = useState([])
  const [downtime, setDowntime] = useState([])
  const [pfiStatus, setPfiStatus] = useState({ pendingApproval: 3, issuedMTD: 12, totalEstCost: '4.2M' })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  const [form, setForm] = useState({
    equipment: '',
    issue: '',
    priority: 'Routine Maintenance',
    estHours: '',
  })

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      setError(null)
      try {
        const [ticketsData, downtimeData, pfiData] = await Promise.all([
          maintenanceService.getTickets(),
          maintenanceService.getDowntimeProjection(),
          maintenanceService.getPFIStatus(),
        ])
        setTickets(ticketsData)
        setDowntime(downtimeData)
        setPfiStatus(pfiData)
      } catch (err) {
        setError(err.message || 'Failed to load maintenance data.')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const updateField = (event) => {
    setForm({ ...form, [event.target.name]: event.target.value })
  }

  const handleLogRepair = async (event) => {
    event.preventDefault()
    setSubmitting(true)
    setError(null)
    try {
      const newTicket = await maintenanceService.logRepairTicket({
        equipment: form.equipment,
        issue: form.issue,
        priority: form.priority,
        estFixHours: form.estHours,
      })
      if (newTicket) {
        setTickets((prev) => {
          const exists = prev.some((t) => t.id === newTicket.id)
          return exists ? prev : [newTicket, ...prev]
        })
      }
      setForm({ equipment: '', issue: '', priority: 'Routine Maintenance', estHours: '' })
      setIsLogModalOpen(false)
    } catch (err) {
      setError(err.message || 'Failed to log repair ticket.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="maintenance-page">
        <header className="maintenance-header">
          <div><h1>Maintenance Ops Matrix</h1><p>Real-time equipment telemetry and repair routing.</p></div>
          <button className="primary-button log-repair-button" type="button" onClick={() => setIsLogModalOpen(true)}>+ Log New Repair</button>
        </header>
        <div style={{ padding: '3rem', textAlign: 'center', color: '#999' }}>
          Loading maintenance data...
        </div>
      </div>
    )
  }

  return (
    <div className="maintenance-page">
      <header className="maintenance-header">
        <div>
          <h1>Maintenance Ops Matrix</h1>
          <p>Real-time equipment telemetry and repair routing.</p>
        </div>
        <button className="primary-button log-repair-button" type="button" onClick={() => setIsLogModalOpen(true)}>+ Log New Repair</button>
      </header>

      {error && <p className="login-error" role="alert" style={{ margin: '0 36px 12px' }}>{error}</p>}

      <section className="maintenance-overview">
        <div className="downtime-panel">
          <div className="maintenance-panel-header">
            <h2>Downtime Projection</h2>
            <span>Next 72 Hours</span>
          </div>
          <div className="telemetry-list">
            {downtime.map((item) => (
              <TelemetryRow
                key={item.id}
                label={item.label}
                message={item.message}
                tone={item.tone}
                width={item.width}
                offset={item.offset}
                showScale={item.showScale}
              />
            ))}
            {downtime.length === 0 && (
              <p style={{ padding: '1rem', color: '#999', fontSize: '0.9rem' }}>No downtime projections available.</p>
            )}
          </div>
        </div>

        <div className="pfi-summary">
          <h2>PFI Status Center</h2>
          <div className="pfi-summary-cards">
            <PFICard label="Pending Approval" value={pfiStatus.pendingApproval} />
            <PFICard label="Issued (MTD)" value={pfiStatus.issuedMTD} />
          </div>
          <div className="pfi-total">
            <span>Total Est. Cost</span>
            <strong>₦ {pfiStatus.totalEstCost}</strong>
          </div>
          <button className="primary-button" type="button">Manage Invoices</button>
        </div>
      </section>

      <section className="tickets-panel">
        <div className="maintenance-panel-header">
          <h2>Active Repair Tickets</h2>
          <button className="icon-button" type="button" aria-label="Filter repair tickets">≡</button>
        </div>
        <div className="tickets-table-wrap">
          <table className="tickets-table">
            <thead>
              <tr>
                <th>Ticket ID</th>
                <th>Equipment ID</th>
                <th>Reported Issue</th>
                <th>Status</th>
                <th>SLA Target</th>
                <th><span className="visually-hidden">Action</span></th>
              </tr>
            </thead>
            <tbody>
              {tickets.map((ticket) => (
                <Ticket
                  key={ticket.id}
                  id={ticket.id}
                  equipment={ticket.equipment}
                  issue={ticket.issue}
                  status={ticket.status}
                  tone={ticket.tone}
                  target={ticket.target}
                />
              ))}
              {tickets.length === 0 && (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: '#999' }}>
                    No active repair tickets.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {isLogModalOpen && (
        <div className="repair-modal-backdrop" role="presentation" onMouseDown={() => setIsLogModalOpen(false)}>
          <form className="repair-modal" onMouseDown={(event) => event.stopPropagation()} onSubmit={handleLogRepair}>
            <div className="repair-modal-header">
              <h2>Log Maintenance Ticket</h2>
              <button className="icon-button" type="button" aria-label="Close repair form" onClick={() => setIsLogModalOpen(false)}>×</button>
            </div>
            <label>
              Equipment ID
              <input name="equipment" placeholder="e.g. GEN-772A" value={form.equipment} onChange={updateField} required />
            </label>
            <label>
              Issue Description
              <textarea name="issue" placeholder="Detailed technical description of fault..." rows="3" value={form.issue} onChange={updateField} required />
            </label>
            <div className="repair-form-grid">
              <label>
                Priority Level
                <select name="priority" value={form.priority} onChange={updateField}>
                  <option>Routine Maintenance</option>
                  <option>High Priority</option>
                  <option>Critical (Asset Down)</option>
                </select>
              </label>
              <label>
                Est. Fix Time (Hours)
                <input name="estHours" type="number" placeholder="24" min="1" value={form.estHours} onChange={updateField} />
              </label>
            </div>
            <div className="repair-modal-actions">
              <button className="secondary-button" type="button" onClick={() => setIsLogModalOpen(false)}>Cancel</button>
              <button className="primary-button" type="submit" disabled={submitting}>
                {submitting ? 'Logging...' : 'Submit Ticket'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}

const TelemetryRow = ({ label, message, tone, width, offset = '0', showScale = false }) => (
  <div className="telemetry-row">
    <div className="telemetry-label">{label}</div>
    <div className="telemetry-track-wrap">
      {showScale && (
        <div className="telemetry-scale">
          <span>0H</span><span>24H</span><span>48H</span><span>72H+</span>
        </div>
      )}
      <div className="telemetry-track">
        <span className={tone} style={{ width, marginLeft: offset }} />
      </div>
      <p className={tone} style={{ marginLeft: offset }}>{message}</p>
    </div>
  </div>
)

const PFICard = ({ label, value }) => (
  <div className="pfi-summary-card">
    <span>{label}</span>
    <strong>{value}</strong>
  </div>
)

const Ticket = ({ id, equipment, issue, status, tone, target }) => (
  <tr>
    <td>{id}</td>
    <td>{equipment}</td>
    <td>{issue}</td>
    <td><span className={`status-chip ${tone}`}>{status}</span></td>
    <td className={tone === 'critical' ? 'critical' : ''}>{target}</td>
    <td><button className="icon-button" type="button" aria-label={`Manage ${id}`}>⋯</button></td>
  </tr>
)

export default MaintenanceOpsMatrix
