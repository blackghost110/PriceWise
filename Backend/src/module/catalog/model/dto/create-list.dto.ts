import {IsNotEmpty} from "class-validator";
import {ApiProperty} from "@nestjs/swagger";


export class CreateListDto {

    @ApiProperty()
    @IsNotEmpty()
    name: string;

}