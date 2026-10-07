import React from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { authService } from '../services/authService.js'

const Sidebar = () => {
  const navigate = useNavigate()

  const handleSignOut = () => {
    authService.logout()
    navigate('/login')
  }

  return (
  <aside className="sidebar">
    <div className="sidebar-header">
      <div className="sidebar-title">Service Ops</div>
      <div className="sidebar-subtitle">Nigerian Enterprise</div>
    </div>

    <nav className="sidebar-nav" aria-label="Primary navigation">
      <NavLink
        to="/dashboard"
        end
        className={({ isActive }) =>
          isActive ? 'nav-item nav-item-active' : 'nav-item'
        }
      >
        Dashboard
      </NavLink>

      <NavLink
        to="/dashboard/sla"
        className={({ isActive }) =>
          isActive ? 'nav-item nav-item-active' : 'nav-item'
        }
      >
        SLA Management
      </NavLink>

      <NavLink
        to="/dashboard/maintenance"
        className={({ isActive }) =>
          isActive ? 'nav-item nav-item-active' : 'nav-item'
        }
      >
        Maintenance &amp; Repair
      </NavLink>

      <NavLink
        to="/client"
        className={({ isActive }) =>
          isActive ? 'nav-item nav-item-active' : 'nav-item'
        }
      >
        Client Portal
      </NavLink>

      <button className="nav-button primary-button" type="button">+ Issue PFI</button>

      <div className="sidebar-footer">
        <button className="nav-link-muted" type="button">Settings</button>
        <button className="nav-link-muted" type="button" onClick={handleSignOut}>Sign Out</button>
      </div>
    </nav>
  </aside>
  )
}

export default Sidebar