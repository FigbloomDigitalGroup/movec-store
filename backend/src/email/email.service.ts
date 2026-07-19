import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as SibApiV3Sdk from 'sib-api-v3-sdk';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private apiInstance: SibApiV3Sdk.TransactionalEmailsApi;
  private fromEmail: string;
  private fromName: string;
  private frontendUrl: string;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('BREVO_API_KEY');
    this.fromEmail = this.configService.get<string>('BREVO_FROM_EMAIL', 'noreply@starlinkcctv.co.ke');
    this.fromName = this.configService.get<string>('BREVO_FROM_NAME', 'Starlink CCTV');
    this.frontendUrl = this.configService.get<string>('FRONTEND_URL', 'http://localhost:5173');

    if (apiKey) {
      const client = SibApiV3Sdk.ApiClient.instance;
      const apiKeyInstance = client.authentications['api-key'];
      apiKeyInstance.apiKey = apiKey;
      this.apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
    }
  }

  async sendVerificationEmail(toEmail: string, toName: string, token: string) {
    if (!this.apiInstance) {
      this.logger.warn('Brevo not configured. Verification token:', token);
      return;
    }

    const verificationLink = `${this.frontendUrl}/verify-email?token=${token}`;

    const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
    sendSmtpEmail.to = [{ email: toEmail, name: toName }];
    sendSmtpEmail.sender = { email: this.fromEmail, name: this.fromName };
    sendSmtpEmail.subject = 'Verify your email - Starlink CCTV';
    sendSmtpEmail.htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1e40af;">Welcome to Starlink CCTV!</h2>
        <p>Hi ${toName},</p>
        <p>Thank you for registering. Please verify your email address by clicking the button below:</p>
        <a href="${verificationLink}" style="display: inline-block; background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; margin: 16px 0;">
          Verify Email
        </a>
        <p>Or copy this link: ${verificationLink}</p>
        <p>This link expires in 24 hours.</p>
        <hr style="border: 1px solid #e5e7eb; margin: 24px 0;" />
        <p style="color: #6b7280; font-size: 12px;">Starlink CCTV, Nairobi, Kenya</p>
      </div>
    `;

    try {
      await this.apiInstance.sendTransacEmail(sendSmtpEmail);
      this.logger.log(`Verification email sent to ${toEmail}`);
    } catch (error) {
      this.logger.error('Failed to send verification email:', error);
    }
  }

  async sendPasswordResetEmail(toEmail: string, toName: string, token: string) {
    if (!this.apiInstance) {
      this.logger.warn('Brevo not configured. Reset token:', token);
      return;
    }

    const resetLink = `${this.frontendUrl}/reset-password?token=${token}`;

    const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
    sendSmtpEmail.to = [{ email: toEmail, name: toName }];
    sendSmtpEmail.sender = { email: this.fromEmail, name: this.fromName };
    sendSmtpEmail.subject = 'Reset your password - Starlink CCTV';
    sendSmtpEmail.htmlContent = `
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
        <p style="color: #6b7280; font-size: 12px;">Starlink CCTV, Nairobi, Kenya</p>
      </div>
    `;

    try {
      await this.apiInstance.sendTransacEmail(sendSmtpEmail);
      this.logger.log(`Password reset email sent to ${toEmail}`);
    } catch (error) {
      this.logger.error('Failed to send password reset email:', error);
    }
  }

  async sendOrderConfirmation(toEmail: string, toName: string, orderNumber: string, total: number) {
    if (!this.apiInstance) return;

    const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
    sendSmtpEmail.to = [{ email: toEmail, name: toName }];
    sendSmtpEmail.sender = { email: this.fromEmail, name: this.fromName };
    sendSmtpEmail.subject = `Order Confirmed - ${orderNumber}`;
    sendSmtpEmail.htmlContent = `
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

    try {
      await this.apiInstance.sendTransacEmail(sendSmtpEmail);
      this.logger.log(`Order confirmation sent to ${toEmail}`);
    } catch (error) {
      this.logger.error('Failed to send order confirmation:', error);
    }
  }
}