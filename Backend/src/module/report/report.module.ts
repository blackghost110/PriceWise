import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportEntity } from './model/report.entity';
import { ReportService } from './service/report.service';
import { ReportController } from './controller/report.controller';
import { Credential } from '../../security/model/entity/credential.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ReportEntity, Credential])],
  controllers: [ReportController],
  providers: [ReportService],
  exports: [ReportService],
})
export class ReportModule {}
