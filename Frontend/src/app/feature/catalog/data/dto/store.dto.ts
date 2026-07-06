import {StoreBrandDto} from '@features/catalog/data/dto/store-brand.dto';

export interface StoreDto {
  storeId: string;
  name: string;
  street: string;
  number: string;
  postalCode: string;
  city: string;
  credentialId: string;
  created: Date;
  brand?: StoreBrandDto | null;
}
