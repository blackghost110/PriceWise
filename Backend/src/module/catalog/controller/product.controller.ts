import {ApiBearerAuth, ApiTags} from "@nestjs/swagger";
import {Body, Controller, Get, Param, Post, Query } from "@nestjs/common";
import {CreateProductDto} from "../model/dto/create-product.dto";
import {ProductService} from "../service/product.service";
import {Credential} from "../../../security/model/entity/credential.entity";
import { User } from "@common/config/decorator/user.decorator";
import { GetAllProductsQueryDTO } from '../model/dto/get-all-products-query.dto';

@ApiBearerAuth('access-token')
@ApiTags('Product Controller')
@Controller()
export class ProductController {
    constructor(private readonly productService: ProductService) {}

    @Post('product/:storeId')
    async createProduct(
        @User() user: Credential,
        @Param('storeId') storeId: number,
        @Body() createProductDto: CreateProductDto) {
        return await this.productService.createProduct(user, storeId, createProductDto);
    }

    @Get('products')
    async getAllProducts(@Query() query: GetAllProductsQueryDTO){
        return this.productService.getAllProducts(query);
    }

  @Get('product/:productId')
  async getProductDetails(@Param('productId') productId: number) {
    return this.productService.getProductDetails(productId);
  }

}