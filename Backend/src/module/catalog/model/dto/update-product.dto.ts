import {ApiProperty} from "@nestjs/swagger";
import {IsNotEmpty, IsNumber, IsOptional} from "class-validator";
import {ProductUnitType} from "../product.entity";

export class UpdateProductDto {

    @ApiProperty()
    @IsNotEmpty()
    name: string;

    @ApiProperty()
    @IsOptional()
    brand: string;

    @ApiProperty()
    unit: ProductUnitType;

    @ApiProperty()
    @IsNumber()
    quantity: number;

    @ApiProperty({ required: false })
    @IsOptional()
    ean?: string;
}
