import {ApiBearerAuth, ApiTags} from "@nestjs/swagger";
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import {ListService} from "../service/list.service";
import { User } from '@common/config/decorator/user.decorator';
import { Credential } from '../../../security/model/entity/credential.entity';
import { CreateListDto } from '../model/dto/create-list.dto';

@ApiBearerAuth('access-token')
@ApiTags('List Controller')
@Controller('list')
export class ListController {
    constructor(private readonly listService: ListService) {}


  @Post()
  async createList(@User() user: Credential , @Body() dto: CreateListDto) {
    return await this.listService.createList(user, dto);
  }

  @Get('user')
  async getListsByUser(@User() user: Credential){
    console.log(user);
      return await this.listService.getListsByUser(user)
  }

  @Put(':listId')
  async updateList(@User() user: Credential, @Param('listId') listId: number, @Body() dto: CreateListDto){
    return await this.listService.updateList(user, listId, dto)
  }

  @Delete(':listId')
  public deleteList(@Param('listId') listId: number, @User() user: Credential,) {
    return this.listService.deleteList(listId, user);
  }


}