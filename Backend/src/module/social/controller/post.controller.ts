import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { ListService } from '../../catalog/service/list.service';
import { User } from '@common/config/decorator/user.decorator';
import { Credential } from '../../../security/model/entity/credential.entity';
import { CreateListDto } from '../../catalog/model/dto/create-list.dto';
import { CreatePostDto } from '../model/dto/create-post.dto';
import { PostService } from '../service/post.service';

@ApiBearerAuth('access-token')
@ApiTags('Post Controller')
@Controller()
export class PostController {
  constructor(private readonly postService: PostService) {}


  @Post('post')
  async createPost(@User() user: Credential , @Body() dto: CreatePostDto) {
    return await this.postService.createPost(user, dto);
  }

  @Get('posts')
  async getAllPosts(){
    return await this.postService.getAllPosts()
  }

  @Get('post/:postId')
  async getPostById(@Param('postId') postId: number){
    return await this.postService.getPostById(postId);
  }

}