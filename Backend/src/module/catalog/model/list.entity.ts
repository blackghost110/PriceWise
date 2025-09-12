import {Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn} from "typeorm";
import {Credential} from "../../../security/model/entity/credential.entity";
import {BaseEntity} from "@common/model/base.entity";
import {ListProductEntity} from "./list-product.entity";


@Entity({ name: 'list'})
export class ListEntity extends BaseEntity {

    @PrimaryGeneratedColumn()
    listId: number;

    @Column()
    name: string;

    @Column({ default: false })
    isPublic: boolean;

    @ManyToOne(() => Credential, (user) => user.lists)
    user: Credential;

    @OneToMany(() => ListProductEntity, (listProduct) => listProduct.list)
    listProducts: ListProductEntity[];
}