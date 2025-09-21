import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class GetAllProductsQueryDTO {
  @ApiPropertyOptional({
    description: 'Filter by store name',
  })
  @IsOptional()
  @IsString()
  storeName?: string;

  @ApiPropertyOptional({
    description: 'Filter by postal code',
  })
  @IsOptional()
  @IsString()
  storePostalCode?: string;
}