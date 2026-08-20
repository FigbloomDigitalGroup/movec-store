import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { ConfirmBankTransferDto } from './dto/confirm-bank-transfer.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RoleName } from '@prisma/client';

// Bank transfers can't be verified automatically — confirming one means staff have
// checked the actual bank statement. Keeping this admin-only (rather than letting a
// customer confirm their own transfer) is what makes "I paid" mean anything.
@Controller('admin/payments')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(RoleName.ADMIN)
export class AdminPaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('bank-transfer/confirm')
  confirmBankTransfer(@Body() dto: ConfirmBankTransferDto) {
    return this.paymentsService.confirmBankTransfer(dto.orderNumber);
  }

  @Get('transactions')
  getTransactions() {
    return this.paymentsService.getTransactions();
  }
}
