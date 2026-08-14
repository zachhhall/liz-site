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
    name: 'Winter Girl with Pooh 24',
    description: 'A quality greeting card that will be loved by anyone who receives it.',
    price: 5.99,
    priceId: 'price_1QgILW01dncEQPi1JYuVBlhw',
    tag: 'Birthday',
    gradient: 'linear-gradient(135deg, #f9d423 0%, #f97316 100%)',
    image: 'poo.jpg',
  },
  {
    id: 'summer-garden',
    name: 'Stay Cozy Coffee Cup',
    description: 'A quality greeting card that will be loved by anyone who receives it.',
    price: 5.99,
    priceId: 'price_1QgIK501dncEQPi1sbSlfrb0',
    tag: 'Just Because',
    gradient: 'linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)',
    image: 'coffee.jpg',
  },
  {
    id: 'tropical-blooms',
    name: 'Snowman with Seamus',
    description: 'A quality greeting card that will be loved by anyone who receives it.',
    price: 5.99,
    priceId: 'price_1QgIHd01dncEQPi1Ugfdzbvi',
    tag: 'Congratulations',
    gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    image: 'snow.jpg',
  },
  {
    id: 'wildflower-love',
    name: 'Snowman with Bunny',
    description: 'A quality greeting card that will be loved by anyone who receives it.',
    price: 5.99,
    priceId: 'price_1QgI3l01dncEQPi1sHV3NvO1',
    tag: 'Love & Romance',
    gradient: 'linear-gradient(135deg, #fccb90 0%, #d57eeb 100%)',
    image: 'snow2.jpg',
  },
  {
    id: 'daisy-thankyou',
    name: 'Rockefeller Center',
    description: 'A quality greeting card that will be loved by anyone who receives it.',
    price: 5.99,
    priceId: 'price_1QgI2i01dncEQPi17L2dmHRO',
    tag: 'Thank You',
    gradient: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
    image: 'rock.jpg',
  },
  {
    id: 'rose-anniversary',
    name: 'Grumpy Cat',
    description: 'A quality greeting card that will be loved by anyone who receives it.',
    price: 5.99,
    priceId: 'price_1Qe7mB01dncEQPi16uO8BiTo',
    tag: 'Anniversary',
    gradient: 'linear-gradient(135deg, #ff9a9e 0%, #fad0c4 100%)',
    image: 'grump.jpg',
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
