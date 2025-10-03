import {ApiBearerAuth, ApiTags} from "@nestjs/swagger";
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import {CreateStoreDto} from "../model/dto/create-store.dto";
import {StoreService} from "../service/store.service";
import { StoreProductsResponse} from "../model/type/store-products.response";
import { AdminGuard } from '@common/api/admin.guard';
import { UpdateStoreDto } from '../model/dto/update-store.dto';

@ApiBearerAuth('access-token')
@ApiTags('Store Controller')
@Controller('store')
export class StoreController {
  constructor(private readonly storeService: StoreService) {}

  @Post()
  async createStore(@Body() createStoreDto: CreateStoreDto) {
    return await this.storeService.createStore(createStoreDto);
  }


  @Get()
  async findAll() {
    return this.storeService.findAll();
  }
  @Get('/last')
  async findTwoLast() {
    return this.storeService.findTwoLast();
  }


  @Get(':storeId')
  async getStoreInfo(@Param('storeId') storeId: number) {
    return this.storeService.getStoreInfo(storeId);
  }


  @Get(':storeId/products')
  async getStoreProducts(@Param('storeId') storeId: number): Promise<StoreProductsResponse[]>{
      return this.storeService.getStoreProducts(storeId);
  }

  @UseGuards(AdminGuard)
  @Delete(':storeId')
  public deleteList(@Param('storeId') storeId: number) {
    return this.storeService.deleteStore(storeId);
  }

  @UseGuards(AdminGuard)
  @Put(':storeId')
  async updateStore(@Body() dto: UpdateStoreDto, @Param('storeId') storeId: number
  ) {
    return await this.storeService.updateStore(dto, storeId);
  }


}