import {ApiProperty} from "@nestjs/swagger";
import {IsOptional} from "class-validator";

export class UpdatePriceDto {

    @ApiProperty()
    @IsOptional()
    productPrice: number;

    @ApiProperty()
    @IsOptional()
    referencePrice: number;
}