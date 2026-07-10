import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsNotEmpty, MaxLength } from 'class-validator';
import { ReportTargetType } from '../report.entity';

export class CreateReportDto {

  @ApiProperty({ enum: ReportTargetType })
  @IsIn(Object.values(ReportTargetType))
  targetType: ReportTargetType;

  @ApiProperty()
  @IsNotEmpty()
  targetId: string;

  @ApiProperty()
  @IsNotEmpty()
  @MaxLength(1000)
  description: string;
}
