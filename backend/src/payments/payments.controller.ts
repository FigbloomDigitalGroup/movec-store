import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { InitiateMpesaDto } from './dto/initiate-mpesa.dto';
import { InitiatePaystackDto } from './dto/initiate-paystack.dto';
import { InitiatePaypalDto } from './dto/initiate-paypal.dto';
import { ConfirmBankTransferDto } from './dto/confirm-bank-transfer.dto';
import { InitiateCashOnDeliveryDto } from './dto/initiate-cash-on-delivery.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  CurrentUser,
  type AuthenticatedUser,
} from '../auth/decorators/current-user.decorator';

@Controller('payments')
@UseGuards(JwtAuthGuard)
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('mpesa/initiate')
  initiateMpesa(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: InitiateMpesaDto,
  ) {
    return this.paymentsService.initiateMpesa(
      dto.orderNumber,
      dto.phoneNumber,
      user.id,
    );
  }

  @Post('paystack/initialize')
  initiatePaystack(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: InitiatePaystackDto,
  ) {
    return this.paymentsService.initiatePaystack(
      dto.orderNumber,
      dto.email,
      user.id,
      dto.codDeposit,
    );
  }

  @Post('paystack/verify')
  verifyPaystack(@Body() dto: { reference: string }) {
    return this.paymentsService.verifyPaystack(dto.reference);
  }

  @Post('paypal/create-order')
  initiatePaypal(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: InitiatePaypalDto,
  ) {
    return this.paymentsService.initiatePaypal(dto.orderNumber, user.id);
  }

  @Post('paypal/capture')
  capturePaypal(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: { orderNumber: string; token: string },
  ) {
    return this.paymentsService.capturePaypal(
      dto.orderNumber,
      dto.token,
      user.id,
    );
  }

  @Post('bank-transfer/initiate')
  initiateBankTransfer(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: ConfirmBankTransferDto,
  ) {
    return this.paymentsService.initiateBankTransfer(dto.orderNumber, user.id);
  }

  @Get('cash-on-delivery/terms/:orderNumber')
  getCodTerms(
    @CurrentUser() user: AuthenticatedUser,
    @Param('orderNumber') orderNumber: string,
  ) {
    return this.paymentsService.getCodTerms(orderNumber, user.id);
  }

  @Post('cash-on-delivery/initiate')
  initiateCashOnDelivery(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: InitiateCashOnDeliveryDto,
  ) {
    return this.paymentsService.initiateCashOnDelivery(
      dto.orderNumber,
      user.id,
    );
  }
}
