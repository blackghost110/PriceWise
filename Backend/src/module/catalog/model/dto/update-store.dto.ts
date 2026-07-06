import { ApiProperty } from '@nestjs/swagger';
import { IsHexColor, IsNotEmpty, IsOptional } from 'class-validator';

export class UpdateStoreDto {

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

  // Si fourni, met à jour la marque partagée (couleurs) pour ce nom de magasin
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