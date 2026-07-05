import {Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, Unique} from "typeorm";
import {ProductEntity} from "./product.entity";
import {BaseEntity} from "@common/model/base.entity";
import {Credential} from "../../../security/model/entity/credential.entity";

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

    @Column({ nullable: true })
    credentialId: string;

    @ManyToOne(() => Credential, { nullable: true })
    @JoinColumn({ name: 'credentialId' })
    credential: Credential;

    @OneToMany(() => ProductEntity, (product) => product.store, { cascade: true , onDelete: "CASCADE" })
    products: ProductEntity[];
}