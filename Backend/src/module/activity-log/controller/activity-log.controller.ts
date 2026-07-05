import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Controller, Get, UseGuards } from '@nestjs/common';
import { AdminGuard } from '@common/api/admin.guard';
import { ActivityLogService } from '../service/activity-log.service';
import { ActivityLogEntity } from '../model/activity-log.entity';

@ApiBearerAuth('access-token')
@ApiTags('Activity Log Controller')
@Controller('activityLog')
export class ActivityLogController {
  constructor(private readonly activityLogService: ActivityLogService) {}

  @UseGuards(AdminGuard)
  @Get()
  @ApiOperation({
    summary: "Lister le journal d'activité",
    description: "Récupère l'ensemble des logs d'activité (ADD/UPDATE/DELETE) du catalogue, triés du plus récent au plus ancien.",
  })
  async findAll(): Promise<ActivityLogEntity[]> {
    return this.activityLogService.findAll();
  }
}
