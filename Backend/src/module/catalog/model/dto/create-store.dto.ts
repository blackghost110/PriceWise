import {ApiProperty} from "@nestjs/swagger";
import {IsHexColor, IsNotEmpty, IsOptional} from "class-validator";

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

    // Couleurs du badge (utilisées uniquement si aucune marque n'existe déjà pour ce nom)
    @ApiProperty({ required: false })
    @IsOptional()
    @IsHexColor()
    textColor?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsHexColor()
    bgColor?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsHexColor()
    gradientColor?: string;
}