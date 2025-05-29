const StripeConfig = require('../../config/stripe');

class PaymentService {
  constructor() {
    this.stripe = StripeConfig.getInstance().getStripe();
    this.devMode = !this.stripe;
  }

  async createPaymentIntent(amount, currency = 'mxn', metadata = {}) {
    // En modo desarrollo/sin configuración de Stripe, simulamos el pago
    if (this.devMode) {
      console.log(`💳 [DEV] Simulando payment intent por $${amount} ${currency}`);
      return {
        id: 'dev_payment_intent_' + Date.now(),
        client_secret: 'dev_secret_' + Date.now(),
        status: 'succeeded'
      };
    }
    
    try {
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Stripe maneja centavos
        currency,
        metadata,
        automatic_payment_methods: {
          enabled: true
        }
      });

      return paymentIntent;
    } catch (error) {
      console.error('Error al crear payment intent:', error.message);
      // En caso de error con Stripe, también simulamos el pago en desarrollo
      if (process.env.NODE_ENV !== 'production') {
        console.log(`💳 [DEV] Fallback: Simulando payment intent después de error`);
        return {
          id: 'dev_payment_intent_' + Date.now(),
          client_secret: 'dev_secret_' + Date.now(),
          status: 'succeeded'
        };
      }
      throw new Error(`Error creating payment intent: ${error.message}`);
    }
  }
  async confirmPaymentIntent(paymentIntentId) {
    // En modo desarrollo/sin configuración de Stripe, simulamos la confirmación
    if (this.devMode) {
      console.log(`💳 [DEV] Simulando confirmación de pago: ${paymentIntentId}`);
      return {
        id: paymentIntentId,
        status: 'succeeded'
      };
    }
    
    try {
      const paymentIntent = await this.stripe.paymentIntents.retrieve(paymentIntentId);
      return paymentIntent;
    } catch (error) {
      console.error('Error al confirmar payment intent:', error.message);
      // En caso de error con Stripe, también simulamos la confirmación en desarrollo
      if (process.env.NODE_ENV !== 'production') {
        console.log(`💳 [DEV] Fallback: Simulando confirmación después de error`);
        return {
          id: paymentIntentId,
          status: 'succeeded'
        };
      }
      throw new Error(`Error confirming payment: ${error.message}`);
    }
  }

  async refundPayment(paymentIntentId, amount = null) {
    // En modo desarrollo/sin configuración de Stripe, simulamos el reembolso
    if (this.devMode) {
      console.log(`💳 [DEV] Simulando reembolso para: ${paymentIntentId}, monto: ${amount}`);
      return {
        id: 'dev_refund_' + Date.now(),
        status: 'succeeded'
      };
    }    
    try {
      const refund = await this.stripe.refunds.create({
        payment_intent: paymentIntentId,
        amount: amount ? Math.round(amount * 100) : undefined
      });

      return refund;
    } catch (error) {
      console.error('Error al procesar reembolso:', error.message);
      // En caso de error con Stripe, también simulamos el reembolso en desarrollo
      if (process.env.NODE_ENV !== 'production') {
        console.log(`💳 [DEV] Fallback: Simulando reembolso después de error`);
        return {
          id: 'dev_refund_' + Date.now(),
          status: 'succeeded'
        };
      }
      throw new Error(`Error processing refund: ${error.message}`);
    }
  }
}

module.exports = PaymentService;