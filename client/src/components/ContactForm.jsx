import { useState } from 'react'
import { sendContactMessage } from '../api/contact'

const emptyForm = { name: '', email: '', subject: '', message: '', website: '' }

// Returns an object of error messages. An empty object means "valid".
function validate(values) {
  const errors = {}
  const name = values.name.trim()
  const email = values.email.trim()
  const message = values.message.trim()

  if (name.length < 2) errors.name = 'Please enter your name (at least 2 characters).'
  else if (name.length > 80) errors.name = 'Name must be 80 characters or fewer.'

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = 'Please enter a valid email address.'
  else if (email.length > 254) errors.email = 'Email address is too long.'

  if (values.subject.trim().length > 120) errors.subject = 'Subject must be 120 characters or fewer.'

  if (message.length < 10) errors.message = 'Please write a message of at least 10 characters.'
  else if (message.length > 2000) errors.message = 'Message must be 2000 characters or fewer.'

  return errors
}

function Field({ id, label, error, optional, children }) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium">
        {label}
        {optional && <span className="ml-1 font-normal text-muted">(optional)</span>}
      </label>
      <div className="mt-2">{children}</div>
      {error && (
        <p id={`${id}-error`} className="mt-2 text-sm">
          {error}
        </p>
      )}
    </div>
  )
}

function ContactForm() {
  const [values, setValues] = useState(emptyForm)
  const [errors, setErrors] = useState({})
  const [status, setStatus] = useState('idle') // idle | sending | success | error
  const [errorMessage, setErrorMessage] = useState('')

  const inputClass =
    'w-full rounded-md border border-line bg-bg px-3 py-2.5 text-sm text-fg placeholder:text-muted'

  function handleChange(event) {
    const { name, value } = event.target
    setValues((current) => ({ ...current, [name]: value }))
  }

  async function handleSubmit(event) {
    event.preventDefault()

    const foundErrors = validate(values)
    setErrors(foundErrors)
    if (Object.keys(foundErrors).length > 0) return

    setStatus('sending')
    setErrorMessage('')

    try {
      await sendContactMessage({
        name: values.name.trim(),
        email: values.email.trim(),
        subject: values.subject.trim(),
        message: values.message.trim(),
        website: values.website, // hidden spam trap, explained below
      })
      setValues(emptyForm)
      setStatus('success')
    } catch (error) {
      // A network failure gives a technical message, so show a friendly one
      setErrorMessage(
        error instanceof TypeError
          ? 'Could not reach the server. Please try again later.'
          : error.message
      )
      setStatus('error')
    }
  }

  const sending = status === 'sending'

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-6">
      <Field id="name" label="Name" error={errors.name}>
        <input
          id="name" name="name" type="text" autoComplete="name"
          value={values.name} onChange={handleChange}
          aria-invalid={Boolean(errors.name)}
          aria-describedby={errors.name ? 'name-error' : undefined}
          className={inputClass}
        />
      </Field>

      <Field id="email" label="Email" error={errors.email}>
        <input
          id="email" name="email" type="email" autoComplete="email"
          value={values.email} onChange={handleChange}
          aria-invalid={Boolean(errors.email)}
          aria-describedby={errors.email ? 'email-error' : undefined}
          className={inputClass}
        />
      </Field>

      <Field id="subject" label="Subject" error={errors.subject} optional>
        <input
          id="subject" name="subject" type="text"
          value={values.subject} onChange={handleChange}
          aria-invalid={Boolean(errors.subject)}
          aria-describedby={errors.subject ? 'subject-error' : undefined}
          className={inputClass}
        />
      </Field>

      <Field id="message" label="Message" error={errors.message}>
        <textarea
          id="message" name="message" rows={6}
          value={values.message} onChange={handleChange}
          aria-invalid={Boolean(errors.message)}
          aria-describedby={errors.message ? 'message-error' : undefined}
          className={inputClass}
        />
      </Field>

      {/* Spam trap: real people never see or fill this. Simple bots often do.
          The server will reject any message where this is not empty. */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label htmlFor="website">Leave this field empty</label>
        <input
          id="website" name="website" type="text" tabIndex={-1}
          autoComplete="off" value={values.website} onChange={handleChange}
        />
      </div>

      <button
        type="submit"
        disabled={sending}
        className="inline-flex h-11 items-center justify-center rounded-md bg-fg px-6 text-sm font-medium text-bg transition-opacity hover:opacity-85 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {sending ? 'Sending...' : 'Send message'}
      </button>

      {/* role="status" and role="alert" make screen readers announce the result */}
      <div aria-live="polite">
        {status === 'success' && (
          <p role="status" className="rounded-md border border-line p-4 text-sm">
            Thank you. Your message has been sent.
          </p>
        )}
        {status === 'error' && (
          <p role="alert" className="rounded-md border border-fg p-4 text-sm">
            {errorMessage}
          </p>
        )}
      </div>
    </form>
  )
}

export default ContactForm