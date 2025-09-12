import {Exclude} from "class-transformer";
import {CreateDateColumn, UpdateDateColumn} from "typeorm";

export abstract class BaseEntity {

    @CreateDateColumn()
    created: Date;

    @Exclude({ toPlainOnly: true })
    @UpdateDateColumn()
    updated: Date;
}