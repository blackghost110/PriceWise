import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Credential } from '../../../security/model/entity/credential.entity';
import { PostEntity } from '../model/post.entity';
import { CreatePostDto } from '../model/dto/create-post.dto';
import {
  PostCreateException,
  PostGetAllException,
  PostGetByIdException,
} from '../social.exception';

@Injectable()
export class PostService {
  constructor(
    @InjectRepository(PostEntity) private readonly postRepository: Repository<PostEntity>,
  ) {}

  async createPost(user: Credential, dto: CreatePostDto) {
    try {

      const post = new PostEntity();
      Object.assign(post, dto);
      post.user = user;
      return await this.postRepository.save(post);

    } catch (e) {
      throw new PostCreateException();
    }


  }

   async getAllPosts() {
     try {

       const posts = await this.postRepository.createQueryBuilder('post')
         .leftJoinAndSelect('post.user', 'user')
         .loadRelationCountAndMap('post.commentCount', 'post.comments')
         .getMany();

       return posts;

     } catch (e) {
       throw new PostGetAllException();
     }

  }

  async getPostById(id: number) {
    try {

      const post = await this.postRepository.findOne({
        where: {postId: id},
        relations: ['user'],
      })

      return post;

    } catch (e) {
      throw new PostGetByIdException();
    }

  }


}