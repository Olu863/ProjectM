import React from 'react'
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import Sidebar from './components/Sidebar.jsx'
import TopBar from './components/TopBar.jsx'
import ClientPortalDashboard from './pages/ClientPortalDashboard.jsx'
import ClientLogin from './pages/ClientLogin.jsx'
import ClientSignup from './pages/ClientSignup.jsx'
import ExecutiveDashboard from './pages/ExecutiveDashboard.jsx'
import MaintenanceOpsMatrix from './pages/MaintenanceOpsMatrix.jsx'
import OperationsLogin from './pages/OperationsLogin.jsx'
import OperationsSignup from './pages/OperationsSignup.jsx'
import SLAProposalManagement from './pages/SLAProposalManagement.jsx'
import { authService } from './services/authService.js'
import './App.css'

const ProtectedRoute = ({ allowedRoles, children }) => {
  const location = useLocation()
  const isAuthenticated = authService.isAuthenticated()
  const userRole = authService.getUserRole()

  if (!isAuthenticated) {
    return <Navigate to={allowedRoles.includes('client') ? '/client/login' : '/login'} replace state={{ from: location }} />
  }

  if (!allowedRoles.includes(userRole)) {
    return <Navigate to={userRole === 'client' ? '/client' : '/dashboard'} replace />
  }

  return children
}

const DashboardShell = () => (
  <div className="app-shell">
    <Sidebar />
    <div className="main-area">
      <TopBar />
      <main className="content-area">
        <Routes>
          <Route index element={<ExecutiveDashboard />} />
          <Route path="sla" element={<SLAProposalManagement />} />
          <Route path="maintenance" element={<MaintenanceOpsMatrix />} />
        </Routes>
      </main>
    </div>
  </div>
)

const ClientPortalShell = () => {
  const navigate = useNavigate()
  const userRole = authService.getUserRole()

  const handleSignOut = () => {
    authService.logout()
    navigate(userRole === 'operations' ? '/login' : '/client/login')
  }

  return (
    <div className="client-portal-shell">
      <header className="client-portal-header">
        <div className="topbar-brand">SLA Sentinel</div>
        <div className="client-portal-actions">
          {userRole === 'operations' && <button className="secondary-button" type="button" onClick={() => navigate('/dashboard')}>Service Ops</button>}
          <button className="secondary-button" type="button" onClick={handleSignOut}>Sign Out</button>
        </div>
      </header>
      <main className="client-portal-content"><ClientPortalDashboard /></main>
    </div>
  )
}

const App = () => (
  <Routes>
    <Route path="/" element={<OperationsLogin />} />
    <Route path="/login" element={<OperationsLogin />} />
    <Route path="/signup" element={<OperationsSignup />} />
    <Route path="/client/login" element={<ClientLogin />} />
    <Route path="/client/signup" element={<ClientSignup />} />
    <Route path="/dashboard/*" element={<ProtectedRoute allowedRoles={['operations']}><DashboardShell /></ProtectedRoute>} />
    <Route path="/client" element={<ProtectedRoute allowedRoles={['client', 'operations']}><ClientPortalShell /></ProtectedRoute>} />
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
)

export default App