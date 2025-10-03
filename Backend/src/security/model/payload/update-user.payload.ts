import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class UpdateUserPayload {

  @ApiProperty()
  @IsNotEmpty()
  isAdmin: boolean

}