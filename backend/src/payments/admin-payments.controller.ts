import { Controller, Get, Post, Put, Body, UseGuards } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { ConfirmPaybillTillDto } from './dto/confirm-paybill-till.dto';
import { UpdatePaymentSettingsDto } from './dto/update-payment-settings.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RoleName } from '@prisma/client';

// Paybill/Till payments can't be verified automatically — confirming one means
// staff have checked the actual M-Pesa statement. Keeping this admin-only
// (rather than letting a customer confirm their own payment) is what makes
// "I paid" mean anything.
@Controller('admin/payments')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(RoleName.ADMIN)
export class AdminPaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('paybill-till/confirm')
  confirmPaybillTill(@Body() dto: ConfirmPaybillTillDto) {
    return this.paymentsService.confirmPaybillTill(dto.orderNumber);
  }

  @Get('transactions')
  getTransactions() {
    return this.paymentsService.getTransactions();
  }

  @Get('settings')
  async getSettings() {
    const settings = await this.paymentsService.getPaymentSettings();
    return {
      codEnabled: settings.codEnabled,
      codDepositThreshold: settings.codDepositThreshold.toNumber(),
      codDepositPercentage: settings.codDepositPercentage.toNumber(),
      paybillEnabled: settings.paybillEnabled,
      paybillNumber: settings.paybillNumber,
      tillEnabled: settings.tillEnabled,
      tillNumber: settings.tillNumber,
    };
  }

  @Put('settings')
  async updateSettings(@Body() dto: UpdatePaymentSettingsDto) {
    const settings = await this.paymentsService.updatePaymentSettings(dto);
    return {
      codEnabled: settings.codEnabled,
      codDepositThreshold: settings.codDepositThreshold.toNumber(),
      codDepositPercentage: settings.codDepositPercentage.toNumber(),
      paybillEnabled: settings.paybillEnabled,
      paybillNumber: settings.paybillNumber,
      tillEnabled: settings.tillEnabled,
      tillNumber: settings.tillNumber,
    };
  }
}
