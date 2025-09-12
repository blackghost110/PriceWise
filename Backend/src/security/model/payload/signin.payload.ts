import {ApiProperty} from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';
export class SignInPayload {

    @ApiProperty({example: 'johndoe'})
    @IsNotEmpty()
    username: string;

    @ApiProperty({example: '12345678'})
    @IsNotEmpty()
    password: string;
}