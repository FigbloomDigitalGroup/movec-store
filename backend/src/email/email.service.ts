import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as SibApiV3Sdk from 'sib-api-v3-sdk';
import * as nodemailer from 'nodemailer';
import { getPrimaryFrontendUrl } from '../common/frontend-url';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private apiInstance: SibApiV3Sdk.TransactionalEmailsApi;
  private transporter: nodemailer.Transporter;
  private fromEmail: string;
  private fromName: string;
  private smtpFrom: string;
  private frontendUrl: string;

  constructor(private configService: ConfigService) {
    this.fromEmail = this.configService.get<string>(
      'BREVO_FROM_EMAIL',
      'noreply@starlinkcctv.co.ke',
    );
    this.fromName = this.configService.get<string>(
      'BREVO_FROM_NAME',
      'Movec Store',
    );
    this.frontendUrl = getPrimaryFrontendUrl(this.configService);

    // 1. Try to initialize Brevo transactional email client
    const apiKey = this.configService.get<string>('BREVO_API_KEY');
    if (apiKey) {
      const client = SibApiV3Sdk.ApiClient.instance;
      const apiKeyInstance = client.authentications['api-key'];
      apiKeyInstance.apiKey = apiKey;
      this.apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
    }

    // 2. Try to initialize SMTP transporter
    const smtpHost = this.configService.get<string>('SMTP_HOST');
    const smtpPort = this.configService.get<number>('SMTP_PORT');
    const smtpSecure = this.configService.get<string>('SMTP_SECURE') === 'true';
    const smtpUser = this.configService.get<string>('SMTP_USER');
    const smtpPass = this.configService.get<string>('SMTP_PASS');
    this.smtpFrom = this.configService.get<string>(
      'SMTP_FROM',
      `"${this.fromName}" <${this.fromEmail}>`,
    );

    if (smtpHost && smtpUser && smtpPass) {
      this.transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort ? Number(smtpPort) : 587,
        secure: smtpSecure,
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
      });
      this.logger.log(
        `SMTP Transporter initialized for host ${smtpHost} using user ${smtpUser}`,
      );
    }
  }

  async sendVerificationEmail(toEmail: string, toName: string, token: string) {
    const verificationLink = `${this.frontendUrl}/verify-email?token=${token}`;
    const subject = 'Verify your email - Movec Store';
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1e40af;">Welcome to Movec Store!</h2>
        <p>Hi ${toName},</p>
        <p>Thank you for registering. Please verify your email address by clicking the button below:</p>
        <a href="${verificationLink}" style="display: inline-block; background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; margin: 16px 0;">
          Verify Email
        </a>
        <p>Or copy this link: ${verificationLink}</p>
        <p>This link expires in 24 hours.</p>
        <hr style="border: 1px solid #e5e7eb; margin: 24px 0;" />
        <p style="color: #6b7280; font-size: 12px;">Movec Store, Nairobi, Kenya</p>
      </div>
    `;

    // Try sending via SMTP first
    if (this.transporter) {
      try {
        await this.transporter.sendMail({
          from: this.smtpFrom,
          to: `"${toName}" <${toEmail}>`,
          subject,
          html: htmlContent,
        });
        this.logger.log(`Verification email sent to ${toEmail} via SMTP`);
        return;
      } catch (error) {
        this.logger.error('Failed to send verification email via SMTP:', error);
      }
    }

    // Fallback to Brevo
    if (!this.apiInstance) {
      this.logger.warn(
        'Neither SMTP nor Brevo is configured. Verification token:',
        token,
      );
      return;
    }

    const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
    sendSmtpEmail.to = [{ email: toEmail, name: toName }];
    sendSmtpEmail.sender = { email: this.fromEmail, name: this.fromName };
    sendSmtpEmail.subject = subject;
    sendSmtpEmail.htmlContent = htmlContent;

    try {
      await this.apiInstance.sendTransacEmail(sendSmtpEmail);
      this.logger.log(`Verification email sent to ${toEmail} via Brevo`);
    } catch (error) {
      this.logger.error('Failed to send verification email via Brevo:', error);
    }
  }

  async sendPasswordResetEmail(toEmail: string, toName: string, token: string) {
    const resetLink = `${this.frontendUrl}/reset-password?token=${token}`;
    const subject = 'Reset your password - Movec Store';
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1e40af;">Password Reset</h2>
        <p>Hi ${toName},</p>
        <p>We received a request to reset your password. Click the button below to set a new password:</p>
        <a href="${resetLink}" style="display: inline-block; background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; margin: 16px 0;">
          Reset Password
        </a>
        <p>Or copy this link: ${resetLink}</p>
        <p>This link expires in 1 hour.</p>
        <p>If you didn't request this, please ignore this email.</p>
        <hr style="border: 1px solid #e5e7eb; margin: 24px 0;" />
        <p style="color: #6b7280; font-size: 12px;">Movec Store, Nairobi, Kenya</p>
      </div>
    `;

    // Try sending via SMTP first
    if (this.transporter) {
      try {
        await this.transporter.sendMail({
          from: this.smtpFrom,
          to: `"${toName}" <${toEmail}>`,
          subject,
          html: htmlContent,
        });
        this.logger.log(`Password reset email sent to ${toEmail} via SMTP`);
        return;
      } catch (error) {
        this.logger.error(
          'Failed to send password reset email via SMTP:',
          error,
        );
      }
    }

    // Fallback to Brevo
    if (!this.apiInstance) {
      this.logger.warn(
        'Neither SMTP nor Brevo is configured. Reset token:',
        token,
      );
      return;
    }

    const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
    sendSmtpEmail.to = [{ email: toEmail, name: toName }];
    sendSmtpEmail.sender = { email: this.fromEmail, name: this.fromName };
    sendSmtpEmail.subject = subject;
    sendSmtpEmail.htmlContent = htmlContent;

    try {
      await this.apiInstance.sendTransacEmail(sendSmtpEmail);
      this.logger.log(`Password reset email sent to ${toEmail} via Brevo`);
    } catch (error) {
      this.logger.error(
        'Failed to send password reset email via Brevo:',
        error,
      );
    }
  }

  async sendOrderConfirmation(params: {
    toEmail: string;
    toName: string;
    orderNumber: string;
    orderDate: Date;
    items: { name: string; sku?: string; quantity: number; price: number }[];
    subtotal: number;
    shippingCost: number;
    taxAmount: number;
    discountAmount: number;
    total: number;
    currency?: string;
    paymentMethod?: string;
    shippingAddress?: {
      line1: string;
      line2?: string | null;
      city: string;
      state?: string | null;
      postalCode: string;
      country: string;
    };
  }) {
    const {
      toEmail,
      toName,
      orderNumber,
      orderDate,
      items,
      subtotal,
      shippingCost,
      taxAmount,
      discountAmount,
      total,
      currency = 'KES',
      paymentMethod,
      shippingAddress,
    } = params;

    const logoUrl = `${this.frontendUrl}/logo.png`;
    const orderUrl = `${this.frontendUrl}/orders/${orderNumber}`;
    const formatMoney = (amount: number) =>
      `${currency} ${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    const formatPaymentMethod = (method: string) =>
      method
        .split('_')
        .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
        .join(' ');
    const formattedDate = orderDate.toLocaleDateString('en-KE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    const itemRows = items
      .map(
        (item) => `
          <tr>
            <td style="padding: 12px 0; border-bottom: 1px solid #eef0ee;">
              <div style="font-weight: 600; color: #1a1f1b;">${item.name}</div>
              ${item.sku ? `<div style="font-size: 12px; color: #717a73;">SKU: ${item.sku}</div>` : ''}
            </td>
            <td style="padding: 12px 0; border-bottom: 1px solid #eef0ee; text-align: center; color: #4b534d;">${item.quantity}</td>
            <td style="padding: 12px 0; border-bottom: 1px solid #eef0ee; text-align: right; color: #1a1f1b;">${formatMoney(item.price * item.quantity)}</td>
          </tr>
        `,
      )
      .join('');

    const summaryRow = (label: string, value: string, bold = false) => `
      <tr>
        <td style="padding: 4px 0; color: ${bold ? '#1a1f1b' : '#717a73'}; font-weight: ${bold ? '700' : '400'};">${label}</td>
        <td style="padding: 4px 0; text-align: right; color: ${bold ? '#1a1f1b' : '#717a73'}; font-weight: ${bold ? '700' : '400'};">${value}</td>
      </tr>
    `;

    const subject = `Your receipt for order ${orderNumber} - Movec Store`;
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff;">
        <div style="background-color: #ffffff; padding: 24px 32px; text-align: center; border-bottom: 3px solid #10b982;">
          <img src="${logoUrl}" alt="Movec Store" height="48" style="height: 48px; display: inline-block;" />
        </div>

        <div style="padding: 32px;">
          <div style="text-align: center; margin-bottom: 24px;">
            <div style="display: inline-block; width: 56px; height: 56px; border-radius: 50%; background-color: #ecfdf5; line-height: 56px; font-size: 28px; color: #10b982;">&#10003;</div>
            <h1 style="font-size: 20px; color: #1a1f1b; margin: 16px 0 4px;">Payment received &mdash; thank you!</h1>
            <p style="color: #717a73; margin: 0;">Hi ${toName}, here's your receipt for order <strong>${orderNumber}</strong>.</p>
          </div>

          <table width="100%" style="border-collapse: collapse; margin-bottom: 24px; background-color: #f7f7f5; border-radius: 8px;" cellpadding="0" cellspacing="0">
            <tr>
              <td style="padding: 16px 20px; font-size: 13px; color: #717a73;">Order number</td>
              <td style="padding: 16px 20px; font-size: 13px; color: #1a1f1b; text-align: right; font-weight: 600;">${orderNumber}</td>
            </tr>
            <tr>
              <td style="padding: 0 20px 16px; font-size: 13px; color: #717a73;">Date</td>
              <td style="padding: 0 20px 16px; font-size: 13px; color: #1a1f1b; text-align: right; font-weight: 600;">${formattedDate}</td>
            </tr>
            ${
              paymentMethod
                ? `<tr>
                    <td style="padding: 0 20px 16px; font-size: 13px; color: #717a73;">Payment method</td>
                    <td style="padding: 0 20px 16px; font-size: 13px; color: #1a1f1b; text-align: right; font-weight: 600;">${formatPaymentMethod(paymentMethod)}</td>
                  </tr>`
                : ''
            }
          </table>

          <table width="100%" style="border-collapse: collapse; margin-bottom: 8px;" cellpadding="0" cellspacing="0">
            <thead>
              <tr>
                <th align="left" style="padding-bottom: 8px; border-bottom: 2px solid #1a1f1b; font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em; color: #4b534d;">Item</th>
                <th align="center" style="padding-bottom: 8px; border-bottom: 2px solid #1a1f1b; font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em; color: #4b534d;">Qty</th>
                <th align="right" style="padding-bottom: 8px; border-bottom: 2px solid #1a1f1b; font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em; color: #4b534d;">Amount</th>
              </tr>
            </thead>
            <tbody>
              ${itemRows}
            </tbody>
          </table>

          <table width="100%" style="border-collapse: collapse; margin: 16px 0 24px;" cellpadding="0" cellspacing="0">
            ${summaryRow('Subtotal', formatMoney(subtotal))}
            ${shippingCost > 0 ? summaryRow('Shipping', formatMoney(shippingCost)) : summaryRow('Shipping', 'Free')}
            ${taxAmount > 0 ? summaryRow('Tax', formatMoney(taxAmount)) : ''}
            ${discountAmount > 0 ? summaryRow('Discount', `-${formatMoney(discountAmount)}`) : ''}
            <tr><td colspan="2" style="padding-top: 8px; border-top: 1px solid #dfe3df;"></td></tr>
            ${summaryRow('Total', formatMoney(total), true)}
          </table>

          ${
            shippingAddress
              ? `<div style="background-color: #f7f7f5; border-radius: 8px; padding: 16px 20px; margin-bottom: 24px;">
                  <div style="font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em; color: #4b534d; margin-bottom: 8px;">Shipping to</div>
                  <div style="font-size: 13px; color: #1a1f1b; line-height: 1.5;">
                    ${shippingAddress.line1}${shippingAddress.line2 ? `, ${shippingAddress.line2}` : ''}<br />
                    ${shippingAddress.city}${shippingAddress.state ? `, ${shippingAddress.state}` : ''} ${shippingAddress.postalCode}<br />
                    ${shippingAddress.country}
                  </div>
                </div>`
              : ''
          }

          <div style="text-align: center; margin-bottom: 8px;">
            <a href="${orderUrl}" style="display: inline-block; background-color: #10b982; color: #ffffff; padding: 12px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 14px;">
              View Order
            </a>
          </div>
        </div>

        <div style="background-color: #f7f7f5; padding: 20px 32px; text-align: center;">
          <p style="color: #717a73; font-size: 12px; margin: 0 0 4px;">Questions about your order? Contact us anytime.</p>
          <p style="color: #9ba39c; font-size: 12px; margin: 0;">Movec Store, Nairobi, Kenya</p>
        </div>
      </div>
    `;

    // Try sending via SMTP first
    if (this.transporter) {
      try {
        await this.transporter.sendMail({
          from: this.smtpFrom,
          to: `"${toName}" <${toEmail}>`,
          subject,
          html: htmlContent,
        });
        this.logger.log(`Order receipt sent to ${toEmail} via SMTP`);
        return;
      } catch (error) {
        this.logger.error('Failed to send order receipt via SMTP:', error);
      }
    }

    // Fallback to Brevo
    if (!this.apiInstance) {
      this.logger.warn(
        'Neither SMTP nor Brevo is configured for order receipts.',
      );
      return;
    }

    const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
    sendSmtpEmail.to = [{ email: toEmail, name: toName }];
    sendSmtpEmail.sender = { email: this.fromEmail, name: this.fromName };
    sendSmtpEmail.subject = subject;
    sendSmtpEmail.htmlContent = htmlContent;

    try {
      await this.apiInstance.sendTransacEmail(sendSmtpEmail);
      this.logger.log(`Order receipt sent to ${toEmail} via Brevo`);
    } catch (error) {
      this.logger.error('Failed to send order receipt via Brevo:', error);
    }
  }

  async sendContactFormEmail(contactData: {
    name: string;
    email: string;
    phone?: string;
    subject: string;
    message: string;
  }) {
    const businessEmail = this.configService.get<string>(
      'CONTACT_EMAIL',
      'info@starlinkcctv.co.ke',
    );
    const subject = `New Contact Form Submission: ${contactData.subject}`;
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1e40af;">New Contact Request</h2>
        <p><strong>Name:</strong> ${contactData.name}</p>
        <p><strong>Email:</strong> ${contactData.email}</p>
        <p><strong>Phone:</strong> ${contactData.phone || 'N/A'}</p>
        <p><strong>Subject:</strong> ${contactData.subject}</p>
        <div style="margin-top: 16px; padding: 16px; background-color: #f3f4f6; border-radius: 8px;">
          <p style="white-space: pre-wrap; margin: 0;">${contactData.message}</p>
        </div>
      </div>
    `;

    // Try sending via SMTP first
    if (this.transporter) {
      try {
        await this.transporter.sendMail({
          from: this.smtpFrom,
          to: businessEmail,
          replyTo: contactData.email,
          subject,
          html: htmlContent,
        });
        this.logger.log('Contact form email sent to business via SMTP');
        return;
      } catch (error) {
        this.logger.error('Failed to send contact form email via SMTP:', error);
      }
    }

    // Fallback to Brevo
    if (!this.apiInstance) return;

    const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
    sendSmtpEmail.to = [{ email: businessEmail }];
    sendSmtpEmail.sender = { email: this.fromEmail, name: contactData.name };
    sendSmtpEmail.replyTo = { email: contactData.email };
    sendSmtpEmail.subject = subject;
    sendSmtpEmail.htmlContent = htmlContent;

    try {
      await this.apiInstance.sendTransacEmail(sendSmtpEmail);
      this.logger.log('Contact form email sent to business via Brevo');
    } catch (error) {
      this.logger.error('Failed to send contact form email via Brevo:', error);
    }
  }

  async sendContactFormConfirmation(toEmail: string, toName: string) {
    const subject = 'We received your message - Movec Store';
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1e40af;">Thanks for reaching out!</h2>
        <p>Hi ${toName},</p>
        <p>We've successfully received your message and our team will get back to you as soon as possible.</p>
        <p>For urgent inquiries, you can also reach us via WhatsApp at +254 796285718.</p>
        <hr style="border: 1px solid #e5e7eb; margin: 24px 0;" />
        <p style="color: #6b7280; font-size: 12px;">Movec Store, Nairobi, Kenya</p>
      </div>
    `;

    if (this.transporter) {
      try {
        await this.transporter.sendMail({
          from: this.smtpFrom,
          to: `"${toName}" <${toEmail}>`,
          subject,
          html: htmlContent,
        });
        return;
      } catch (error) {
        this.logger.error(
          'Failed to send contact confirmation via SMTP:',
          error,
        );
      }
    }

    if (!this.apiInstance) return;

    const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
    sendSmtpEmail.to = [{ email: toEmail, name: toName }];
    sendSmtpEmail.sender = { email: this.fromEmail, name: this.fromName };
    sendSmtpEmail.subject = subject;
    sendSmtpEmail.htmlContent = htmlContent;

    try {
      await this.apiInstance.sendTransacEmail(sendSmtpEmail);
    } catch (error) {
      this.logger.error(
        'Failed to send contact confirmation via Brevo:',
        error,
      );
    }
  }

  async sendInstallationRequestConfirmation(params: {
    toEmail: string;
    toName: string;
    serviceName: string;
    preferredDate: Date;
    timeSlotLabel?: string;
    address: {
      line1: string;
      line2?: string | null;
      city: string;
      state?: string | null;
      postalCode: string;
      country: string;
    };
    notes?: string | null;
    price: number;
    currency?: string;
  }) {
    const {
      toEmail,
      toName,
      serviceName,
      preferredDate,
      timeSlotLabel,
      address,
      notes,
      price,
      currency = 'KES',
    } = params;

    const logoUrl = `${this.frontendUrl}/logo.png`;
    const formatMoney = (amount: number) =>
      `${currency} ${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    const formattedDate = preferredDate.toLocaleDateString('en-KE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    const subject = 'Your installation request has been received - Movec Store';
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff;">
        <div style="background-color: #ffffff; padding: 24px 32px; text-align: center; border-bottom: 3px solid #10b982;">
          <img src="${logoUrl}" alt="Movec Store" height="48" style="height: 48px; display: inline-block;" />
        </div>

        <div style="padding: 32px;">
          <div style="text-align: center; margin-bottom: 24px;">
            <div style="display: inline-block; width: 56px; height: 56px; border-radius: 50%; background-color: #ecfdf5; line-height: 56px; font-size: 28px; color: #10b982;">&#10003;</div>
            <h1 style="font-size: 20px; color: #1a1f1b; margin: 16px 0 4px;">Installation request received</h1>
            <p style="color: #717a73; margin: 0;">Hi ${toName}, we've received your request for <strong>${serviceName}</strong>. Our team will reach out shortly to confirm scheduling.</p>
          </div>

          <table width="100%" style="border-collapse: collapse; margin-bottom: 24px; background-color: #f7f7f5; border-radius: 8px;" cellpadding="0" cellspacing="0">
            <tr>
              <td style="padding: 16px 20px; font-size: 13px; color: #717a73;">Service</td>
              <td style="padding: 16px 20px; font-size: 13px; color: #1a1f1b; text-align: right; font-weight: 600;">${serviceName}</td>
            </tr>
            <tr>
              <td style="padding: 0 20px 16px; font-size: 13px; color: #717a73;">Preferred date</td>
              <td style="padding: 0 20px 16px; font-size: 13px; color: #1a1f1b; text-align: right; font-weight: 600;">${formattedDate}</td>
            </tr>
            ${
              timeSlotLabel
                ? `<tr>
                    <td style="padding: 0 20px 16px; font-size: 13px; color: #717a73;">Preferred time</td>
                    <td style="padding: 0 20px 16px; font-size: 13px; color: #1a1f1b; text-align: right; font-weight: 600;">${timeSlotLabel}</td>
                  </tr>`
                : ''
            }
            <tr>
              <td style="padding: 0 20px 16px; font-size: 13px; color: #717a73;">Estimated price</td>
              <td style="padding: 0 20px 16px; font-size: 13px; color: #1a1f1b; text-align: right; font-weight: 600;">${formatMoney(price)}</td>
            </tr>
          </table>

          <div style="background-color: #f7f7f5; border-radius: 8px; padding: 16px 20px; margin-bottom: 24px;">
            <div style="font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em; color: #4b534d; margin-bottom: 8px;">Installation address</div>
            <div style="font-size: 13px; color: #1a1f1b; line-height: 1.5;">
              ${address.line1}${address.line2 ? `, ${address.line2}` : ''}<br />
              ${address.city}${address.state ? `, ${address.state}` : ''} ${address.postalCode}<br />
              ${address.country}
            </div>
          </div>

          ${
            notes
              ? `<div style="margin-bottom: 8px;">
                  <div style="font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em; color: #4b534d; margin-bottom: 8px;">Your notes</div>
                  <p style="font-size: 13px; color: #1a1f1b; white-space: pre-wrap; margin: 0;">${notes}</p>
                </div>`
              : ''
          }
        </div>

        <div style="background-color: #f7f7f5; padding: 20px 32px; text-align: center;">
          <p style="color: #717a73; font-size: 12px; margin: 0 0 4px;">Questions about your request? Contact us anytime.</p>
          <p style="color: #9ba39c; font-size: 12px; margin: 0;">Movec Store, Nairobi, Kenya</p>
        </div>
      </div>
    `;

    // Try sending via SMTP first
    if (this.transporter) {
      try {
        await this.transporter.sendMail({
          from: this.smtpFrom,
          to: `"${toName}" <${toEmail}>`,
          subject,
          html: htmlContent,
        });
        this.logger.log(
          `Installation request confirmation sent to ${toEmail} via SMTP`,
        );
        return;
      } catch (error) {
        this.logger.error(
          'Failed to send installation request confirmation via SMTP:',
          error,
        );
      }
    }

    // Fallback to Brevo
    if (!this.apiInstance) {
      this.logger.warn(
        'Neither SMTP nor Brevo is configured for installation request confirmations.',
      );
      return;
    }

    const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
    sendSmtpEmail.to = [{ email: toEmail, name: toName }];
    sendSmtpEmail.sender = { email: this.fromEmail, name: this.fromName };
    sendSmtpEmail.subject = subject;
    sendSmtpEmail.htmlContent = htmlContent;

    try {
      await this.apiInstance.sendTransacEmail(sendSmtpEmail);
      this.logger.log(
        `Installation request confirmation sent to ${toEmail} via Brevo`,
      );
    } catch (error) {
      this.logger.error(
        'Failed to send installation request confirmation via Brevo:',
        error,
      );
    }
  }

  async sendInstallationRequestNotification(params: {
    customerName: string;
    customerEmail: string;
    customerPhone?: string | null;
    serviceName: string;
    preferredDate: Date;
    timeSlotLabel?: string;
    address: {
      line1: string;
      line2?: string | null;
      city: string;
      state?: string | null;
      postalCode: string;
      country: string;
    };
    notes?: string | null;
    price: number;
    currency?: string;
  }) {
    const {
      customerName,
      customerEmail,
      customerPhone,
      serviceName,
      preferredDate,
      timeSlotLabel,
      address,
      notes,
      price,
      currency = 'KES',
    } = params;

    const businessEmail = this.configService.get<string>(
      'CONTACT_EMAIL',
      'info@starlinkcctv.co.ke',
    );
    const formatMoney = (amount: number) =>
      `${currency} ${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    const formattedDate = preferredDate.toLocaleDateString('en-KE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    const dashboardUrl = `${this.frontendUrl}/admin/installations`;

    const subject = `New Installation Request: ${serviceName}`;
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1e40af;">New Installation Request</h2>
        <p><strong>Customer:</strong> ${customerName}</p>
        <p><strong>Email:</strong> ${customerEmail}</p>
        <p><strong>Phone:</strong> ${customerPhone || 'N/A'}</p>
        <p><strong>Service:</strong> ${serviceName}</p>
        <p><strong>Preferred date:</strong> ${formattedDate}${timeSlotLabel ? ` &mdash; ${timeSlotLabel}` : ''}</p>
        <p><strong>Estimated price:</strong> ${formatMoney(price)}</p>
        <p><strong>Address:</strong> ${address.line1}${address.line2 ? `, ${address.line2}` : ''}, ${address.city}${address.state ? `, ${address.state}` : ''} ${address.postalCode}, ${address.country}</p>
        ${
          notes
            ? `<div style="margin-top: 16px; padding: 16px; background-color: #f3f4f6; border-radius: 8px;">
                <p style="white-space: pre-wrap; margin: 0;">${notes}</p>
              </div>`
            : ''
        }
        <a href="${dashboardUrl}" style="display: inline-block; margin-top: 20px; background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px;">
          View in Admin Panel
        </a>
      </div>
    `;

    // Try sending via SMTP first
    if (this.transporter) {
      try {
        await this.transporter.sendMail({
          from: this.smtpFrom,
          to: businessEmail,
          replyTo: customerEmail,
          subject,
          html: htmlContent,
        });
        this.logger.log(
          'Installation request notification sent to business via SMTP',
        );
        return;
      } catch (error) {
        this.logger.error(
          'Failed to send installation request notification via SMTP:',
          error,
        );
      }
    }

    // Fallback to Brevo
    if (!this.apiInstance) return;

    const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
    sendSmtpEmail.to = [{ email: businessEmail }];
    sendSmtpEmail.sender = { email: this.fromEmail, name: customerName };
    sendSmtpEmail.replyTo = { email: customerEmail };
    sendSmtpEmail.subject = subject;
    sendSmtpEmail.htmlContent = htmlContent;

    try {
      await this.apiInstance.sendTransacEmail(sendSmtpEmail);
      this.logger.log(
        'Installation request notification sent to business via Brevo',
      );
    } catch (error) {
      this.logger.error(
        'Failed to send installation request notification via Brevo:',
        error,
      );
    }
  }
}
