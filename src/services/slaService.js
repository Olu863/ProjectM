/**
 * SLA & Proposal Management Service
 * Handles contract data, renewal risk, proposal activities, and filtering
 */

import { apiClient } from './api.js'

export const slaService = {
  /**
   * Get active contracts and proposals
   */
  async getContracts(filters = {}) {
    try {
      const query = new URLSearchParams(filters).toString()
      const endpoint = `/sla/contracts${query ? '?' + query : ''}`
      const { data } = await apiClient.get(endpoint)
      return data || [
        {
          id: 'contract-001',
          client: 'Zenith Core Infra',
          region: 'Lagos (VI)',
          term: '24/01/23 - 23/01/24',
          status: 'Active SLA',
          type: 'SLA',
          tone: 'success',
        },
        {
          id: 'contract-002',
          client: 'Abuja Power Grid Ltd.',
          region: 'Abuja (FCT)',
          term: '15/03/22 - 14/03/24',
          status: 'Renewal Pending',
          type: 'SLA',
          tone: 'caution',
        },
        {
          id: 'contract-003',
          client: 'Delta Marine Works',
          region: 'Port Harcourt',
          term: '01/01/23 - 31/12/23',
          status: 'SLA Expired',
          type: 'SLA',
          tone: 'critical',
        },
        {
          id: 'contract-004',
          client: 'First Bank Data Center',
          region: 'Lagos (Marina)',
          term: '10/06/23 - 09/06/25',
          status: 'Active SLA',
          type: 'SLA',
          tone: 'success',
        },
        {
          id: 'contract-005',
          client: 'Lekki Toll Infrastructure',
          region: 'Lagos (Lekki)',
          term: '05/09/22 - 04/09/24',
          status: 'Proposal Drafted',
          type: 'Proposal',
          tone: 'caution',
        },
      ]
    } catch (error) {
      console.warn('Failed to fetch contracts, using defaults:', error.message)
      return this.getContracts({}) // Return defaults
    }
  },

  /**
   * Get at-risk renewals for the next 30 days
   */
  async getAtRiskRenewals() {
    try {
      const { data } = await apiClient.get('/sla/at-risk-renewals')
      return data?.count || 4
    } catch (error) {
      return 4
    }
  },

  /**
   * Get proposal activity timeline
   */
  async getProposalActivity() {
    try {
      const { data } = await apiClient.get('/sla/proposal-activity')
      return data || [
        { id: 1, title: 'Initial Client Review', time: '08:00 AM', status: 'complete' },
        { id: 2, title: 'Draft Proposal Gen.', time: '11:30 AM', status: 'complete' },
        { id: 3, title: 'Legal Compliance Check', time: 'Pending since 14:00', status: 'current' },
        { id: 4, title: 'Client Dispatch', time: 'TBD', status: 'pending' },
      ]
    } catch (error) {
      console.warn('Failed to fetch proposal activity, using defaults:', error.message)
      return [
        { id: 1, title: 'Initial Client Review', time: '08:00 AM', status: 'complete' },
        { id: 2, title: 'Draft Proposal Gen.', time: '11:30 AM', status: 'complete' },
        { id: 3, title: 'Legal Compliance Check', time: 'Pending since 14:00', status: 'current' },
        { id: 4, title: 'Client Dispatch', time: 'TBD', status: 'pending' },
      ]
    }
  },

  /**
   * Create new proposal
   */
  async createProposal(proposalData) {
    try {
      const { data } = await apiClient.post('/sla/proposals', proposalData)
      return data
    } catch (error) {
      console.error('Failed to create proposal:', error)
      throw error
    }
  },

  /**
   * Send renewal proposal
   */
  async sendRenewalProposal(clientId, proposalId) {
    try {
      const { data } = await apiClient.post('/sla/send-renewal', {
        clientId,
        proposalId,
      })
      return data
    } catch (error) {
      console.error('Failed to send renewal proposal:', error)
      throw error
    }
  },
}
