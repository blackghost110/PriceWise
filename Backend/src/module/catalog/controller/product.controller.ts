import {
  ApiBearerAuth,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {CreateProductDto} from "../model/dto/create-product.dto";
import {ProductService} from "../service/product.service";
import {Credential} from "../../../security/model/entity/credential.entity";
import { User } from "@common/config/decorator/user.decorator";
import { GetAllProductsQueryDTO } from '../model/dto/get-all-products-query.dto';
import { AdminGuard } from '@common/api/admin.guard';

@ApiBearerAuth('access-token')
@ApiTags('Product Controller')
@Controller()
export class ProductController {
    constructor(private readonly productService: ProductService) {}

    @Post('product/:storeId')
    @ApiOperation({
      summary: 'Créer un nouveau produit',
      description: 'Permet de créer un nouveau produit dans un magasin spécifique',
    })
    async createProduct(
        @User() user: Credential,
        @Param('storeId') storeId: number,
        @Body() createProductDto: CreateProductDto) {
        return await this.productService.createProduct(user, storeId, createProductDto);
    }

    @Get('products')
    @ApiOperation({
      summary: 'Obtenir tous les produits',
      description: 'Récupère une liste de produits avec possibilité de filtrage',
    })
    async getAllProducts(@Query() query: GetAllProductsQueryDTO){
        return this.productService.getAllProducts(query);
    }

  @Get('product/:productId')
  @ApiOperation({
    summary: 'Obtenir les détails d\'un produit',
    description: 'Récupère les informations détaillées d\'un produit par son ID',
  })
  async getProductDetails(@Param('productId') productId: number) {
    return this.productService.getProductDetails(productId);
  }

  @UseGuards(AdminGuard)
  @Delete('product/:productId')
  @ApiOperation({
    summary: 'Supprimer un produit',
    description: 'Suppression d\'un produit par son ID',
  })
  public deleteProduct(@User() user: Credential, @Param('productId') productId: number) {
    return this.productService.deleteProduct(productId, user.credentialId);
  }

}