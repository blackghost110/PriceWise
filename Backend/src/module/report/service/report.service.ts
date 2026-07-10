import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ReportEntity, ReportStatus } from '../model/report.entity';
import { CreateReportDto } from '../model/dto/create-report.dto';
import { Credential } from '../../../security/model/entity/credential.entity';
import {
  ReportCreateException,
  ReportGetAllException,
  ReportNotFoundException,
  ReportUpdateException,
} from '../report.exception';

@Injectable()
export class ReportService {
  private readonly logger = new Logger(ReportService.name);

  constructor(
    @InjectRepository(ReportEntity)
    private readonly reportRepository: Repository<ReportEntity>,
  ) {}

  /** Crée un signalement pour l'utilisateur courant (le signaleur). */
  async create(user: Credential, dto: CreateReportDto): Promise<ReportEntity> {
    try {
      const report = this.reportRepository.create({
        ...dto,
        credentialId: user.credentialId,
        status: ReportStatus.PENDING,
      });
      return await this.reportRepository.save(report);
    } catch (e) {
      this.logger.error('report create failed', e);
      throw new ReportCreateException();
    }
  }

  /** Liste les signalements, filtrés par statut si fourni, du plus récent au plus ancien. */
  async findAll(status?: ReportStatus): Promise<ReportEntity[]> {
    try {
      return await this.reportRepository.find({
        where: status ? { status } : {},
        relations: { credential: true },
        order: { created: 'DESC' },
      });
    } catch (e) {
      this.logger.error('report findAll failed', e);
      throw new ReportGetAllException();
    }
  }

  /** Récupère un signalement par id (avec le signaleur). */
  async findOne(reportId: number): Promise<ReportEntity> {
    const report = await this.reportRepository.findOne({
      where: { reportId },
      relations: { credential: true },
    });
    if (!report) {
      throw new ReportNotFoundException();
    }
    return report;
  }

  /** Met à jour le statut d'un signalement (PENDING <-> RESOLVED). */
  async updateStatus(reportId: number, status: ReportStatus): Promise<ReportEntity> {
    const report = await this.findOne(reportId);
    try {
      report.status = status;
      return await this.reportRepository.save(report);
    } catch (e) {
      this.logger.error('report updateStatus failed', e);
      throw new ReportUpdateException();
    }
  }
}
