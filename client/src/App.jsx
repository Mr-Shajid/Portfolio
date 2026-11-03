import Navbar from './components/Navbar'
import Hero from './components/Hero'
import About from './components/About'
import Skills from './components/Skills'
import Projects from './components/Projects'

const placeholders = ['contact']

function App() {
  return (
    <>
      <Navbar />
      <main className="mx-auto w-full max-w-5xl px-6">
        <Hero />
        <About />
        <Skills />
        <Projects />

        {placeholders.map((id) => (
          <section
            key={id}
            id={id}
            className="flex min-h-[70vh] scroll-mt-16 items-center border-b border-line"
          >
            <div>
              <p className="font-mono text-xs uppercase tracking-widest text-muted">
                Temporary placeholder
              </p>
              <h2 className="mt-2 text-3xl font-semibold capitalize tracking-tight">
                {id}
              </h2>
            </div>
          </section>
        ))}
      </main>
    </>
  )
}

export default App