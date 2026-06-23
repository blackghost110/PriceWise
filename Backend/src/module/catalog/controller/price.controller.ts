import {ApiBearerAuth, ApiTags} from "@nestjs/swagger";
import { Body, Controller, Get, Param, Post, Put } from '@nestjs/common';
import {PriceService} from "../service/price.service";
import {CreatePriceDto} from "../model/dto/create-price.dto";
import { User } from "@common/config/decorator/user.decorator";
import {Credential} from "../../../security/model/entity/credential.entity";
import { UpdatePriceDto } from '../model/dto/update-price.dto';

@ApiBearerAuth('access-token')
@ApiTags('Price Controller')
@Controller()
export class PriceController {
  constructor(private readonly priceService: PriceService) {}

  @Post('price/:productId')
  async createPrice(
    @User() user: Credential,
    @Body() dto: CreatePriceDto,
    @Param('productId') productId: number,
  ) {
    return await this.priceService.createPrice(user.credentialId, dto, productId,);
  }

  @Get('prices/:productId')
  async getProductPrices(@Param('productId') productId: number) {
    return await this.priceService.getProductPrices(productId);
  }

  @Get('price/users')
  async getUsersPriceCount() {
    return await this.priceService.getUsersPriceCount();
  }

  @Get('price/:productId')
  async getProductLastPrice(@Param('productId') productId: number) {
    return await this.priceService.getProductLastPrice(productId);
  }

  @Put('price/:priceId')
  async updatePrice(
    @User() user: Credential,
    @Body() updatePriceDto: UpdatePriceDto,
    @Param('priceId') priceId: number,
  ) {
    return await this.priceService.updatePrice(user.credentialId, updatePriceDto, priceId,);
  }
}