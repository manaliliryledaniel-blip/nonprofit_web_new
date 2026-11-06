import { useEffect, useState } from 'react'
import aboutContent from './content/about.json'
import './App.css'

type Page = 'home' | 'about'
type PageLinkHandler = (event: React.MouseEvent<HTMLAnchorElement>, page: Page) => void

type DonationApiResponse = {
  url?: string
  error?: string
  payment_status?: string
}

async function readDonationApiResponse(response: Response): Promise<DonationApiResponse> {
  try {
    return await response.json() as DonationApiResponse
  } catch {
    if (!response.ok) {
      return {
        error: response.status === 502
          ? 'The donation API is unreachable. Start it with npm run server, then try again.'
          : 'The donation service returned an unexpected response. Please try again.',
      }
    }
    throw new Error('The server returned an invalid response. Please try again.')
  }
}

const programs = [
  {
    number: '01',
    title: 'Rescue & recovery',
    description: 'A safe landing, patient care, and time to feel at home again.',
    icon: 'heart',
  },
  {
    number: '02',
    title: 'Foster families',
    description: 'Everyday homes give animals room to relax while they wait.',
    icon: 'home',
  },
  {
    number: '03',
    title: 'Thoughtful adoptions',
    description: 'We help each animal find a person who feels like their person.',
    icon: 'paw',
  },
]

function App() {
  const [page, setPage] = useState<Page>(() =>
    window.location.pathname.replace(/\/+$/, '') === '/about' ? 'about' : 'home',
  )

  useEffect(() => {
    const syncPage = () => {
      setPage(window.location.pathname.replace(/\/+$/, '') === '/about' ? 'about' : 'home')
    }
    window.addEventListener('popstate', syncPage)
    return () => window.removeEventListener('popstate', syncPage)
  }, [])

  function navigate(event: React.MouseEvent<HTMLAnchorElement>, nextPage: Page) {
    event.preventDefault()
    const path = nextPage === 'about' ? '/about' : '/'
    if (window.location.pathname !== path) window.history.pushState({}, '', path)
    setPage(nextPage)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="site-shell">
      <header className="site-header">
        <Brand navigate={navigate} />
        <nav className="main-nav" aria-label="Main navigation">
          <a className={page === 'home' ? 'nav-link active' : 'nav-link'} href="/" onClick={(event) => navigate(event, 'home')}>Home</a>
          <a className={page === 'about' ? 'nav-link active' : 'nav-link'} href="/about" onClick={(event) => navigate(event, 'about')}>About</a>
          <a className="nav-cta" href="/#donate">Help an animal <span aria-hidden="true">↗</span></a>
        </nav>
      </header>

      {page === 'home' ? <HomePage navigate={navigate} /> : <AboutPage />}

      <footer className="site-footer">
        <Brand navigate={navigate} />
        <p>More second chances. More happy tails.</p>
        <a className="footer-email" href="mailto:hello@goodpawsrescue.org">
          hello@goodpawsrescue.org <span aria-hidden="true">↗</span>
        </a>
      </footer>
    </div>
  )
}

function Brand({ navigate }: { navigate: PageLinkHandler }) {
  return (
    <a className="brand" href="/" onClick={(event) => navigate(event, 'home')} aria-label="Good Paws Rescue home">
      <span className="brand-mark" aria-hidden="true"><PawIcon /></span>
      <span className="brand-name">good paws<span>ANIMAL RESCUE</span></span>
    </a>
  )
}

function HomePage({ navigate }: { navigate: PageLinkHandler }) {
  return (
    <main>
      <section className="hero">
        <div className="hero-copy">
          <span className="eyebrow">A SECOND CHANCE STARTS HERE</span>
          <h1>Every good<br />story needs a<br /><em>paw-some turn.</em></h1>
          <p className="hero-intro">
            We give cats and dogs a safe place to land, kind people in their corner,
            and the chance to find a family of their own.
          </p>
          <div className="hero-actions">
            <a className="button button-primary" href="mailto:hello@goodpawsrescue.org?subject=I%27d%20like%20to%20adopt">
              Meet your match <span aria-hidden="true">↗</span>
            </a>
            <a className="text-link" href="/about" onClick={(event) => navigate(event, 'about')}>
              Our story <span aria-hidden="true">→</span>
            </a>
          </div>
        </div>
        <div className="hero-visual">
          <img
            className="hero-image"
            src="https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=1400&q=85"
            alt="A happy golden dog enjoying a sunny day outside"
          />
        </div>
      </section>

      <section className="welcome-section section-wrap">
        <div className="section-label"><span>01</span> A PLACE TO BEGIN AGAIN</div>
        <div className="welcome-content">
          <h2>From “what now?”<br />to <em>“welcome home.”</em></h2>
          <div className="welcome-aside">
            <p>
              A new start can be a lot to take in. We provide practical care,
              patient support, and a safe place for rescued animals to settle in.
            </p>
            <p>
              Then we bring together the right people — foster carers,
              adopters, and volunteers — to make the next chapter a good one.
            </p>
            <a className="text-link" href="/about" onClick={(event) => navigate(event, 'about')}>
              Get to know Good Paws <span aria-hidden="true">→</span>
            </a>
          </div>
        </div>
      </section>

      <section className="care-section">
        <div className="section-wrap">
          <div className="care-heading">
            <div>
              <div className="section-label light-label"><span>02</span> HOW WE HELP</div>
              <h2>Care first.<br /><em>Always.</em></h2>
            </div>
            <p>Every animal has their own story. We meet them where they are and take the next step at their pace.</p>
          </div>
          <div className="care-grid">
            {programs.map((program) => (
              <article className="care-card" key={program.number}>
                <div className="care-card-top">
                  <span className="care-number">{program.number}</span>
                  <CareIcon name={program.icon} />
                </div>
                <h3>{program.title}</h3>
                <p>{program.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="story-section section-wrap">
        <div className="story-image-wrap">
          <img
            src="https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?auto=format&fit=crop&w=1000&q=85"
            alt="A rescued dog being gently cared for by a person"
            loading="lazy"
          />
          <span className="photo-tag">ROOM TO FEEL SAFE</span>
        </div>
        <div className="story-copy">
          <span className="quote-mark" aria-hidden="true">“</span>
          <blockquote>It’s not just finding a home. It’s finding the right one.</blockquote>
          <p>We take time to understand each animal and the people hoping to welcome them. A thoughtful match is worth the wait.</p>
          <a className="text-link" href="/about" onClick={(event) => navigate(event, 'about')}>
            How we find a match <span aria-hidden="true">→</span>
          </a>
        </div>
      </section>

      <section className="join-section">
        <span className="eyebrow">GOOD PEOPLE MAKE GOOD PAWS</span>
        <h2>There’s more than<br /><em>one way to help.</em></h2>
        <p>Foster for a while, lend a hand, or help cover the everyday essentials. Every bit of care counts.</p>
        <DonationForm />
      </section>
    </main>
  )
}

function DonationForm() {
  const [amount, setAmount] = useState('25')
  const [frequency, setFrequency] = useState<'once' | 'monthly'>('once')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isPaymentSuccessful, setIsPaymentSuccessful] = useState(false)
  const [feedback, setFeedback] = useState(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get('donation') === 'cancelled') {
      return 'Your donation was cancelled. You can try again whenever you’re ready.'
    }
    if (params.get('donation') === 'success') {
      return params.get('session_id')
        ? 'Checking your donation…'
        : 'We could not verify your donation just yet.'
    }
    return ''
  })

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get('donation') === 'cancelled') return
    const sessionId = params.get('session_id')
    if (params.get('donation') !== 'success' || !sessionId) return

    let active = true
    fetch(`${import.meta.env.VITE_API_URL ?? ''}/api/checkout-session?session_id=${encodeURIComponent(sessionId)}`)
      .then(async (response) => {
        const result = await readDonationApiResponse(response)
        if (!response.ok) throw new Error(result.error ?? 'We could not verify your donation just yet.')
        if (active) {
          if (result.payment_status === 'paid') {
            setFeedback('')
            setIsPaymentSuccessful(true)
          } else {
            setFeedback('Your checkout is still processing. Please check back shortly.')
          }
        }
      })
      .catch((error: unknown) => {
        if (active) {
          setFeedback(error instanceof Error ? error.message : 'We could not verify your donation just yet.')
        }
      })

    return () => {
      active = false
    }
  }, [])

  async function startCheckout(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setFeedback('')

    const amountCents = Math.round(Number(amount) * 100)
    if (!Number.isSafeInteger(amountCents) || amountCents < 100 || amountCents > 500000) {
      setFeedback('Choose an amount between $1 and $5,000.')
      return
    }

    setIsSubmitting(true)
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL ?? ''}/api/create-checkout-session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amountCents, frequency }),
      })
      const result = await readDonationApiResponse(response)
      if (!response.ok || !result.url) {
        throw new Error(result.error ?? 'Unable to start checkout. Please try again.')
      }
      window.location.assign(result.url)
    } catch (error) {
      setFeedback(error instanceof TypeError
        ? 'Could not reach the donation API. Start it with npm run server, then try again.'
        : error instanceof Error ? error.message : 'Unable to start checkout. Please try again.')
      setIsSubmitting(false)
    }
  }

  return (
    <form className="donation-form" id="donate" onSubmit={startCheckout}>
      <label className="donation-label" htmlFor="donation-amount">Your donation (USD)</label>
      <div className="donation-presets" aria-label="Suggested donation amounts">
        {[15, 25, 50, 100].map((preset) => (
          <button
            className={amount === String(preset) ? 'donation-preset selected' : 'donation-preset'}
            key={preset}
            type="button"
            aria-pressed={amount === String(preset)}
            onClick={() => setAmount(String(preset))}
          >
            ${preset}
          </button>
        ))}
      </div>
      <div className="donation-options">
        <div className="custom-amount">
          <span aria-hidden="true">$</span>
          <input
            id="donation-amount"
            type="number"
            min="1"
            max="5000"
            step="0.01"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            required
          />
        </div>
        <label className="frequency-select">
          <span className="visually-hidden">Donation frequency</span>
          <select value={frequency} onChange={(event) => setFrequency(event.target.value as 'once' | 'monthly')}>
            <option value="once">One-time</option>
            <option value="monthly">Monthly</option>
          </select>
        </label>
        <button className="button button-primary donate-button" type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Opening checkout…' : 'Donate securely'} <span aria-hidden="true">↗</span>
        </button>
      </div>
      <p className="donation-note">Secure payment powered by Stripe. Donations are processed in USD.</p>
      {feedback && <p className="donation-feedback" role="status">{feedback}</p>}
      {isPaymentSuccessful && (
        <div className="payment-success-backdrop">
          <section className="payment-success-dialog" role="dialog" aria-modal="true" aria-labelledby="payment-success-title" aria-describedby="payment-success-message">
            <span className="payment-success-mark" aria-hidden="true">✓</span>
            <h2 id="payment-success-title">Payment successful</h2>
            <p id="payment-success-message">Thank you for helping animals find a safe place to land!</p>
            <button className="button button-primary" type="button" autoFocus onClick={() => setIsPaymentSuccessful(false)}>
              Done
            </button>
          </section>
        </div>
      )}
    </form>
  )
}

function AboutPage() {
  return (
    <main className="about-page">
      <section className="about-hero">
        <div className="about-hero-copy">
          <span className="eyebrow">{aboutContent.hero.eyebrow}</span>
          <h1>{aboutContent.hero.heading} <em>{aboutContent.hero.emphasis}</em></h1>
          <h2 className="about-tagline">
            {aboutContent.hero.tagline.map((line, index) => (
              <span key={line}>{index > 0 && <br />}{line}</span>
            ))}
          </h2>
          <p>{aboutContent.hero.introduction}</p>
        </div>
        <div className="about-hero-image">
          <img
            src={aboutContent.hero.image.src}
            alt={aboutContent.hero.image.alt}
          />
        </div>
      </section>

      <section className="about-mission section-wrap">
        <div className="section-label">{aboutContent.mission.eyebrow}</div>
        <div className="mission-content">
          <h2>{aboutContent.mission.heading} <em>{aboutContent.mission.emphasis}</em></h2>
          <div>
            {aboutContent.mission.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
          </div>
        </div>
      </section>

    </main>
  )
}

function PawIcon() {
  return (
    <svg viewBox="0 0 48 48" fill="none">
      <ellipse cx="13" cy="16" rx="4" ry="6" transform="rotate(-24 13 16)" />
      <ellipse cx="23" cy="11" rx="4" ry="6" />
      <ellipse cx="34" cy="16" rx="4" ry="6" transform="rotate(24 34 16)" />
      <path d="M10 31c0-6 6-11 14-11s14 5 14 11-5 9-10 7c-3-1-5-1-8 0-5 2-10-1-10-7Z" />
    </svg>
  )
}

function CareIcon({ name }: { name: string }) {
  if (name === 'heart') {
    return <svg className="care-icon" viewBox="0 0 48 48" fill="none" aria-hidden="true"><path d="M24 39S7 29 7 17c0-8 10-12 17-3 7-9 17-5 17 3 0 12-17 22-17 22Z" /><path d="m17 24 5 5 10-11" /></svg>
  }
  if (name === 'home') {
    return <svg className="care-icon" viewBox="0 0 48 48" fill="none" aria-hidden="true"><path d="m6 22 18-15 18 15M11 19v22h26V19M20 41V28h8v13" /><path d="M31 12V8h5v8" /></svg>
  }
  return <span className="care-icon-paw"><PawIcon /></span>
}

export default App
