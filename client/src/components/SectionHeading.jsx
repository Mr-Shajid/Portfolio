function SectionHeading({ label, title }) {
  return (
    <div>
      <p className="font-mono text-xs uppercase tracking-widest text-muted">
        {label}
      </p>
      <h2 className="mt-2 text-3xl font-semibold tracking-tight">{title}</h2>
    </div>
  )
}

export default SectionHeading