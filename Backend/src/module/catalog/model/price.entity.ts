import {Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn} from "typeorm";
import {ProductEntity} from "./product.entity";
import {BaseEntity} from "@common/model/base.entity";
import {Credential} from "../../../security/model/entity/credential.entity";


@Entity({ name: 'price'})
export class PriceEntity extends BaseEntity {

    @PrimaryGeneratedColumn()
    priceId: number;

    @Column({ type: 'numeric'})
    productPrice: number;

    @Column({ type: 'numeric' })
    referencePrice: number;

    @Column({ type: 'date', default: () => 'CURRENT_DATE' })
    priceDate: Date;

    @ManyToOne(() => ProductEntity, (product) => product.prices, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'productId'})
    product: ProductEntity;

    @ManyToOne(() => Credential)
    user: Credential;
}