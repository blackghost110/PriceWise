import {Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn} from "typeorm";
import {StoreEntity} from "./store.entity";
import {PriceEntity} from "./price.entity";
import {BaseEntity} from "@common/model/base.entity";

export enum ProductUnitType {
    G = 'g',
    ML = 'ml',
    PIECE = 'piece'
}

@Entity({ name: 'product'})
export class ProductEntity extends BaseEntity {

    @PrimaryGeneratedColumn()
    productId: number;

    @Column()
    name: string;

    @Column()
    brand: string;

    @Column()
    unit: ProductUnitType;

    @Column()
    quantity: number;

    @OneToMany(() => PriceEntity, (price) => price.product, { cascade: true })
    prices: PriceEntity[];

    @ManyToOne(() => StoreEntity, (store) => store.products)
    @JoinColumn({ name: 'storeId'})
    store: StoreEntity;
}