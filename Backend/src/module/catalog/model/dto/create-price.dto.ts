import {ApiProperty} from "@nestjs/swagger";
import {IsNotEmpty, IsOptional} from "class-validator";

export class CreatePriceDto {

    @ApiProperty()
    @IsNotEmpty()
    productPrice: number;

    @ApiProperty()
    @IsNotEmpty()
    grossPrice: number;

    @ApiProperty({
        type: Date,
        format: 'date',
        default: () => 'CURRENT_DATE',
    })
    @IsOptional()
    priceDate: Date;

}