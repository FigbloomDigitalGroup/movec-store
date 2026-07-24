import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as SibApiV3Sdk from 'sib-api-v3-sdk';
import * as nodemailer from 'nodemailer';

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
    this.fromEmail = this.configService.get<string>('BREVO_FROM_EMAIL', 'noreply@starlinkcctv.co.ke');
    this.fromName = this.configService.get<string>('BREVO_FROM_NAME', 'Movec Store');
    this.frontendUrl = this.configService.get<string>('FRONTEND_URL', 'http://localhost:5173');

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
    this.smtpFrom = this.configService.get<string>('SMTP_FROM', `"${this.fromName}" <${this.fromEmail}>`);

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
      this.logger.log(`SMTP Transporter initialized for host ${smtpHost} using user ${smtpUser}`);
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
      this.logger.warn('Neither SMTP nor Brevo is configured. Verification token:', token);
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
        this.logger.error('Failed to send password reset email via SMTP:', error);
      }
    }

    // Fallback to Brevo
    if (!this.apiInstance) {
      this.logger.warn('Neither SMTP nor Brevo is configured. Reset token:', token);
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
      this.logger.error('Failed to send password reset email via Brevo:', error);
    }
  }

  async sendOrderConfirmation(toEmail: string, toName: string, orderNumber: string, total: number) {
    const subject = `Order Confirmed - ${orderNumber}`;
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1e40af;">Order Confirmed!</h2>
        <p>Hi ${toName},</p>
        <p>Your order <strong>${orderNumber}</strong> has been confirmed.</p>
        <p style="font-size: 24px; font-weight: bold; color: #2563eb;">Total: KES ${total.toLocaleString()}</p>
        <p>We'll notify you when your order ships.</p>
        <a href="${this.frontendUrl}/orders/${orderNumber}" style="display: inline-block; background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; margin: 16px 0;">
          Track Your Order
        </a>
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
        this.logger.log(`Order confirmation sent to ${toEmail} via SMTP`);
        return;
      } catch (error) {
        this.logger.error('Failed to send order confirmation via SMTP:', error);
      }
    }

    // Fallback to Brevo
    if (!this.apiInstance) {
      this.logger.warn('Neither SMTP nor Brevo is configured for order confirmation.');
      return;
    }

    const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
    sendSmtpEmail.to = [{ email: toEmail, name: toName }];
    sendSmtpEmail.sender = { email: this.fromEmail, name: this.fromName };
    sendSmtpEmail.subject = subject;
    sendSmtpEmail.htmlContent = htmlContent;

    try {
      await this.apiInstance.sendTransacEmail(sendSmtpEmail);
      this.logger.log(`Order confirmation sent to ${toEmail} via Brevo`);
    } catch (error) {
      this.logger.error('Failed to send order confirmation via Brevo:', error);
    }
  }

  async sendContactFormEmail(contactData: { name: string; email: string; phone?: string; subject: string; message: string }) {
    const businessEmail = this.configService.get<string>('CONTACT_EMAIL', 'info@starlinkcctv.co.ke');
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
    (sendSmtpEmail as any).replyTo = { email: contactData.email };
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
        this.logger.error('Failed to send contact confirmation via SMTP:', error);
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
      this.logger.error('Failed to send contact confirmation via Brevo:', error);
    }
  }
}