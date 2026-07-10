import {ApiProperty} from "@nestjs/swagger";
import {IsNotEmpty, IsNumber, IsOptional} from "class-validator";
import {ProductUnitType} from "../product.entity";

export class CreateProductDto {

    @ApiProperty()
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

    // @ApiProperty()
    // @IsNumber()
    // storeId: number;

    @ApiProperty()
    @IsNumber()
    @IsNotEmpty()
    initialPrice: number;

    @ApiProperty()
    @IsNumber()
    @IsNotEmpty()
    initialReferencePrice: number;
}