import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class SetActiveBadgeDto {

  // Le tierName du badge débloqué à afficher publiquement, ou null pour ne plus en afficher
  @ApiProperty({ required: false, nullable: true })
  @IsOptional()
  @IsString()
  activeBadge: string | null;

}
