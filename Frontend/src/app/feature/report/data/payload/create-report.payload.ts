import { ReportTargetType } from '@features/report/data/dto/report.dto';

export interface CreateReportPayload {
  targetType: ReportTargetType;
  targetId: string;
  description: string;
}
