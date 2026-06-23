import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsNotEmpty } from 'class-validator';

export class UpdateUserPayload {

  @ApiProperty({ enum: ['USER', 'ADMIN'] })
  @IsNotEmpty()
  @IsIn(['USER', 'ADMIN'])
  role: string

}
