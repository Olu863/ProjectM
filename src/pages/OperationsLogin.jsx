import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authService } from '../services/authService.js'

const OperationsLogin = () => {
  const navigate = useNavigate()
  const [isPasswordVisible, setIsPasswordVisible] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setIsSubmitting(true)

    try {
      await authService.loginOperations(email, password)
      navigate('/dashboard')
    } catch (loginError) {
      setError(loginError.message || 'Unable to sign in. Check your credentials and try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="login-page">
      <section className="login-intro">
        <div className="login-brand"><span />SLA Sentinel</div>
        <div className="login-intro-copy"><p className="login-kicker">Service operations</p><h1>Command every service commitment.</h1><p>Monitor active agreements, maintenance workflows, and contract risk from one operational workspace.</p></div>
        <div className="login-signal"><span>99.8%</span><p>Global service uptime</p></div>
      </section>
      <section className="login-panel-wrap">
        <form className="login-panel" onSubmit={handleSubmit}>
          <div><p className="login-kicker">Team sign in</p><h2>Welcome back</h2><p className="login-description">Use your Service Ops credentials to continue.</p></div>
          <label>Work email<input type="email" autoComplete="email" placeholder="name@company.com" value={email} onChange={(event) => setEmail(event.target.value)} required /></label>
          <label>Password<span className="password-input"><input type={isPasswordVisible ? 'text' : 'password'} autoComplete="current-password" placeholder="Enter your password" value={password} onChange={(event) => setPassword(event.target.value)} required /><button type="button" onClick={() => setIsPasswordVisible(!isPasswordVisible)}>{isPasswordVisible ? 'Hide' : 'Show'}</button></span></label>
          <div className="login-options"><label className="checkbox-label"><input type="checkbox" />Remember this device</label><button className="link-button" type="button">Forgot password?</button></div>
          {error && <p className="login-error" role="alert">{error}</p>}
          <button className="login-submit" type="submit" disabled={isSubmitting}>{isSubmitting ? 'Signing in...' : 'Sign in to Service Ops'}</button>
          <p className="login-switch">New to Service Ops? <Link to="/signup">Create a team account</Link></p>
          <p className="login-switch">Are you a client? <Link to="/client/login">Go to Client Portal</Link></p>
        </form>
      </section>
    </main>
  )
}

export default OperationsLogin