import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Body, Controller, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { AdminGuard } from '@common/api/admin.guard';
import { User } from '@common/config/decorator/user.decorator';
import { Credential } from '../../../security/model/entity/credential.entity';
import { ReportService } from '../service/report.service';
import { CreateReportDto } from '../model/dto/create-report.dto';
import { UpdateReportStatusDto } from '../model/dto/update-report-status.dto';
import { ReportStatus } from '../model/report.entity';

@ApiBearerAuth('access-token')
@ApiTags('Report Controller')
@Controller('report')
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  @Post()
  @ApiOperation({
    summary: 'Créer un signalement',
    description: "Permet à un utilisateur connecté de signaler un magasin, produit, post ou commentaire.",
  })
  async create(@User() user: Credential, @Body() dto: CreateReportDto) {
    return this.reportService.create(user, dto);
  }

  @UseGuards(AdminGuard)
  @Get()
  @ApiOperation({
    summary: 'Lister les signalements',
    description: 'Récupère les signalements, filtrables par statut (PENDING/RESOLVED), du plus récent au plus ancien.',
  })
  async findAll(@Query('status') status?: ReportStatus) {
    return this.reportService.findAll(status);
  }

  @UseGuards(AdminGuard)
  @Get(':reportId')
  @ApiOperation({
    summary: 'Détail d\'un signalement',
  })
  async findOne(@Param('reportId') reportId: number) {
    return this.reportService.findOne(reportId);
  }

  @UseGuards(AdminGuard)
  @Put(':reportId/status')
  @ApiOperation({
    summary: 'Modifier le statut d\'un signalement',
  })
  async updateStatus(@Param('reportId') reportId: number, @Body() dto: UpdateReportStatusDto) {
    return this.reportService.updateStatus(reportId, dto.status);
  }
}
