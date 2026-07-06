import { Controller, Get, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { LeaderboardService } from '../service/leaderboard.service';
import { LeaderboardPeriod } from '../model/type/leaderboard.response';

@ApiBearerAuth('access-token')
@ApiTags('Leaderboard')
@Controller('leaderboard')
export class LeaderboardController {
  constructor(private readonly service: LeaderboardService) {}

  @Get()
  public getLeaderboard(@Query('period') period?: LeaderboardPeriod) {
    return this.service.getLeaderboard(period === 'month' ? 'month' : 'all');
  }
}
