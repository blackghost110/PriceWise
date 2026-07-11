import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Body, Controller, Param, Post } from '@nestjs/common';
import { ReceiptService } from '../service/receipt.service';
import { ScanReceiptDto } from '../model/dto/scan-receipt.dto';
import { ApplyReceiptDto } from '../model/dto/apply-receipt.dto';
import { User } from '@common/config/decorator/user.decorator';
import { Credential } from '../../../security/model/entity/credential.entity';

@ApiBearerAuth('access-token')
@ApiTags('Receipt Controller')
@Controller()
export class ReceiptController {
  constructor(private readonly receiptService: ReceiptService) {}

  @Post('receipt/scan/:storeId')
  @ApiOperation({
    summary: 'Scanner un ticket de caisse',
    description: "Analyse l'image d'un ticket via l'IA (Gemini) et relie chaque article détecté aux produits existants du magasin",
  })
  async scanReceipt(@Param('storeId') storeId: number, @Body() dto: ScanReceiptDto) {
    return await this.receiptService.scan(storeId, dto);
  }

  @Post('receipt/apply/:storeId')
  @ApiOperation({
    summary: 'Appliquer un ticket scanné',
    description: 'Crée les nouveaux produits confirmés et met à jour le prix du jour des produits déjà existants',
  })
  async applyReceipt(@User() user: Credential, @Param('storeId') storeId: number, @Body() dto: ApplyReceiptDto) {
    return await this.receiptService.apply(user, storeId, dto);
  }
}
