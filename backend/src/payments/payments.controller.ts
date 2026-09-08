import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { InitiatePaybillTillDto } from './dto/initiate-paybill-till.dto';
import { SubmitPaymentReferenceDto } from './dto/submit-payment-reference.dto';
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

  // Public (to any authenticated customer) view of which manual M-Pesa channels
  // are switched on and what number to pay — there's nothing secret about a
  // Paybill/Till number, the customer needs it to actually pay.
  @Get('methods')
  async getPaymentMethods() {
    const settings = await this.paymentsService.getPaymentSettings();
    return {
      paybill: {
        enabled: settings.paybillEnabled,
        number: settings.paybillNumber,
      },
      till: {
        enabled: settings.tillEnabled,
        number: settings.tillNumber,
      },
    };
  }

  @Post('paybill/initiate')
  initiatePaybill(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: InitiatePaybillTillDto,
  ) {
    return this.paymentsService.initiatePaybillTill(
      dto.orderNumber,
      user.id,
      'PAYBILL',
      dto.codDeposit,
    );
  }

  @Post('till/initiate')
  initiateTill(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: InitiatePaybillTillDto,
  ) {
    return this.paymentsService.initiatePaybillTill(
      dto.orderNumber,
      user.id,
      'TILL',
      dto.codDeposit,
    );
  }

  @Post('paybill-till/reference')
  submitPaymentReference(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: SubmitPaymentReferenceDto,
  ) {
    return this.paymentsService.submitPaymentReference(
      dto.orderNumber,
      user.id,
      dto.reference,
    );
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
