import {ApiProperty} from "@nestjs/swagger";
import { IsNotEmpty } from 'class-validator';

export class UpdateListDto {

    @ApiProperty()
    @IsNotEmpty()
    name: string;

}