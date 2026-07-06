import {Column, Entity, PrimaryGeneratedColumn} from "typeorm";
import {BaseEntity} from "@common/model/base.entity";

/**
 * Source unique des couleurs de badge pour un nom de magasin.
 * Garantit qu'un même nom (ex. "Lidl") partage toujours la même couleur,
 * quel que soit le magasin (adresse) qui la porte.
 */
@Entity({ name: 'store_brand' })
export class StoreBrandEntity extends BaseEntity {

    @PrimaryGeneratedColumn()
    brandId: number;

    // Nom normalisé (trim + lowercase) utilisé comme clé de correspondance insensible à la casse
    @Column({ unique: true })
    nameKey: string;

    // Nom d'affichage tel que choisi lors de la première création
    @Column()
    name: string;

    @Column()
    textColor: string;

    @Column()
    bgColor: string;

    @Column({ type: 'varchar', nullable: true })
    gradientColor: string | null;
}
