import React, { useState, useEffect } from 'react'
import { slaService } from '../services/slaService.js'

const SLAProposalManagement = () => {
  const [contracts, setContracts] = useState([])
  const [activity, setActivity] = useState([])
  const [atRiskCount, setAtRiskCount] = useState(4)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [sending, setSending] = useState(false)

  const [draftFilters, setDraftFilters] = useState({ type: 'All Types', region: 'All Regions (Nigeria)' })
  const [filters, setFilters] = useState(draftFilters)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      setError(null)
      try {
        const serviceFilters = {}
        if (filters.type !== 'All Types') serviceFilters.type = filters.type
        if (filters.region !== 'All Regions (Nigeria)') serviceFilters.region = filters.region

        const [contractsData, atRiskData, activityData] = await Promise.all([
          slaService.getContracts(serviceFilters),
          slaService.getAtRiskRenewals(),
          slaService.getProposalActivity(),
        ])
        setContracts(contractsData)
        setAtRiskCount(atRiskData)
        setActivity(activityData)
      } catch (err) {
        setError(err.message || 'Failed to load SLA data.')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [filters.type, filters.region])

  const visibleContracts = contracts.filter(({ type, region }) =>
    (filters.type === 'All Types' || filters.type === type)
    && (filters.region === 'All Regions (Nigeria)' || region.startsWith(filters.region)),
  )

  const handleSendRenewal = async () => {
    setSending(true)
    setError(null)
    try {
      const renewalContracts = contracts.filter((c) => c.status === 'Renewal Pending')
      if (renewalContracts.length === 0) {
        setError('No renewal-pending contracts found to send.')
        return
      }
      await slaService.sendRenewalProposal(renewalContracts[0].id, `prop-${Date.now()}`)
      const updated = await slaService.getContracts({
        type: filters.type !== 'All Types' ? filters.type : undefined,
        region: filters.region !== 'All Regions (Nigeria)' ? filters.region : undefined,
      })
      setContracts(updated)
      setError(null)
    } catch (err) {
      setError(err.message || 'Failed to send renewal proposal.')
    } finally {
      setSending(false)
    }
  }

  const handleAddActivity = async () => {
    setError(null)
    try {
      await slaService.createProposal({
        type: 'ActivitySchedule',
        region: filters.region,
        scheduledDate: new Date().toISOString(),
      })
      const updated = await slaService.getProposalActivity()
      setActivity(updated)
    } catch (err) {
      setError(err.message || 'Failed to add activity schedule.')
    }
  }

  const timelineClass = (status) => {
    if (status === 'complete') return 'complete'
    if (status === 'current') return 'current'
    return ''
  }

  const timelineMarker = (status) => {
    if (status === 'complete') return '✓'
    if (status === 'current') return '…'
    return '○'
  }

  return (
    <div className="proposal-page">
      <header className="proposal-page-header">
        <div>
          <h1>SLA &amp; Proposal Management</h1>
          <p>Monitor active contracts, identify renewal risks, and manage outgoing proposals.</p>
        </div>
        <div className="proposal-header-actions">
          <button className="secondary-button" type="button" onClick={handleAddActivity}>Add Activity Schedule</button>
          <button className="primary-button" type="button" disabled={sending} onClick={handleSendRenewal}>
            {sending ? 'Sending...' : 'Send Renewal Proposal'}
          </button>
        </div>
      </header>

      <section className="proposal-overview">
        <form className="proposal-filters" onSubmit={(event) => {
          event.preventDefault()
          setFilters(draftFilters)
        }}>
          <div className="filter-group">
            <label htmlFor="contract-type">Contract Type</label>
            <select id="contract-type" value={draftFilters.type} onChange={(event) => setDraftFilters({ ...draftFilters, type: event.target.value })}>
              <option>All Types</option>
              <option>SLA</option>
              <option>Proposal</option>
            </select>
          </div>
          <div className="filter-group">
            <label htmlFor="renewal-date">Renewal Date</label>
            <input id="renewal-date" type="date" />
          </div>
          <div className="filter-group">
            <label htmlFor="region">Region</label>
            <select id="region" value={draftFilters.region} onChange={(event) => setDraftFilters({ ...draftFilters, region: event.target.value })}>
              <option>All Regions (Nigeria)</option>
              <option>Lagos</option>
              <option>Abuja (FCT)</option>
              <option>Port Harcourt</option>
            </select>
          </div>
          <button className="filter-submit" type="submit">Apply Filters</button>
        </form>
        <div className="renewal-risk">
          <p>At-Risk Renewals (Next 30 Days)</p>
          <div><strong>{atRiskCount}</strong><span>! Critical Attention</span></div>
        </div>
      </section>

      {error && <p className="login-error" role="alert" style={{ margin: '0 36px 12px' }}>{error}</p>}

      <section className="proposal-workspace">
        <div className="contracts-panel">
          <div className="workspace-panel-header">
            <h2>Active Contracts &amp; Proposals</h2>
            <button className="icon-button" type="button" aria-label="Download contracts">↓</button>
          </div>
          {loading
            ? <div style={{ padding: '2rem', textAlign: 'center', color: '#999' }}>Loading contracts...</div>
            : (
              <div className="contracts-table-wrap">
                <table className="contracts-table">
                  <thead>
                    <tr>
                      <th>Client Entity</th>
                      <th>Region</th>
                      <th>Term (Start / End)</th>
                      <th>Status</th>
                      <th><span className="visually-hidden">Action</span></th>
                    </tr>
                  </thead>
                  <tbody>
                    {visibleContracts.map((contract) => (
                      <tr key={contract.id}>
                        <td>{contract.client}</td>
                        <td>{contract.region}</td>
                        <td className="term-data">{contract.term}</td>
                        <td><span className={`status-chip ${contract.tone}`}>{contract.status}</span></td>
                        <td><button className="icon-button" type="button" aria-label={`View ${contract.client}`}>⋯</button></td>
                      </tr>
                    ))}
                    {visibleContracts.length === 0 && (
                      <tr>
                        <td colSpan="5" style={{ textAlign: 'center', padding: '2rem', color: '#999' }}>
                          No contracts match the current filters.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
        </div>

        <aside className="activity-panel">
          <div className="workspace-panel-header"><h2>Proposal Activity</h2></div>
          <ol className="proposal-timeline">
            {activity.map((item) => (
              <li key={item.id} className={timelineClass(item.status)}>
                <span className="timeline-marker">{timelineMarker(item.status)}</span>
                <div>
                  <strong>{item.title}</strong>
                  <small>{item.time}</small>
                  {item.status === 'current' && (
                    <button className="nudge-button" type="button" onClick={() => alert('Notifying reviewer...')}>Nudge Reviewer</button>
                  )}
                </div>
              </li>
            ))}
          </ol>
        </aside>
      </section>
    </div>
  )
}

export default SLAProposalManagement
