import { ApiProperty } from '@nestjs/swagger';
import { IsIn } from 'class-validator';
import { ReportStatus } from '../report.entity';

export class UpdateReportStatusDto {

  @ApiProperty({ enum: ReportStatus })
  @IsIn(Object.values(ReportStatus))
  status: ReportStatus;
}
