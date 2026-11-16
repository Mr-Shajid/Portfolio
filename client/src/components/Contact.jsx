import { ArrowUpRight } from 'lucide-react'
import SectionHeading from './SectionHeading'
import ContactForm from './ContactForm'
import { githubUrl, site } from '../config/site'
import { isSafeUrl } from '../utils/safeUrl'

function Contact() {
  // The photo link only works for a valid http or https address
  const hasLinkedin = isSafeUrl(site.linkedinUrl)

  const photo = (
    <img
      src={site.photoFile}
      alt={`Portrait of ${site.name}`}
      width="400"
      height="400"
      loading="lazy"
      decoding="async"
      className="aspect-square w-full border border-line object-cover grayscale-20 transition duration-300 group-hover:grayscale-0 group-focus-visible:grayscale-0"
    />
  )

  return (
    <section id="contact" className="relative scroll-mt-16 py-24">
      <SectionHeading label="Contact" title="Get in touch" />

      <div className="mt-10 grid gap-12 md:grid-cols-5">
        <div className="space-y-6 md:col-span-2">
          {site.photoAvailable &&
            (hasLinkedin ? (
              <a
                href={site.linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group block w-full max-w-xs"
              >
                {photo}
                <span className="mt-3 inline-flex items-center gap-1 text-sm font-medium">
                  View my LinkedIn profile
                  <ArrowUpRight size={14} aria-hidden="true" />
                  <span className="sr-only">(opens in a new tab)</span>
                </span>
              </a>
            ) : (
              <div className="w-full max-w-xs">{photo}</div>
            ))}

          <div className="space-y-4 text-base leading-relaxed text-muted">
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
        </div>

        <div className="md:col-span-3">
          <ContactForm />
        </div>
      </div>
    </section>
  )
}

export default Contact