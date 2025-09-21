import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Credential } from '../../security/model/entity/credential.entity';
import { PostEntity } from './model/post.entity';
import { CommentEntity } from './model/comment.entity';
import { CommentController } from './controller/comment.controller';
import { PostController } from './controller/post.controller';
import { CommentService } from './service/comment.service';
import { PostService } from './service/post.service';

@Module({
  imports: [TypeOrmModule.forFeature([Credential, PostEntity, CommentEntity])],
  controllers: [CommentController, PostController],
  providers: [CommentService, PostService],
})
export class SocialModule {
}