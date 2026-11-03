import { site } from '../config/site'

function Footer() {
  return (
    <footer className="border-t border-line">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-2 px-6 py-8 text-sm text-muted sm:flex-row sm:items-center sm:justify-between">
        <p>
          &copy; {new Date().getFullYear()} {site.name}
        </p>
        <p>Built with React, Express and MongoDB.</p>
      </div>
    </footer>
  )
}

export default Footer