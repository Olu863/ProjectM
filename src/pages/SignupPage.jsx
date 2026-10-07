import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authService } from '../services/authService.js'

const SignupPage = ({ accountType }) => {
  const isClient = accountType === 'client'
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '', company: '', phone: '' })
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const updateField = (event) => {
    setForm({ ...form, [event.target.name]: event.target.value })
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setIsSubmitting(true)
    try {
      await authService.register({
        name: form.name,
        email: form.email,
        password: form.password,
        role: isClient ? 'client' : 'operations',
        company: form.company,
        phone: form.phone,
      })
      navigate(isClient ? '/client/login' : '/login', { state: { registrationComplete: true } })
    } catch (registrationError) {
      setError(registrationError.message || 'Unable to create your account. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const loginPath = isClient ? '/client/login' : '/login'
  const alternateSignupPath = isClient ? '/signup' : '/client/signup'

  return (
    <main className={`login-page ${isClient ? 'client-login-page' : ''}`}>
      <section className="login-intro">
        <div className="login-brand"><span />SLA Sentinel</div>
        <div className="login-intro-copy">
          <p className="login-kicker">{isClient ? 'Client account' : 'Service operations'}</p>
          <h1>{isClient ? 'Start with a clearer service view.' : 'Build the operations workspace your team needs.'}</h1>
          <p>{isClient ? 'Create a client portal account to follow service activity, approvals, and SLA performance.' : 'Create an account for your Service Operations team and manage commitments in one place.'}</p>
        </div>
        <div className="login-signal"><span>{isClient ? '24/7' : '99.8%'}</span><p>{isClient ? 'Account visibility' : 'Global service uptime'}</p></div>
      </section>
      <section className="login-panel-wrap">
        <form className="login-panel signup-panel" onSubmit={handleSubmit}>
          <div><p className="login-kicker">Create account</p><h2>{isClient ? 'Open your client portal' : 'Set up Service Ops'}</h2><p className="login-description">Complete your details to get started.</p></div>
          <label>Full name<input name="name" autoComplete="name" placeholder="Your full name" value={form.name} onChange={updateField} required /></label>
          <label>{isClient ? 'Company name' : 'Organization'}<input name="company" autoComplete="organization" placeholder="Company name" value={form.company} onChange={updateField} required /></label>
          <label>Work email<input name="email" type="email" autoComplete="email" placeholder="name@company.com" value={form.email} onChange={updateField} required /></label>
          <label>Phone number<input name="phone" type="tel" autoComplete="tel" placeholder="+234 ..." value={form.phone} onChange={updateField} required /></label>
          <label>Password<input name="password" type="password" autoComplete="new-password" placeholder="Create a password" value={form.password} onChange={updateField} minLength="8" required /></label>
          <label>Confirm password<input name="confirmPassword" type="password" autoComplete="new-password" placeholder="Confirm your password" value={form.confirmPassword} onChange={updateField} minLength="8" required /></label>
          {error && <p className="login-error" role="alert">{error}</p>}
          <button className="login-submit" type="submit" disabled={isSubmitting}>{isSubmitting ? 'Creating account...' : 'Create account'}</button>
          <p className="login-switch">Already have an account? <Link to={loginPath}>Sign in</Link></p>
          <p className="login-switch">{isClient ? 'Setting up a Service Ops team?' : 'Need a client portal account?'} <Link to={alternateSignupPath}>{isClient ? 'Create a team account' : 'Create a client account'}</Link></p>
        </form>
      </section>
    </main>
  )
}

export default SignupPage