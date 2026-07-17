import {
  Controller,
  Post,
  Body,
  UseGuards,
  Req,
} from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { InitiateMpesaDto } from './dto/initiate-mpesa.dto';
import { InitiateStripeDto } from './dto/initiate-stripe.dto';
import { InitiatePaypalDto } from './dto/initiate-paypal.dto';
import { ConfirmBankTransferDto } from './dto/confirm-bank-transfer.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { Request } from 'express';

@Controller('payments')
@UseGuards(JwtAuthGuard)
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('mpesa/initiate')
  initiateMpesa(@Req() req: Request, @Body() dto: InitiateMpesaDto) {
    return this.paymentsService.initiateMpesa(dto.orderNumber, dto.phoneNumber);
  }

  @Post('stripe/create-intent')
  initiateStripe(@Req() req: Request, @Body() dto: InitiateStripeDto) {
    return this.paymentsService.initiateStripe(dto.orderNumber);
  }

  @Post('paypal/create-order')
  initiatePaypal(@Req() req: Request, @Body() dto: InitiatePaypalDto) {
    return this.paymentsService.initiatePaypal(dto.orderNumber);
  }

  @Post('bank-transfer/initiate')
  initiateBankTransfer(@Req() req: Request, @Body() dto: ConfirmBankTransferDto) {
    return this.paymentsService.initiateBankTransfer(dto.orderNumber);
  }

  @Post('bank-transfer/confirm')
  confirmBankTransfer(@Req() req: Request, @Body() dto: ConfirmBankTransferDto) {
    return this.paymentsService.confirmBankTransfer(dto.orderNumber);
  }
}