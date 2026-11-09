import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  createAdminProject,
  getAdminProject,
  updateAdminProject,
} from '../../api/adminProjects'
import { useAuth } from '../../hooks/useAuth'
import { isSafeUrl } from '../../utils/safeUrl'

const emptyForm = {
  title: '',
  description: '',
  problemStatement: '',
  category: 'General',
  featuresText: '', // one feature per line
  technologiesText: '', // separated by commas
  imageUrl: '',
  githubUrl: '',
  liveUrl: '',
  displayOrder: '0',
  featured: false,
  published: false,
}

function splitLines(text) {
  return text.split('\n').map((s) => s.trim()).filter(Boolean)
}

function splitCommas(text) {
  return text.split(',').map((s) => s.trim()).filter(Boolean)
}

// Turns a project from the API into the text-based form values
function fromProject(p) {
  return {
    title: p.title,
    description: p.description,
    problemStatement: p.problemStatement || '',
    category: p.category || '',
    featuresText: (p.features || []).join('\n'),
    technologiesText: (p.technologies || []).join(', '),
    imageUrl: p.imageUrl || '',
    githubUrl: p.githubUrl || '',
    liveUrl: p.liveUrl || '',
    displayOrder: String(p.displayOrder ?? 0),
    featured: Boolean(p.featured),
    published: Boolean(p.published),
  }
}

// Turns the form values into what the API expects
function toPayload(v) {
  return {
    title: v.title.trim(),
    description: v.description.trim(),
    problemStatement: v.problemStatement.trim(),
    category: v.category.trim(),
    features: splitLines(v.featuresText),
    technologies: splitCommas(v.technologiesText),
    imageUrl: v.imageUrl.trim(),
    githubUrl: v.githubUrl.trim(),
    liveUrl: v.liveUrl.trim(),
    displayOrder: Number(v.displayOrder),
    featured: v.featured,
    published: v.published,
  }
}

// Same rules as the server, so people get quick feedback.
// The server still checks everything again.
function validate(v) {
  const errors = {}
  const features = splitLines(v.featuresText)
  const technologies = splitCommas(v.technologiesText)

  if (!v.title.trim()) errors.title = 'Title is required.'
  else if (v.title.trim().length > 100) errors.title = 'Title must be 100 characters or fewer.'

  if (!v.description.trim()) errors.description = 'Description is required.'
  else if (v.description.trim().length > 500) errors.description = 'Description must be 500 characters or fewer.'

  if (v.problemStatement.trim().length > 500) errors.problemStatement = 'Problem must be 500 characters or fewer.'
  if (v.category.trim().length > 40) errors.category = 'Category must be 40 characters or fewer.'

  if (features.length > 10) errors.featuresText = 'Use at most 10 features.'
  else if (features.some((f) => f.length > 150)) errors.featuresText = 'Each feature must be 150 characters or fewer.'

  if (technologies.length > 15) errors.technologiesText = 'Use at most 15 technologies.'
  else if (technologies.some((t) => t.length > 40)) errors.technologiesText = 'Each technology must be 40 characters or fewer.'

  for (const field of ['imageUrl', 'githubUrl', 'liveUrl']) {
    const value = v[field].trim()
    if (value.length > 500) errors[field] = 'URL must be 500 characters or fewer.'
    else if (value && !isSafeUrl(value)) errors[field] = 'Enter a full http or https address.'
  }

  if (!/^\d+$/.test(v.displayOrder.trim()) || Number(v.displayOrder) > 10000) {
    errors.displayOrder = 'Use a whole number from 0 to 10000.'
  }

  return errors
}

function Field({ label, name, hint, error, children }) {
  return (
    <div>
      <label htmlFor={name} className="block text-sm font-medium">{label}</label>
      {hint && <p className="mt-1 text-xs text-muted">{hint}</p>}
      <div className="mt-2">{children}</div>
      {error && <p id={`${name}-error`} className="mt-2 text-sm">{error}</p>}
    </div>
  )
}

function ProjectForm() {
  const { id } = useParams() // present when editing, missing when creating
  const isEdit = Boolean(id)
  const navigate = useNavigate()
  const { logout } = useAuth()

  const [values, setValues] = useState(emptyForm)
  const [errors, setErrors] = useState({})
  const [loadState, setLoadState] = useState(isEdit ? 'loading' : 'ready')
  const [saving, setSaving] = useState(false)
  const [serverError, setServerError] = useState('')
  const [serverDetails, setServerDetails] = useState([])

  // When editing, load the existing project
  useEffect(() => {
    if (!isEdit) return
    let cancelled = false

    getAdminProject(id)
      .then((project) => {
        if (cancelled) return
        setValues(fromProject(project))
        setLoadState('ready')
      })
      .catch((error) => {
        if (cancelled) return
        if (error.status === 401) {
          logout()
          return
        }
        setLoadState(error.status === 404 ? 'missing' : 'error')
      })

    return () => {
      cancelled = true
    }
  }, [id, isEdit, logout])

  function handleChange(event) {
    const { name, value, type, checked } = event.target
    setValues((current) => ({ ...current, [name]: type === 'checkbox' ? checked : value }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setServerError('')
    setServerDetails([])

    const found = validate(values)
    setErrors(found)
    if (Object.keys(found).length > 0) return

    setSaving(true)
    try {
      const payload = toPayload(values)
      if (isEdit) await updateAdminProject(id, payload)
      else await createAdminProject(payload)

      navigate('/admin', {
        state: { message: isEdit ? 'Project updated.' : 'Project created.' },
      })
    } catch (error) {
      if (error.status === 401) {
        await logout()
        return
      }
      setServerError(
        error instanceof TypeError
          ? 'Could not reach the server. Please try again.'
          : error.message
      )
      setServerDetails(error.details || [])
      setSaving(false)
    }
  }

  const inputClass = 'w-full rounded-md border border-line bg-bg px-3 py-2.5 text-sm text-fg'

  // Shared attributes for every text input
  function inputProps(name) {
    return {
      id: name,
      name,
      value: values[name],
      onChange: handleChange,
      'aria-invalid': Boolean(errors[name]),
      'aria-describedby': errors[name] ? `${name}-error` : undefined,
      className: inputClass,
    }
  }

  if (loadState === 'loading') {
    return <p className="p-6 text-sm text-muted">Loading project...</p>
  }
  if (loadState === 'missing' || loadState === 'error') {
    return (
      <div className="mx-auto max-w-2xl px-6 py-10">
        <p className="text-sm">
          {loadState === 'missing' ? 'Project not found.' : 'This project could not be loaded.'}
        </p>
        <Link to="/admin" className="mt-4 inline-block text-sm text-muted hover:text-fg">
          Back to dashboard
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-2xl px-6 py-10">
      <Link to="/admin" className="text-sm text-muted hover:text-fg">Back to dashboard</Link>
      <h1 className="mt-4 text-2xl font-semibold tracking-tight">
        {isEdit ? 'Edit project' : 'New project'}
      </h1>

      <form onSubmit={handleSubmit} noValidate className="mt-8 space-y-6">
        <Field label="Title" name="title" error={errors.title}>
          <input type="text" {...inputProps('title')} />
        </Field>

        <Field label="Short description" name="description" error={errors.description}>
          <textarea rows={3} {...inputProps('description')} />
        </Field>

        <Field label="Problem it solves (optional)" name="problemStatement" error={errors.problemStatement}>
          <textarea rows={3} {...inputProps('problemStatement')} />
        </Field>

        <Field label="Category" name="category" error={errors.category}>
          <input type="text" {...inputProps('category')} />
        </Field>

        <Field label="Key features (optional)" name="featuresText" hint="One feature per line, up to 10." error={errors.featuresText}>
          <textarea rows={4} {...inputProps('featuresText')} />
        </Field>

        <Field label="Technologies (optional)" name="technologiesText" hint="Separate with commas, for example: React, Node.js, MongoDB." error={errors.technologiesText}>
          <input type="text" {...inputProps('technologiesText')} />
        </Field>

        <Field label="GitHub repository URL (optional)" name="githubUrl" error={errors.githubUrl}>
          <input type="url" {...inputProps('githubUrl')} />
        </Field>

        <Field label="Live demo URL (optional)" name="liveUrl" hint="Leave empty if there is no live demo. The site will show 'Demo unavailable'." error={errors.liveUrl}>
          <input type="url" {...inputProps('liveUrl')} />
        </Field>

        <Field label="Screenshot URL (optional)" name="imageUrl" error={errors.imageUrl}>
          <input type="url" {...inputProps('imageUrl')} />
        </Field>

        <Field label="Display order" name="displayOrder" hint="Lower numbers appear first." error={errors.displayOrder}>
          <input type="number" min="0" max="10000" {...inputProps('displayOrder')} />
        </Field>

        <div className="space-y-3">
          <label className="flex items-center gap-3 text-sm">
            <input type="checkbox" name="published" checked={values.published} onChange={handleChange} className="h-4 w-4" />
            Published (visible on the public site)
          </label>
          <label className="flex items-center gap-3 text-sm">
            <input type="checkbox" name="featured" checked={values.featured} onChange={handleChange} className="h-4 w-4" />
            Featured
          </label>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex h-11 items-center justify-center rounded-md bg-fg px-6 text-sm font-medium text-bg transition-opacity hover:opacity-85 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? 'Saving...' : isEdit ? 'Save changes' : 'Create project'}
          </button>
          <Link to="/admin" className="text-sm text-muted hover:text-fg">Cancel</Link>
        </div>

        <div aria-live="polite">
          {serverError && (
            <div role="alert" className="rounded-md border border-fg p-4 text-sm">
              <p>{serverError}</p>
              {serverDetails.length > 0 && (
                <ul className="mt-2 list-disc pl-5">
                  {serverDetails.map((detail) => (
                    <li key={detail}>{detail}</li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      </form>
    </div>
  )
}

export default ProjectForm