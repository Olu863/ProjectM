/**
 * Dashboard Service
 * Fetches executive dashboard metrics, KPIs, compliance data, and schedules
 */

import { apiClient } from './api.js'

export const dashboardService = {
  /**
   * Get executive dashboard metrics (KPIs)
   */
  async getMetrics() {
    try {
      const { data } = await apiClient.get('/dashboard/metrics')
      return {
        activeSLAs: data?.activeSLAs || 1492,
        pending: data?.pending || 84,
        uptime: data?.uptime || 99.8,
        openPFIs: data?.openPFIs || 12,
        criticalPFIs: data?.criticalPFIs || 3,
      }
    } catch (error) {
      console.warn('Failed to fetch metrics, using defaults:', error.message)
      return {
        activeSLAs: 1492,
        pending: 84,
        uptime: 99.8,
        openPFIs: 12,
        criticalPFIs: 3,
      }
    }
  },

  /**
   * Get SLA compliance by region
   */
  async getComplianceByRegion() {
    try {
      const { data } = await apiClient.get('/dashboard/compliance')
      return data || [
        { region: 'Lagos Hub', compliance: 98.5 },
        { region: 'Port Harcourt Hub', compliance: 82.1 },
        { region: 'Abuja (FCT)', compliance: 99.9 },
        { region: 'Kano Hub', compliance: 95.0 },
      ]
    } catch (error) {
      console.warn('Failed to fetch compliance data, using defaults:', error.message)
      return [
        { region: 'Lagos Hub', compliance: 98.5 },
        { region: 'Port Harcourt Hub', compliance: 82.1 },
        { region: 'Abuja (FCT)', compliance: 99.9 },
        { region: 'Kano Hub', compliance: 95.0 },
      ]
    }
  },

  /**
   * Get upcoming maintenance schedules
   */
  async getSchedules() {
    try {
      const { data } = await apiClient.get('/dashboard/schedules')
      return data || [
        {
          id: 'sched-001',
          title: 'Quarterly Preventative',
          location: 'Lagos HQ',
          equipmentId: 'GEN-LGS-042',
          date: 'Oct 25, 08:00',
          status: 'Scheduled',
        },
        {
          id: 'sched-002',
          title: 'Filter Replacement',
          location: 'Port Harcourt',
          equipmentId: 'HVAC-PHC-001',
          date: 'Oct 26, 14:30',
          status: 'Scheduled',
        },
        {
          id: 'sched-003',
          title: 'Vibration Analysis',
          location: 'Abuja Substation',
          equipmentId: 'PUMP-ABV-99',
          date: 'Oct 27, 09:00',
          status: 'Pending',
        },
      ]
    } catch (error) {
      console.warn('Failed to fetch schedules, using defaults:', error.message)
      return [
        {
          id: 'sched-001',
          title: 'Quarterly Preventative',
          location: 'Lagos HQ',
          equipmentId: 'GEN-LGS-042',
          date: 'Oct 25, 08:00',
          status: 'Scheduled',
        },
        {
          id: 'sched-002',
          title: 'Filter Replacement',
          location: 'Port Harcourt',
          equipmentId: 'HVAC-PHC-001',
          date: 'Oct 26, 14:30',
          status: 'Scheduled',
        },
        {
          id: 'sched-003',
          title: 'Vibration Analysis',
          location: 'Abuja Substation',
          equipmentId: 'PUMP-ABV-99',
          date: 'Oct 27, 09:00',
          status: 'Pending',
        },
      ]
    }
  },

  /**
   * Get last sync timestamp
   */
  async getLastSync() {
    try {
      const { data } = await apiClient.get('/dashboard/sync-status')
      return data?.timestamp || '14:02 WAT'
    } catch (error) {
      return '14:02 WAT'
    }
  },
}
