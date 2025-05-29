const Mailgun = require('mailgun-js');

class MailConfig {
  constructor() {
    const apiKey = process.env.MAILGUN_API_KEY || process.env.MAILGUN_SECRET;
    const domain = process.env.MAILGUN_DOMAIN;
    
    if (!apiKey || !domain) {
      console.warn('⚠️  Mailgun configuration missing. Email features will be disabled.');
      this.mailgun = null;
      return;
    }
    
    this.mailgun = Mailgun({
      apiKey: apiKey,
      domain: domain
    });
  }
  
  static getInstance() {
    if (!MailConfig.instance) {
      MailConfig.instance = new MailConfig();
    }
    return MailConfig.instance;
  }
  
  getMailgun() {
    return this.mailgun;
  }
}

module.exports = MailConfig;