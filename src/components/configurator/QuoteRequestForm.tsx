import { useState } from 'react'
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useConfiguratorStore } from '../../store/configuratorStore'

type FormStatus = 'idle' | 'loading' | 'success' | 'error'

// Anonymous session ID persisted in sessionStorage
function getSessionId(): string {
  let id = sessionStorage.getItem('cfg_session_id')
  if (!id) {
    id = crypto.randomUUID()
    sessionStorage.setItem('cfg_session_id', id)
  }
  return id
}

export function QuoteRequestForm() {
  const { profileSystem, windowType, dimensions, options, price } = useConfiguratorStore()

  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' })
  const [status, setStatus] = useState<FormStatus>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  function update(field: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [field]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name || !form.email) return

    setStatus('loading')
    setErrorMsg('')

    try {
      // 1. Save configuration to DB
      const { data: configData, error: configErr } = await supabase
        .from('configurations')
        .insert({
          session_id: getSessionId(),
          product_category: 'window',
          profile_system_id: profileSystem?.id ?? null,
          window_type_id: windowType?.id ?? null,
          width_mm: dimensions.width,
          height_mm: dimensions.height,
          options_json: options,
          total_price_eur: price?.total_eur ?? null,
        })
        .select('id')
        .single()

      if (configErr) throw configErr

      // 2. Submit quote request
      const { error: quoteErr } = await supabase.from('quote_requests').insert({
        configuration_id: configData.id,
        name: form.name,
        email: form.email,
        phone: form.phone || null,
        message: form.message || null,
      })

      if (quoteErr) throw quoteErr

      setStatus('success')
    } catch (err) {
      console.error('[QuoteForm] Submit error:', err)
      setErrorMsg(err instanceof Error ? err.message : 'Submission failed. Please try again.')
      setStatus('error')
    }
  }

  if (status === 'success') {
    return (
      <div className="quote-success">
        <CheckCircle2 size={48} className="success-icon" />
        <h2>Quote Request Sent</h2>
        <p>
          Thank you, <strong>{form.name}</strong>! We'll get back to you at{' '}
          <strong>{form.email}</strong> within one business day.
        </p>
      </div>
    )
  }

  return (
    <form className="quote-form" onSubmit={handleSubmit} noValidate>
      <h2 className="quote-form-title">Request a Quote</h2>
      <p className="quote-form-subtitle">
        Your configuration is saved. Fill in your details and we'll send a personalised offer.
      </p>

      <div className="form-row">
        <div className="form-field">
          <label htmlFor="qf-name">Full name *</label>
          <input
            id="qf-name"
            type="text"
            placeholder="Anna Müller"
            value={form.name}
            onChange={update('name')}
            required
          />
        </div>
        <div className="form-field">
          <label htmlFor="qf-email">Email *</label>
          <input
            id="qf-email"
            type="email"
            placeholder="anna@example.com"
            value={form.email}
            onChange={update('email')}
            required
          />
        </div>
      </div>

      <div className="form-field">
        <label htmlFor="qf-phone">Phone (optional)</label>
        <input
          id="qf-phone"
          type="tel"
          placeholder="+49 123 456 789"
          value={form.phone}
          onChange={update('phone')}
        />
      </div>

      <div className="form-field">
        <label htmlFor="qf-message">Message (optional)</label>
        <textarea
          id="qf-message"
          rows={4}
          placeholder="Any special requirements, installation address, preferred delivery date…"
          value={form.message}
          onChange={update('message')}
        />
      </div>

      {status === 'error' && (
        <div className="form-error-banner" role="alert">
          <AlertCircle size={16} />
          {errorMsg}
        </div>
      )}

      <button type="submit" className="quote-submit-btn" disabled={status === 'loading'}>
        {status === 'loading' ? (
          <>
            <Loader2 size={16} className="spin" />
            Sending…
          </>
        ) : (
          'Send Quote Request'
        )}
      </button>
    </form>
  )
}
