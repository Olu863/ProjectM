import React from 'react'

const TopBar = () => {
  return (
    <header className="topbar">
      <div className="topbar-start">
        <div className="topbar-brand">SLA Sentinel</div>
        <label className="topbar-search">
          <span aria-hidden="true">&#128269;</span>
          <input type="search" placeholder="Search Assets, PFIs..." aria-label="Search assets and PFIs" />
        </label>
      </div>
      <div className="topbar-meta">
        <button className="utility-button" type="button" aria-label="Notifications">&#128276;</button>
        <button className="utility-button" type="button" aria-label="Settings">&#9881;</button>
        <button className="utility-button" type="button" aria-label="Help">?</button>
        <span className="avatar" aria-label="Administrator">AM</span>
      </div>
    </header>
  )
}

export default TopBar