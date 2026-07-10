import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import {ApiBearerAuth, ApiTags} from "@nestjs/swagger";
import {ListProductService} from "../service/list-product.service";
import { User } from '@common/config/decorator/user.decorator';
import { Credential } from '../../../security/model/entity/credential.entity';
import { CreateListDto } from '../model/dto/create-list.dto';
import { CreateListProductDto } from '../model/dto/create-list-product.dto';

@ApiBearerAuth('access-token')
@ApiTags('List-Product Controller')
@Controller('list-product')
export class ListProductController {
    constructor(private readonly listProductService: ListProductService) {}


  @Post()
  async createListProduct(@Body() dto: CreateListProductDto) {
    return await this.listProductService.createListProduct(dto);
  }

  @Get(':listId')
  async getListProductByList(@Param('listId') listId: number) {
    return await this.listProductService.getListProductsByList(listId);
  }

  @Delete(':listProductId')
  async deleteListProduct(@Param('listProductId') listProductId: number) {
    return await this.listProductService.deleteListProduct(listProductId);
  }

}