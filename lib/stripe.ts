import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  console.warn('STRIPE_SECRET_KEY not set - Stripe features will be disabled');
}

export const stripe = process.env.STRIPE_SECRET_KEY 
  ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2026-01-28.clover' })
  : null;

export async function createCustomer(email: string, name?: string) {
  if (!stripe) throw new Error('Stripe not configured');
  
  return stripe.customers.create({
    email,
    name: name || undefined,
  });
}

export async function chargeCustomer(
  customerId: string,
  amount: number,
  description: string
) {
  if (!stripe) throw new Error('Stripe not configured');
  
  // Amount in cents
  const amountInCents = Math.round(amount * 100);
  
  return stripe.paymentIntents.create({
    amount: amountInCents,
    currency: 'usd',
    customer: customerId,
    description,
    automatic_payment_methods: {
      enabled: true,
    },
  });
}

export async function getPaymentMethods(customerId: string) {
  if (!stripe) throw new Error('Stripe not configured');
  
  return stripe.paymentMethods.list({
    customer: customerId,
    type: 'card',
  });
}

export async function createCheckoutSession(
  customerId: string,
  priceId: string,
  successUrl: string,
  cancelUrl: string
) {
  if (!stripe) throw new Error('Stripe not configured');
  
  return stripe.checkout.sessions.create({
    customer: customerId,
    payment_method_types: ['card'],
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    mode: 'subscription',
    success_url: successUrl,
    cancel_url: cancelUrl,
  });
}
