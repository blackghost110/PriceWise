import {Column, Entity, OneToMany, PrimaryGeneratedColumn, Unique} from "typeorm";
import {ProductEntity} from "./product.entity";
import {BaseEntity} from "@common/model/base.entity";

@Entity({ name: 'store'})
@Unique(['name', 'street', 'number', 'postalCode', 'city'])
export class StoreEntity extends BaseEntity {

    @PrimaryGeneratedColumn()
    storeId: number;

    @Column()
    name: string;

    @Column()
    street: string;

    @Column()
    number: string;

    @Column()
    postalCode: string;

    @Column()
    city: string;

    @OneToMany(() => ProductEntity, (product) => product.store, { cascade: true , onDelete: "CASCADE" })
    products: ProductEntity[];
}