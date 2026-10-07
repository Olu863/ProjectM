import React, { useState, useEffect } from 'react'
import { dashboardService } from '../services/dashboardService.js'

const ExecutiveDashboard = () => {
  // State management
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [metrics, setMetrics] = useState(null)
  const [compliance, setCompliance] = useState([])
  const [schedules, setSchedules] = useState([])
  const [lastSync, setLastSync] = useState('14:02 WAT')

  // Fetch data on component mount
  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true)
      setError(null)
      try {
        // Fetch all dashboard data in parallel
        const [metricsData, complianceData, schedulesData, syncTime] = await Promise.all([
          dashboardService.getMetrics(),
          dashboardService.getComplianceByRegion(),
          dashboardService.getSchedules(),
          dashboardService.getLastSync(),
        ])

        setMetrics(metricsData)
        setCompliance(complianceData)
        setSchedules(schedulesData)
        setLastSync(syncTime)
      } catch (err) {
        console.error('Failed to load dashboard data:', err)
        setError('Unable to load dashboard data. Using cached values.')
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  // Render loading state
  if (loading) {
    return (
      <div className="page">
        <div className="page-header">
          <div><h1>Executive Dashboard</h1><p className="page-subtitle">Loading...</p></div>
          <div className="sync-summary"><span>Last Sync</span><strong>{lastSync}</strong></div>
        </div>
        <div style={{ padding: '3rem', textAlign: 'center', color: '#999' }}>Loading dashboard data...</div>
      </div>
    )
  }

  // Render error state
  if (error && !metrics) {
    return (
      <div className="page">
        <div className="page-header">
          <div><h1>Executive Dashboard</h1><p className="page-subtitle">Error</p></div>
        </div>
        <div style={{ padding: '3rem', textAlign: 'center', color: '#d7263d' }}>
          <p>{error}</p>
          <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>Please refresh the page to retry.</p>
        </div>
      </div>
    )
  }

  // Determine system status
  const systemStatus = metrics?.uptime >= 99 ? 'System Nominal' : 'System Alert'

  return (
    <div className="page">
      <div className="page-header">
        <div><h1>Executive Dashboard</h1><p className="page-subtitle">{systemStatus}</p></div>
        <div className="sync-summary"><span>Last Sync</span><strong>{lastSync}</strong></div>
      </div>

      <div className="grid-4">
        <div className="card metric-card">
          <div className="metric-top">
            <div className="metric-label">Active SLAs</div>
            <span className="metric-icon metric-icon-primary">&#10003;</span>
          </div>
          <div className="metric-value">{metrics?.activeSLAs?.toLocaleString()}</div>
          <div className="metric-sub metric-positive">+12 this month</div>
        </div>
        <div className="card metric-card">
          <div className="metric-top">
            <div className="metric-label">Pending</div>
            <span className="metric-icon metric-icon-muted">&#8987;</span>
          </div>
          <div className="metric-value">{metrics?.pending}</div>
          <div className="metric-sub">Action required</div>
        </div>
        <div className="card metric-card">
          <div className="metric-top">
            <div className="metric-label">Uptime</div>
            <span className="metric-icon metric-icon-success">&#9889;</span>
          </div>
          <div className="metric-value">{metrics?.uptime}%</div>
          <div className="metric-sub metric-positive">Global Avg</div>
        </div>
        <div className="card metric-card">
          <div className="metric-top">
            <div className="metric-label">Open PFIs</div>
            <span className="metric-icon metric-icon-critical">!</span>
          </div>
          <div className="metric-value critical">{metrics?.openPFIs}</div>
          <div className="metric-sub critical">{metrics?.criticalPFIs} Critical</div>
        </div>
      </div>

      <div className="grid-2 mt-lg">
        <div className="card">
          <div className="card-header"><h2>SLA Compliance</h2></div>
          <div className="compliance-list">
            {compliance.map((region) => (
              <div key={region.region} className="compliance-row">
                <div className="compliance-label">
                  <span>{region.region}</span>
                  <strong>{region.compliance}%</strong>
                </div>
                <div className="progress-track">
                  <span style={{ width: `${region.compliance}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="card-header"><h2>Schedules</h2><button className="text-button" type="button">View All</button></div>
          <div className="schedule-list">
            {schedules.map((schedule) => (
              <div key={schedule.id} className="schedule-item">
                <div>
                  <div className="schedule-title">{schedule.title}</div>
                  <div className="schedule-meta">{schedule.location} - {schedule.equipmentId}</div>
                </div>
                <div className="schedule-timing">
                  {schedule.date}
                  <span className={`badge ${schedule.status === 'Scheduled' ? 'muted' : 'warning'}`}>
                    {schedule.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ExecutiveDashboard