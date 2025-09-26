import { Injectable, NotFoundException, Param } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PostEntity } from '../model/post.entity';
import { Repository } from 'typeorm';
import { Credential } from '../../../security/model/entity/credential.entity';
import { CommentEntity } from '../model/comment.entity';
import { CreateCommentDto } from '../model/dto/create-comment.dto';
import {
  CommentCreateException,
  CommentCreateUserException,
  CommentGetByIdException,
} from '../social.exception';

@Injectable()
export class CommentService {
  constructor(
    @InjectRepository(CommentEntity) private readonly commentRepository: Repository<CommentEntity>,
    @InjectRepository(PostEntity) private readonly postRepository: Repository<PostEntity>,
  ) {}

  async createComment(user: Credential, dto: CreateCommentDto, postId: number) {
    const post = await this.postRepository.findOne({ where: { postId: postId }})
    if (!post) {
      throw new CommentCreateUserException()
    }
    try {

      const comment = new CommentEntity();
      Object.assign(comment, dto);
      comment.post = post;
      comment.user = user;
      return await this.commentRepository.save(comment);

    } catch (e) {
      throw new CommentCreateException();
    }
  }

  async getCommentsByPostId(postId: number) {
    try {

      return await this.commentRepository.find({
        where: {post: {postId: postId}},
        relations: ['user']
      });

    }catch (e) {
      throw new CommentGetByIdException();
    }

  }


}