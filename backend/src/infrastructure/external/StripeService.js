// filepath: c:\Users\hugo\web-escalables\cafeteria-app\backend\src\infrastructure\external\StripeService.js
const StripeConfig = require('../../config/stripe');

class StripeService {
    constructor() {
        this.stripe = StripeConfig.getInstance().getStripe();
    }

    // Crear Payment Intent
    async createPaymentIntent(amount, currency = 'mxn', metadata = {}) {
        try {
            const paymentIntent = await this.stripe.paymentIntents.create({
                amount: Math.round(amount * 100), // Stripe maneja centavos
                currency,
                metadata,
                automatic_payment_methods: {
                    enabled: true
                }
            });

            return {
                id: paymentIntent.id,
                client_secret: paymentIntent.client_secret,
                amount: paymentIntent.amount,
                currency: paymentIntent.currency,
                status: paymentIntent.status,
                metadata: paymentIntent.metadata
            };
        } catch (error) {
            throw new Error(`Error creating payment intent: ${error.message}`);
        }
    }

    // Confirmar Payment Intent
    async confirmPaymentIntent(paymentIntentId) {
        try {
            const paymentIntent = await this.stripe.paymentIntents.confirm(paymentIntentId);
            
            return {
                id: paymentIntent.id,
                status: paymentIntent.status,
                amount: paymentIntent.amount,
                currency: paymentIntent.currency,
                payment_method: paymentIntent.payment_method,
                charges: paymentIntent.charges?.data || []
            };
        } catch (error) {
            throw new Error(`Error confirming payment intent: ${error.message}`);
        }
    }

    // Obtener información de Payment Intent
    async retrievePaymentIntent(paymentIntentId) {
        try {
            const paymentIntent = await this.stripe.paymentIntents.retrieve(paymentIntentId);
            
            return {
                id: paymentIntent.id,
                status: paymentIntent.status,
                amount: paymentIntent.amount,
                currency: paymentIntent.currency,
                payment_method: paymentIntent.payment_method,
                metadata: paymentIntent.metadata,
                created: paymentIntent.created,
                charges: paymentIntent.charges?.data || []
            };
        } catch (error) {
            throw new Error(`Error retrieving payment intent: ${error.message}`);
        }
    }

    // Procesar reembolso
    async createRefund(paymentIntentId, amount = null, reason = 'requested_by_customer') {
        try {
            const refundData = {
                payment_intent: paymentIntentId,
                reason
            };

            if (amount) {
                refundData.amount = Math.round(amount * 100);
            }

            const refund = await this.stripe.refunds.create(refundData);

            return {
                id: refund.id,
                amount: refund.amount,
                currency: refund.currency,
                status: refund.status,
                reason: refund.reason,
                payment_intent: refund.payment_intent,
                created: refund.created
            };
        } catch (error) {
            throw new Error(`Error creating refund: ${error.message}`);
        }
    }

    // Obtener información de reembolso
    async retrieveRefund(refundId) {
        try {
            const refund = await this.stripe.refunds.retrieve(refundId);
            
            return {
                id: refund.id,
                amount: refund.amount,
                currency: refund.currency,
                status: refund.status,
                reason: refund.reason,
                payment_intent: refund.payment_intent,
                created: refund.created
            };
        } catch (error) {
            throw new Error(`Error retrieving refund: ${error.message}`);
        }
    }

    // Listar reembolsos de un payment intent
    async listRefunds(paymentIntentId, limit = 10) {
        try {
            const refunds = await this.stripe.refunds.list({
                payment_intent: paymentIntentId,
                limit
            });

            return {
                data: refunds.data.map(refund => ({
                    id: refund.id,
                    amount: refund.amount,
                    currency: refund.currency,
                    status: refund.status,
                    reason: refund.reason,
                    created: refund.created
                })),
                has_more: refunds.has_more,
                total_count: refunds.data.length
            };
        } catch (error) {
            throw new Error(`Error listing refunds: ${error.message}`);
        }
    }

    // Crear customer
    async createCustomer(email, name = '', metadata = {}) {
        try {
            const customer = await this.stripe.customers.create({
                email,
                name,
                metadata
            });

            return {
                id: customer.id,
                email: customer.email,
                name: customer.name,
                created: customer.created,
                metadata: customer.metadata
            };
        } catch (error) {
            throw new Error(`Error creating customer: ${error.message}`);
        }
    }

    // Obtener customer
    async retrieveCustomer(customerId) {
        try {
            const customer = await this.stripe.customers.retrieve(customerId);
            
            return {
                id: customer.id,
                email: customer.email,
                name: customer.name,
                created: customer.created,
                metadata: customer.metadata
            };
        } catch (error) {
            throw new Error(`Error retrieving customer: ${error.message}`);
        }
    }

    // Actualizar customer
    async updateCustomer(customerId, updateData) {
        try {
            const customer = await this.stripe.customers.update(customerId, updateData);
            
            return {
                id: customer.id,
                email: customer.email,
                name: customer.name,
                metadata: customer.metadata
            };
        } catch (error) {
            throw new Error(`Error updating customer: ${error.message}`);
        }
    }

    // Obtener lista de payment intents con filtros
    async listPaymentIntents(filters = {}) {
        try {
            const {
                customer = null,
                created = null,
                limit = 10,
                starting_after = null,
                ending_before = null
            } = filters;

            const params = { limit };
            
            if (customer) params.customer = customer;
            if (created) params.created = created;
            if (starting_after) params.starting_after = starting_after;
            if (ending_before) params.ending_before = ending_before;

            const paymentIntents = await this.stripe.paymentIntents.list(params);

            return {
                data: paymentIntents.data.map(pi => ({
                    id: pi.id,
                    amount: pi.amount,
                    currency: pi.currency,
                    status: pi.status,
                    created: pi.created,
                    metadata: pi.metadata
                })),
                has_more: paymentIntents.has_more
            };
        } catch (error) {
            throw new Error(`Error listing payment intents: ${error.message}`);
        }
    }

    // Cancelar payment intent
    async cancelPaymentIntent(paymentIntentId, cancellation_reason = 'requested_by_customer') {
        try {
            const paymentIntent = await this.stripe.paymentIntents.cancel(paymentIntentId, {
                cancellation_reason
            });

            return {
                id: paymentIntent.id,
                status: paymentIntent.status,
                cancellation_reason: paymentIntent.cancellation_reason,
                canceled_at: paymentIntent.canceled_at
            };
        } catch (error) {
            throw new Error(`Error canceling payment intent: ${error.message}`);
        }
    }

    // Validar webhook
    validateWebhookSignature(payload, signature, secret) {
        try {
            return this.stripe.webhooks.constructEvent(payload, signature, secret);
        } catch (error) {
            throw new Error(`Webhook signature verification failed: ${error.message}`);
        }
    }

    // Convertir centavos a pesos
    convertFromCents(amount) {
        return amount / 100;
    }

    // Convertir pesos a centavos
    convertToCents(amount) {
        return Math.round(amount * 100);
    }

    // Formatear cantidad para mostrar
    formatAmount(amount, currency = 'MXN') {
        const formatter = new Intl.NumberFormat('es-MX', {
            style: 'currency',
            currency: currency.toUpperCase()
        });
        
        return formatter.format(this.convertFromCents(amount));
    }
}

module.exports = StripeService;