import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { BaseEntity } from '@common/model/base.entity';
import { Credential } from '../../../security/model/entity/credential.entity';
import { CommentEntity } from './comment.entity';

@Entity({ name: 'post'})
export class PostEntity extends BaseEntity {

  @PrimaryGeneratedColumn()
  postId: number;

  @Column()
  title: string;

  @Column()
  message: string;

  @Column()
  postalCode: string;

  @ManyToOne(() => Credential, (user) => user.posts)
  user: Credential;

  @OneToMany(() => CommentEntity, (comment) => comment.post)
  comments: CommentEntity[];
}