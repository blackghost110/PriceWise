import {Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn} from "typeorm";
import {BaseEntity} from "@common/model/base.entity";
import {ProductEntity} from "./product.entity";
import {ListEntity} from "./list.entity";

@Entity({ name: 'list_product'})
export class ListProductEntity extends BaseEntity {

    @PrimaryGeneratedColumn()
    listProductId: number;

    @ManyToOne(() => ListEntity, (list) => list.listProducts, {
      onDelete: "CASCADE",
    })
    @JoinColumn({ name: 'listId'})
    list: ListEntity;

    @ManyToOne(() => ProductEntity)
    @JoinColumn({ name: 'productId'})
    product: ProductEntity;
}








