import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class ScanReceiptDto {
  @ApiProperty({ description: "Image du ticket de caisse encodée en base64 (sans le préfixe data:...)" })
  @IsString()
  @IsNotEmpty()
  imageBase64: string;

  @ApiProperty({ description: 'Type MIME de l\'image (ex. image/jpeg)' })
  @IsString()
  @IsNotEmpty()
  mimeType: string;
}
