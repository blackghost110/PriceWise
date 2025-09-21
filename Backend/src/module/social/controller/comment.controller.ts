import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { PostService } from '../service/post.service';
import { User } from '@common/config/decorator/user.decorator';
import { Credential } from '../../../security/model/entity/credential.entity';
import { CreatePostDto } from '../model/dto/create-post.dto';
import { CreateCommentDto } from '../model/dto/create-comment.dto';
import { CommentService } from '../service/comment.service';

@ApiBearerAuth('access-token')
@ApiTags('Comment Controller')
@Controller('comment')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}


  @Post(':postId')
  async createComment(@User() user: Credential , @Body() dto: CreateCommentDto, @Param('postId') postId: number) {
    return await this.commentService.createComment(user, dto, postId);
  }

  @Get(':postId')
  async getCommentsByPostId(@Param('postId') postId: number) {
    return await this.commentService.getCommentsByPostId(postId)
  }

}