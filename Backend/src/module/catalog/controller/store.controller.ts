import {ApiBearerAuth, ApiTags} from "@nestjs/swagger";
import {Body, Controller, Get, Param, Post} from "@nestjs/common";
import {CreateStoreDto} from "../model/dto/create-store.dto";
import {StoreService} from "../service/store.service";
import { Public } from "@common/config/decorator/public.decorator";
import { StoreProductsResponse} from "../model/type/store-products.response";

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
}