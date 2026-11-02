import SectionHeading from './SectionHeading'
import { site } from '../config/site'

function About() {
  return (
    <section id="about" className="scroll-mt-16 border-b border-line py-24">
      <SectionHeading label="About" title="A little about me" />

      <div className="mt-10 grid gap-12 md:grid-cols-5">
        <div className="space-y-5 text-base leading-relaxed text-muted md:col-span-3">
          {site.aboutParagraphs.map((text) => (
            <p key={text}>{text}</p>
          ))}
        </div>

        <dl className="md:col-span-2">
          {site.aboutFacts.map((fact) => (
            <div key={fact.label} className="border-t border-line py-4">
              <dt className="font-mono text-xs uppercase tracking-widest text-muted">
                {fact.label}
              </dt>
              <dd className="mt-1 text-sm">{fact.value}</dd>
              <dd className="mt-1 text-sm">{fact.institution}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  )
}

export default About