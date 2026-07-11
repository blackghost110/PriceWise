import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsIn, IsNotEmpty, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class ApplyReceiptItemDto {
  @ApiProperty({ required: false, description: "Id du produit existant à mettre à jour ; absent/null = créer un nouveau produit" })
  @IsOptional()
  @IsNumber()
  productId?: number | null;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  brand?: string;

  @ApiProperty({ enum: ['g', 'ml', 'p'] })
  @IsIn(['g', 'ml', 'p'])
  unit: 'g' | 'ml' | 'p';

  @ApiProperty()
  @IsNumber()
  quantity: number;

  @ApiProperty()
  @IsNumber()
  productPrice: number;

  @ApiProperty()
  @IsNumber()
  referencePrice: number;
}

export class ApplyReceiptDto {
  @ApiProperty({ type: [ApplyReceiptItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ApplyReceiptItemDto)
  items: ApplyReceiptItemDto[];
}
