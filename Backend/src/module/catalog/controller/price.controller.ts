import {ApiBearerAuth, ApiTags} from "@nestjs/swagger";
import {Body, Controller, Get, Param, Post, Put, UseGuards} from "@nestjs/common";
import {PriceService} from "../service/price.service";
import {CreatePriceDto} from "../model/dto/create-price.dto";
import { Public} from "@common/config/decorator/public.decorator";
import { JwtGuard} from "../../../security/jwt/jwt.guard";
import { User } from "@common/config/decorator/user.decorator";
import {Credential} from "../../../security/model/entity/credential.entity";

@ApiBearerAuth('access-token')
@ApiTags('Price Controller')
@Controller()
export class PriceController {
    constructor(private readonly priceService: PriceService) {}

    @ApiBearerAuth('JWT-auth')
    @UseGuards(JwtGuard)
    @Post('price/:productId')
     async createPrice(@User() user: Credential , @Body() dto: CreatePriceDto, @Param('productId') productId: number) {
      console.log('create price dto : ', dto);
        return await this.priceService.createPrice(user.credential_id, dto, productId);
     }

    @Get('prices/:productId')
    async getProductPrices(@Param('productId') productId: number) {
        return await this.priceService.getProductPrices(productId);
    }

    @Get('price/:productId')
    async getProductLastPrice(@Param('productId') productId: number) {
        return await this.priceService.getProductLastPrice(productId);
    }

    // @ApiBearerAuth('JWT-auth')
    // @UseGuards(AuthGuard)
    // @Put('price/:priceId')
    // async updatePrice(@User() user: UserEntity ,@Body() updatePriceDto: UpdatePriceDto, @Param('priceId') priceId: number) {
    //     return await this.priceService.updatePrice(user, updatePriceDto, priceId);
    // }


}