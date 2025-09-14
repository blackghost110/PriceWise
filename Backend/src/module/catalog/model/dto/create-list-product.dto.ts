import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional } from 'class-validator';

export class CreateListProductDto {

  @ApiProperty()
  @IsNotEmpty()
  listId: number;

  @ApiProperty()
  @IsNotEmpty()
  productId: number;

}