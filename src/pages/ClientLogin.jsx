import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authService } from '../services/authService.js'

const ClientLogin = () => {
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
      await authService.loginClient(email, password)
      navigate('/client')
    } catch (loginError) {
      setError(loginError.message || 'Unable to sign in. Check your credentials and try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="login-page client-login-page">
      <section className="login-intro">
        <div className="login-brand"><span />SLA Sentinel</div>
        <div className="login-intro-copy"><p className="login-kicker">Client portal</p><h1>Your operations, clearly accounted for.</h1><p>Review SLA health, service requests, maintenance events, and approval items in a single client workspace.</p></div>
        <div className="login-signal"><span>24/7</span><p>Account visibility</p></div>
      </section>
      <section className="login-panel-wrap">
        <form className="login-panel" onSubmit={handleSubmit}>
          <div><p className="login-kicker">Client sign in</p><h2>Welcome to your portal</h2><p className="login-description">Enter your account credentials to view your service status.</p></div>
          <label>Account email<input type="email" autoComplete="email" placeholder="name@company.com" value={email} onChange={(event) => setEmail(event.target.value)} required /></label>
          <label>Password<span className="password-input"><input type={isPasswordVisible ? 'text' : 'password'} autoComplete="current-password" placeholder="Enter your password" value={password} onChange={(event) => setPassword(event.target.value)} required /><button type="button" onClick={() => setIsPasswordVisible(!isPasswordVisible)}>{isPasswordVisible ? 'Hide' : 'Show'}</button></span></label>
          <div className="login-options"><label className="checkbox-label"><input type="checkbox" />Keep me signed in</label><button className="link-button" type="button">Need account help?</button></div>
          {error && <p className="login-error" role="alert">{error}</p>}
          <button className="login-submit" type="submit" disabled={isSubmitting}>{isSubmitting ? 'Signing in...' : 'Sign in to Client Portal'}</button>
          <p className="login-switch">New to the portal? <Link to="/client/signup">Create a client account</Link></p>
          <p className="login-switch">Service Operations team? <Link to="/login">Go to Service Ops</Link></p>
        </form>
      </section>
    </main>
  )
}

export default ClientLogin