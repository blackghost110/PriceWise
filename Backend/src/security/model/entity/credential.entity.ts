import {Column, Entity, OneToMany, PrimaryColumn} from "typeorm";
import {BaseEntity} from "@common/model/base.entity";
import {ListEntity} from "../../../module/catalog/model/list.entity";
import { PostEntity } from '../../../module/social/model/post.entity';
import { CommentEntity } from '../../../module/social/model/comment.entity';

@Entity({ name: 'credential'})
export class Credential extends BaseEntity {
    @PrimaryColumn()
    credentialId: string; // UID Firebase

    @Column({nullable: false})
    displayName: string;

    @Column({nullable: false, unique: true})
    email: string;

    @Column({ default: 'USER' })
    role: string; // 'USER' | 'ADMIN'

    @Column({ default: 1 })
    level: number;

    @Column({ default: 0 })
    xp: number;

    @Column({ type: 'varchar', nullable: true })
    activeBadge: string | null;

    @Column({ default: 0 })
    warningCount: number;

    // Nombre de cercles hebdomadaires validés (badge Inoxydable)
    @Column({ default: 0 })
    weeklyCircle: number;

    // Clé de la semaine (date du lundi, ex. "2026-06-22") lors du dernier cercle hebdo validé.
    // Permet d'éviter d'attribuer plusieurs fois les +20 XP dans la même semaine.
    @Column({ type: 'varchar', nullable: true })
    lastWeeklyCircleWeek: string | null;

    @OneToMany(() => ListEntity, (list) => list.user)
    lists: ListEntity[];

    @OneToMany(() => PostEntity, (post) => post.user)
    posts: PostEntity[];

    @OneToMany(() => CommentEntity, (comment) => comment.user)
    comments: CommentEntity[]

}
