// Runs when no route matched
export function notFound(req, res) {
  res.status(404).json({ message: 'Not found' })
}

// Runs whenever next(error) is called or an error is thrown
export function errorHandler(error, req, res, next) {
  // Log the reason, but never the request body, cookies or passwords
  console.error(`${error.name}: ${error.message}`)

  // Invalid JSON sent by the client
  if (error.type === 'entity.parse.failed') {
    return res.status(400).json({ message: 'Invalid JSON in request body' })
  }

  // Request body too large
  if (error.type === 'entity.too.large') {
    return res.status(413).json({ message: 'Request body is too large' })
  }

  // Mongoose validation failed (for example a bad URL or missing title)
  if (error.name === 'ValidationError') {
    const details = Object.values(error.errors).map((e) => e.message)
    return res.status(400).json({ message: 'Validation failed', details })
  }

  // Invalid ID format, such as /api/projects/abc
  if (error.name === 'CastError') {
    return res.status(400).json({ message: 'Invalid ID' })
  }

  // Duplicate value on a unique field
  if (error.code === 11000) {
    return res.status(409).json({ message: 'That value already exists' })
  }

  // Anything else: never reveal details or stack traces to visitors
  res.status(500).json({ message: 'Something went wrong on the server' })
}