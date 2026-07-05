import { Body, Controller, Get, Put } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { User } from '@common/config/decorator/user.decorator';
import { Credential } from '../../../security/model/entity/credential.entity';
import { BadgeService } from '../service/badge.service';
import { XpService } from '../service/xp.service';
import { SetActiveBadgeDto } from '../model/dto/set-active-badge.dto';
import { GamificationProfileException } from '../gamification.exception';

@ApiBearerAuth('access-token')
@ApiTags('Badge')
@Controller('badge')
export class BadgeController {
  constructor(
    private readonly service: BadgeService,
    private readonly xpService: XpService,
  ) {}

  @Get('overview')
  public overview(@User() user: Credential) {
    return this.service.getOverview(user.credentialId);
  }

  @Put('active')
  public setActiveBadge(@User() user: Credential, @Body() dto: SetActiveBadgeDto) {
    return this.service.setActiveBadge(user.credentialId, dto.activeBadge);
  }

  @Get('profile')
  public async getProfileGamification(@User() user: Credential) {
    try {
      return await this.xpService.getProfileGamification(user);
    } catch (e) {
      throw new GamificationProfileException();
    }
  }
}
