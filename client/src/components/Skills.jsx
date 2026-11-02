import SectionHeading from './SectionHeading'
import { site } from '../config/site'

function Skills() {
  // Hide any category that has no skills yet
  const categories = site.skillCategories.filter((c) => c.items.length > 0)

  return (
    <section id="skills" className="scroll-mt-16 border-b border-line py-24">
      <SectionHeading label="Skills" title="Technologies I work with" />

      <div className="mt-10 grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((category) => (
          <div key={category.title}>
            <h3 className="text-sm font-semibold">{category.title}</h3>
            <ul className="mt-4 flex flex-wrap gap-2">
              {category.items.map((item) => (
                <li
                  key={item}
                  className="rounded-md border border-line px-3 py-1 font-mono text-xs text-muted"
                >
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  )
}

export default Skills