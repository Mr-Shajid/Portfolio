import { ArrowUpRight } from 'lucide-react'
import SectionHeading from './SectionHeading'
import ContactForm from './ContactForm'
import { githubUrl } from '../config/site'

function Contact() {
  return (
    <section id="contact" className="relative scroll-mt-16 py-24">
      <SectionHeading label="Contact" title="Get in touch" />

      <div className="mt-10 grid gap-12 md:grid-cols-5">
        <div className="space-y-4 text-base leading-relaxed text-muted md:col-span-2">
          <p>
            If you would like to talk about a role, a project, or software
            quality, send me a message using the form.
          </p>
          <a
            href={githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-sm font-medium text-fg transition-opacity hover:opacity-70"
          >
            Or find me on GitHub
            <ArrowUpRight size={14} aria-hidden="true" />
          </a>
        </div>

        <div className="md:col-span-3">
          <ContactForm />
        </div>
      </div>
    </section>
  )
}

export default Contact