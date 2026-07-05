import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateDisplayNamePayload {

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  displayName: string

}
