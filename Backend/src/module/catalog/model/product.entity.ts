import {Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn} from "typeorm";
import {StoreEntity} from "./store.entity";
import {PriceEntity} from "./price.entity";
import {BaseEntity} from "@common/model/base.entity";
import {Credential} from "../../../security/model/entity/credential.entity";

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

    @Column({ nullable: true })
    ean: string;

    @Column({ nullable: true })
    credentialId: string;

    @ManyToOne(() => Credential, { nullable: true })
    @JoinColumn({ name: 'credentialId' })
    credential: Credential;

    @OneToMany(() => PriceEntity, (price) => price.product, { cascade: true , onDelete: "CASCADE" })
    prices: PriceEntity[];

    @ManyToOne(() => StoreEntity, (store) => store.products, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'storeId'})
    store: StoreEntity;
}