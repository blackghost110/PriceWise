import {
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { BaseEntity } from '@common/model/base.entity';
import { PostEntity } from './post.entity';
import { Credential } from '../../../security/model/entity/credential.entity';

@Entity({ name: 'comment'})
export class CommentEntity extends BaseEntity {

  @PrimaryGeneratedColumn()
  commentId: number;

  @Column()
  message: string;

  @ManyToOne(() => PostEntity, (post) => post.comments)
  post: PostEntity;

  @ManyToOne(() => Credential, (user) => user.comments)
  user: Credential;

}