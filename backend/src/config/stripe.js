const stripe = require('stripe');

class StripeConfig {
  constructor() {
    const secretKey = process.env.STRIPE_SECRET_KEY;
    
    if (!secretKey) {
      console.warn('⚠️  Stripe configuration missing. Payment features will be disabled.');
      this.stripe = null;
      return;
    }
    
    this.stripe = stripe(secretKey);
  }
  
  static getInstance() {
    if (!StripeConfig.instance) {
      StripeConfig.instance = new StripeConfig();
    }
    return StripeConfig.instance;
  }
  
  getStripe() {
    return this.stripe;
  }
}

module.exports = StripeConfig;