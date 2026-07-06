import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StoreBrandEntity } from '../model/store-brand.entity';

export interface StoreBrandColors {
  textColor?: string;
  bgColor?: string;
  gradientColor?: string;
}

const DEFAULT_TEXT_COLOR = '#ffffff';
const DEFAULT_BG_COLOR = '#43a047';

@Injectable()
export class StoreBrandService {
  constructor(
    @InjectRepository(StoreBrandEntity)
    private readonly storeBrandRepository: Repository<StoreBrandEntity>,
  ) {}

  private normalize(name: string): string {
    return name.trim().toLowerCase();
  }

  async getBrandByName(name: string): Promise<StoreBrandEntity | null> {
    if (!name) {
      return null;
    }
    return this.storeBrandRepository.findOne({ where: { nameKey: this.normalize(name) } });
  }

  /**
   * Garantit "1 seule couleur par nom de magasin" : si une marque existe déjà pour ce nom,
   * elle est retournée telle quelle (les couleurs soumises sont ignorées). Sinon, une nouvelle
   * marque est créée à partir des couleurs fournies (avec valeurs par défaut si absentes).
   */
  async resolveForCreate(name: string, colors: StoreBrandColors): Promise<StoreBrandEntity> {
    const nameKey = this.normalize(name);
    const existing = await this.storeBrandRepository.findOne({ where: { nameKey } });
    if (existing) {
      return existing;
    }

    const brand = new StoreBrandEntity();
    brand.nameKey = nameKey;
    brand.name = name;
    brand.textColor = colors.textColor ?? DEFAULT_TEXT_COLOR;
    brand.bgColor = colors.bgColor ?? DEFAULT_BG_COLOR;
    brand.gradientColor = colors.gradientColor ?? null;

    try {
      return await this.storeBrandRepository.save(brand);
    } catch (e) {
      // Course concurrente : un autre appel a créé la marque entre-temps -> on la relit.
      const raceWinner = await this.storeBrandRepository.findOne({ where: { nameKey } });
      if (raceWinner) {
        return raceWinner;
      }
      throw e;
    }
  }

  /**
   * Met à jour la marque partagée d'un nom de magasin (ou la crée si absente).
   * Tous les magasins portant ce nom suivront automatiquement la nouvelle couleur.
   */
  async upsertForUpdate(name: string, colors: StoreBrandColors): Promise<StoreBrandEntity> {
    const nameKey = this.normalize(name);
    const existing = await this.storeBrandRepository.findOne({ where: { nameKey } });

    const brand = existing ?? new StoreBrandEntity();
    brand.nameKey = nameKey;
    brand.name = name;
    brand.textColor = colors.textColor ?? brand.textColor ?? DEFAULT_TEXT_COLOR;
    brand.bgColor = colors.bgColor ?? brand.bgColor ?? DEFAULT_BG_COLOR;
    brand.gradientColor = colors.gradientColor ?? null;

    return this.storeBrandRepository.save(brand);
  }
}
