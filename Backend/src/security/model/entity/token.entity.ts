import {Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn} from 'typeorm';
import {Credential} from './credential.entity';

@Entity({ name: 'token'})
export class Token {
    @PrimaryGeneratedColumn("uuid")
    token_id: string;

    @Column({nullable: false})
    token: string;

    @Column({nullable: false})
    refreshToken: string;

    @OneToOne(() => Credential,{eager:true})
    @JoinColumn({name: 'credential_id'})
    credential: Credential

}