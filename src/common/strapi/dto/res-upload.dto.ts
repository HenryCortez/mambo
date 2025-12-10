import { ApiProperty } from '@nestjs/swagger';

export class ResUploadDto {
  @ApiProperty({ description: 'URL del archivo subido' })
  url: string;
  
  @ApiProperty({ description: 'ID del archivo en Strapi' })
  id: number;
  
  @ApiProperty({ description: 'Nombre original del archivo' })
  name: string;
}