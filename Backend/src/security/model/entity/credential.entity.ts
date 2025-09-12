import {Column, Entity, OneToMany, PrimaryGeneratedColumn} from "typeorm";
import {Exclude} from "class-transformer";
import {BaseEntity} from "@common/model/base.entity";
import {ListEntity} from "../../../module/catalog/model/list.entity";

@Entity({ name: 'credential'})
export class Credential extends BaseEntity {
    @PrimaryGeneratedColumn()
    credential_id: string;

    @Column({nullable: false, unique: true})
    username: string;

    @Column({nullable: false, unique: true})
    email: string;

    @Exclude({toPlainOnly: true})
    @Column({nullable: true})
    password: string;

    @OneToMany(() => ListEntity, (list) => list.user)
    lists: ListEntity[];

}