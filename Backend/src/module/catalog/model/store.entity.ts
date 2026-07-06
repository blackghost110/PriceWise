import {Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, Unique} from "typeorm";
import {ProductEntity} from "./product.entity";
import {BaseEntity} from "@common/model/base.entity";
import {Credential} from "../../../security/model/entity/credential.entity";
import {StoreBrandEntity} from "./store-brand.entity";

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

    // Couleurs du badge : portées par la marque (nameKey) et non par le magasin,
    // pour garantir 1 seule couleur par nom (ex. tous les "Lidl" identiques).
    @Column({ type: 'int', nullable: true })
    brandId: number | null;

    @ManyToOne(() => StoreBrandEntity, { nullable: true, eager: false })
    @JoinColumn({ name: 'brandId' })
    brand: StoreBrandEntity | null;

    @OneToMany(() => ProductEntity, (product) => product.store, { cascade: true , onDelete: "CASCADE" })
    products: ProductEntity[];
}