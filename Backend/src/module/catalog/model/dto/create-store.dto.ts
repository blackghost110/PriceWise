import {ApiProperty} from "@nestjs/swagger";
import {IsNotEmpty} from "class-validator";

export class CreateStoreDto {

    @ApiProperty()
    @IsNotEmpty()
    name: string;

    @ApiProperty()
    @IsNotEmpty()
    street: string;

    @ApiProperty()
    @IsNotEmpty()
    number: string;

    @ApiProperty()
    @IsNotEmpty()
    postalCode: string;

    @ApiProperty()
    @IsNotEmpty()
    city: string;
}