/**
 * Client Portal Service
 * Provides client-specific SLA status, alerts, tickets, and maintenance timeline
 */

import { apiClient } from './api.js'

export const clientService = {
  /**
   * Get client profile and current account
   */
  async getClientProfile(clientId) {
    try {
      const { data } = await apiClient.get(`/client/profile/${clientId}`)
      return data || {
        name: 'Dangote Group',
        accountId: 'ACC-DGT-001',
        tier: 'Premium',
      }
    } catch (error) {
      console.warn('Failed to fetch client profile, using defaults:', error.message)
      return {
        name: 'Dangote Group',
        accountId: 'ACC-DGT-001',
        tier: 'Premium',
      }
    }
  },

  /**
   * Get SLA status and compliance for client
   */
  async getSLAStatus(clientId) {
    try {
      const { data } = await apiClient.get(`/client/${clientId}/sla-status`)
      return data || {
        uptime: '99.98%',
        target: '99.9%',
        status: 'meets',
        agreementNumber: 'AGR-LGS-2023-001',
      }
    } catch (error) {
      console.warn('Failed to fetch SLA status, using defaults:', error.message)
      return {
        uptime: '99.98%',
        target: '99.9%',
        status: 'meets',
        agreementNumber: 'AGR-LGS-2023-001',
      }
    }
  },

  /**
   * Get client service tickets
   */
  async getTickets(clientId) {
    try {
      const { data } = await apiClient.get(`/client/${clientId}/tickets`)
      return data || [
        {
          id: 'TKT-C-0921',
          title: 'HVAC Routine Check - Q3',
          description: 'Quarterly preventative maintenance scheduled.',
          status: 'Scheduled',
          dueDate: 'Oct 24',
        },
        {
          id: 'TKT-C-0920',
          title: 'PFI Approval Required',
          description: 'Generator repair cost approval needed (₦2.1M estimate).',
          status: 'Pending Your Review',
          dueDate: 'Oct 22',
        },
      ]
    } catch (error) {
      console.warn('Failed to fetch client tickets, using defaults:', error.message)
      return [
        {
          id: 'TKT-C-0921',
          title: 'HVAC Routine Check - Q3',
          description: 'Quarterly preventative maintenance scheduled.',
          status: 'Scheduled',
          dueDate: 'Oct 24',
        },
        {
          id: 'TKT-C-0920',
          title: 'PFI Approval Required',
          description: 'Generator repair cost approval needed (₦2.1M estimate).',
          status: 'Pending Your Review',
          dueDate: 'Oct 22',
        },
      ]
    }
  },

  /**
   * Get client maintenance timeline
   */
  async getMaintenanceTimeline(clientId) {
    try {
      const { data } = await apiClient.get(`/client/${clientId}/maintenance-timeline`)
      return data || [
        {
          id: 'maint-001',
          title: 'Quarterly Inspection',
          date: 'Oct 24',
          status: 'Upcoming',
        },
        {
          id: 'maint-002',
          title: 'Elevator Audit',
          date: 'Nov 15',
          status: 'Scheduled',
        },
      ]
    } catch (error) {
      console.warn('Failed to fetch maintenance timeline, using defaults:', error.message)
      return [
        {
          id: 'maint-001',
          title: 'Quarterly Inspection',
          date: 'Oct 24',
          status: 'Upcoming',
        },
        {
          id: 'maint-002',
          title: 'Elevator Audit',
          date: 'Nov 15',
          status: 'Scheduled',
        },
      ]
    }
  },

  /**
   * Get pending alerts and notifications
   */
  async getAlerts(clientId) {
    try {
      const { data } = await apiClient.get(`/client/${clientId}/alerts`)
      return data || [
        {
          id: 'alert-001',
          type: 'pfi',
          title: 'Action Required: Generator Repair Authorization',
          description: 'Equipment GEN-LGS-042 requires authorization for repair (₦2.1M).',
          severity: 'high',
          createdAt: 'Today 14:22',
        },
      ]
    } catch (error) {
      console.warn('Failed to fetch alerts, using defaults:', error.message)
      return [
        {
          id: 'alert-001',
          type: 'pfi',
          title: 'Action Required: Generator Repair Authorization',
          description: 'Equipment GEN-LGS-042 requires authorization for repair (₦2.1M).',
          severity: 'high',
          createdAt: 'Today 14:22',
        },
      ]
    }
  },

  /**
   * Approve a pending PFI
   */
  async approvePFI(pfiId) {
    try {
      const { data } = await apiClient.post(`/client/pfi/${pfiId}/approve`, {})
      return data
    } catch (error) {
      console.error('Failed to approve PFI:', error)
      throw error
    }
  },

  /**
   * Submit ticket response or comment
   */
  async submitTicketResponse(ticketId, response) {
    try {
      const { data } = await apiClient.post(`/client/tickets/${ticketId}/response`, {
        response,
      })
      return data
    } catch (error) {
      console.error('Failed to submit ticket response:', error)
      throw error
    }
  },
}
