import dotenv from 'dotenv';
dotenv.config();
import express from 'express'
import Stripe from 'stripe'

const app = express()
const port = Number(process.env.PORT ?? 4242)
const clientOrigin = new URL(process.env.CLIENT_URL ?? 'http://localhost:5173').origin
const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY)
  : null

app.use((request, response, next) => {
  const origin = request.get('origin')
  if (origin && origin !== clientOrigin) {
    response.status(403).json({ error: 'This origin is not allowed.' })
    return
  }

  if (origin) {
    response.setHeader('Access-Control-Allow-Origin', origin)
    response.setHeader('Vary', 'Origin')
  }
  response.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (request.method === 'OPTIONS') {
    response.sendStatus(204)
    return
  }
  next()
})

app.use(express.json({ limit: '10kb' }))

app.post('/api/create-checkout-session', async (request, response) => {
  if (!stripe) {
    response.status(503).json({ error: 'Donations are not configured yet. Set STRIPE_SECRET_KEY on the API server.' })
    return
  }

  const { amountCents, frequency } = request.body ?? {}
  if (!Number.isSafeInteger(amountCents) || amountCents < 100 || amountCents > 500000) {
    response.status(400).json({ error: 'Donation amount must be between $1 and $5,000.' })
    return
  }
  if (frequency !== 'once' && frequency !== 'monthly') {
    response.status(400).json({ error: 'Choose a valid donation frequency.' })
    return
  }

  try {
    const checkoutSession = await stripe.checkout.sessions.create({
      mode: frequency === 'monthly' ? 'subscription' : 'payment',
      line_items: [{
        quantity: 1,
        price_data: {
          currency: 'usd',
          product_data: { name: 'Good Paws Rescue donation' },
          unit_amount: amountCents,
          ...(frequency === 'monthly' ? { recurring: { interval: 'month' } } : {}),
        },
      }],
      success_url: `${clientOrigin}/?donation=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${clientOrigin}/?donation=cancelled#donate`,
    })

    if (!checkoutSession.url) {
      response.status(502).json({ error: 'Stripe did not provide a checkout link.' })
      return
    }
    response.json({ url: checkoutSession.url })
  } catch (error) {
    console.error('Unable to create Stripe Checkout session:', error)
    response.status(502).json({ error: 'Unable to start checkout. Please try again.' })
  }
})

app.get('/api/checkout-session', async (request, response) => {
  if (!stripe) {
    response.status(503).json({ error: 'Donations are not configured yet. Set STRIPE_SECRET_KEY on the API server.' })
    return
  }

  const sessionId = request.query.session_id
  if (typeof sessionId !== 'string' || !/^cs_(test|live)_[A-Za-z0-9]+$/.test(sessionId)) {
    response.status(400).json({ error: 'A valid checkout session is required.' })
    return
  }

  try {
    const checkoutSession = await stripe.checkout.sessions.retrieve(sessionId)
    response.json({
      payment_status: checkoutSession.payment_status,
      amount_total: checkoutSession.amount_total,
      currency: checkoutSession.currency,
    })
  } catch (error) {
    console.error('Unable to retrieve Stripe Checkout session:', error)
    response.status(502).json({ error: 'Unable to verify this checkout session.' })
  }
})

app.use((error, _request, response, next) => {
  if (response.headersSent) {
    next(error)
    return
  }
  if (error instanceof SyntaxError && 'body' in error) {
    response.status(400).json({ error: 'Request body must be valid JSON.' })
    return
  }
  console.error('Unexpected API error:', error)
  response.status(500).json({ error: 'An unexpected server error occurred.' })
})

app.listen(port, () => {
  console.log(`Stripe donation API listening on port ${port}`)
})
