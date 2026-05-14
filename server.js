require('dotenv').config();
const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const DOMAIN = process.env.DOMAIN || `http://localhost:${PORT}`;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Products — replace price IDs with your real Stripe price IDs
const PRODUCTS = [
  {
    id: 'sunflower-birthday',
    name: 'Sunflower Birthday',
    description: 'Bright sunflowers to make their birthday shine. Blank inside for your personal message.',
    price: 5.99,
    priceId: 'price_REPLACE_SUNFLOWER_BIRTHDAY',
    tag: 'Birthday',
    gradient: 'linear-gradient(135deg, #f9d423 0%, #f97316 100%)',
    emoji: '🌻',
  },
  {
    id: 'summer-garden',
    name: 'Summer Garden',
    description: 'A lush garden in full bloom. Perfect for any summer occasion or just because.',
    price: 5.99,
    priceId: 'price_REPLACE_SUMMER_GARDEN',
    tag: 'Just Because',
    gradient: 'linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)',
    emoji: '🌸',
  },
  {
    id: 'tropical-blooms',
    name: 'Tropical Blooms',
    description: 'Vibrant tropical flowers that transport you to paradise. Great for congratulations.',
    price: 6.99,
    priceId: 'price_REPLACE_TROPICAL_BLOOMS',
    tag: 'Congratulations',
    gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    emoji: '🌺',
  },
  {
    id: 'wildflower-love',
    name: 'Wildflower Love',
    description: 'A meadow of wildflowers for someone you adore. Ideal for anniversaries and romance.',
    price: 6.99,
    priceId: 'price_REPLACE_WILDFLOWER_LOVE',
    tag: 'Love & Romance',
    gradient: 'linear-gradient(135deg, #fccb90 0%, #d57eeb 100%)',
    emoji: '💐',
  },
  {
    id: 'daisy-thankyou',
    name: 'Daisy Thank You',
    description: 'A cheerful daisy bouquet to say thanks in the sweetest way possible.',
    price: 4.99,
    priceId: 'price_REPLACE_DAISY_THANKYOU',
    tag: 'Thank You',
    gradient: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
    emoji: '🌼',
  },
  {
    id: 'rose-anniversary',
    name: 'Rose Anniversary',
    description: 'Classic roses reimagined with a modern summer palette. Perfect for anniversaries.',
    price: 7.99,
    priceId: 'price_REPLACE_ROSE_ANNIVERSARY',
    tag: 'Anniversary',
    gradient: 'linear-gradient(135deg, #ff9a9e 0%, #fad0c4 100%)',
    emoji: '🌹',
  },
];

app.get('/api/products', (req, res) => {
  res.json(PRODUCTS);
});

app.post('/api/create-checkout-session', async (req, res) => {
  const { items } = req.body;

  if (!items || items.length === 0) {
    return res.status(400).json({ error: 'No items in cart' });
  }

  try {
    const lineItems = items.map(({ priceId, quantity }) => ({
      price: priceId,
      quantity,
    }));

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${DOMAIN}/success.html`,
      cancel_url: `${DOMAIN}/cancel.html`,
    });

    res.json({ url: session.url });
  } catch (err) {
    console.error('Stripe error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Liz's Card Shop running at http://localhost:${PORT}`);
});
