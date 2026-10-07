import React, { useState, useEffect } from 'react'
import { authService } from '../services/authService.js'
import { clientService } from '../services/clientService.js'

const ClientPortalDashboard = () => {
  const [profile, setProfile] = useState(null)
  const [slaStatus, setSlaStatus] = useState(null)
  const [tickets, setTickets] = useState([])
  const [timeline, setTimeline] = useState([])
  const [alerts, setAlerts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [actionLoading, setActionLoading] = useState(false)

  const user = authService.getUser()
  const clientId = user?.accountId || user?.clientId || user?.id || 'ACC-DGT-001'

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      setError(null)
      try {
        const [profileData, slaData, ticketsData, timelineData, alertsData] = await Promise.all([
          clientService.getClientProfile(clientId),
          clientService.getSLAStatus(clientId),
          clientService.getTickets(clientId),
          clientService.getMaintenanceTimeline(clientId),
          clientService.getAlerts(clientId),
        ])
        setProfile(profileData)
        setSlaStatus(slaData)
        setTickets(ticketsData)
        setTimeline(timelineData)
        setAlerts(alertsData)
      } catch (err) {
        setError(err.message || 'Failed to load client data.')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [clientId])

  const handleApprovePFI = async (alert) => {
    setActionLoading(true)
    setError(null)
    try {
      const pfiId = alert.pfiId || alert.id || 'current'
      await clientService.approvePFI(pfiId)
      setAlerts((prev) => prev.filter((a) => a.id !== alert.id))
    } catch (err) {
      setError(err.message || 'Failed to approve PFI.')
    } finally {
      setActionLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="client-page">
        <div className="client-welcome"><h1>SLA Sentinel</h1><p>Loading your service data...</p></div>
        <div style={{ padding: '2rem', color: '#999' }}>Fetching client profile, SLA status, tickets, and alerts...</div>
      </div>
    )
  }

  const clientName = profile?.name || 'Valued Client'
  const agreementNumber = slaStatus?.agreementNumber || profile?.accountId || '-'
  const uptime = slaStatus?.uptime || '99.98%'
  const uptimeTarget = slaStatus?.target || '99.9%'
  const accountNumber = profile?.accountId || '-'
  const tier = profile?.tier || '-'

  return (
    <div className="client-page">
      <header className="client-welcome">
        <h1>Welcome back, {clientName}</h1>
        <p>Your systems are performing well. No critical actions needed today.</p>
      </header>

      <div className="client-grid">
        <div className="client-left">
          <section className="client-status-panel">
            <span className="status-check">✓</span>
            <h2>SLA Target Met</h2>
            <p>Current Uptime: <strong>{uptime}</strong> (Target: {uptimeTarget})</p>
            <span className="agreement-chip">
              <i />Active Agreement: {agreementNumber}
            </span>
          </section>

          <section className="client-panel">
            <div className="client-panel-header">
              <h2>Recent Tickets</h2>
              <button className="text-button" type="button">View All →</button>
            </div>
            {tickets.length === 0
              ? <p style={{ padding: '1rem', color: '#999', fontSize: '0.9rem' }}>No recent tickets.</p>
              : tickets.map((ticket) => (
                  <Ticket
                    key={ticket.id}
                    title={ticket.title}
                    detail={`${ticket.id} • ${ticket.dueDate || 'recently'}`}
                    status={ticket.status}
                    critical={ticket.status === 'Pending Your Review' || ticket.status === 'Action Needed'}
                  />
                ))}
          </section>
        </div>

        <div className="client-right">
          <section className="client-panel">
            <div className="client-panel-header"><h2>Alerts</h2></div>
            {alerts.length === 0
              ? <p style={{ padding: '1rem', color: '#999', fontSize: '0.9rem' }}>No active alerts.</p>
              : alerts.map((alert) => (
                  <div key={alert.id} className="client-alert">
                    <div>
                      <strong>{alert.title}</strong>
                      <p>{alert.description}</p>
                      {alert.type === 'pfi' && (
                        <button
                          className="alert-action"
                          type="button"
                          disabled={actionLoading}
                          onClick={() => handleApprovePFI(alert)}
                        >
                          {actionLoading ? 'Processing...' : 'Review PFI'}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
          </section>

          <section className="client-panel">
            <div className="client-panel-header"><h2>Upcoming Maintenance</h2></div>
            <div className="client-timeline">
              {timeline.length === 0
                ? <p style={{ padding: '1rem', color: '#999', fontSize: '0.9rem' }}>No upcoming maintenance.</p>
                : timeline.map((event) => (
                    <TimelineEvent
                      key={event.id}
                      title={event.title}
                      date={event.date}
                      location={event.location}
                      active={event.status === 'Upcoming' || event.status === 'Scheduled'}
                    />
                  ))}
            </div>
          </section>
        </div>
      </div>

      {error && <p className="login-error" role="alert" style={{ margin: '0 32px 12px' }}>{error}</p>}
      <div style={{ padding: '0 32px', fontSize: '0.8rem', color: '#999' }}>
        Account: {accountNumber} · Tier: {tier} · Client ID: {clientId}
      </div>
    </div>
  )
}

const Ticket = ({ title, detail, status, critical = false }) => (
  <div className="client-ticket">
    <div className={`ticket-symbol ${critical ? 'ticket-symbol-critical' : ''}`}>
      {critical ? '!' : '⚙'}
    </div>
    <div>
      <strong>{title}</strong>
      <p>{detail}</p>
    </div>
    <span className={critical ? 'ticket-status critical' : 'ticket-status'}>{status}</span>
  </div>
)

const TimelineEvent = ({ title, date, location, active = false }) => (
  <div className={`client-timeline-event ${active ? 'active' : ''}`}>
    <span className="client-timeline-marker" />
    <div>
      <strong>{title}</strong>
      <p>{date}</p>
      {location && <p>{location}</p>}
    </div>
  </div>
)

export default ClientPortalDashboard
