import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Credential } from '../../../security/model/entity/credential.entity';
import { StoreEntity } from '../../catalog/model/store.entity';
import { ProductEntity } from '../../catalog/model/product.entity';
import { PriceEntity } from '../../catalog/model/price.entity';
import { PostEntity } from '../../social/model/post.entity';
import { CommentEntity } from '../../social/model/comment.entity';
import { BadgeActionType, BadgeEntity } from '../model/badge.entity';
import { UserBadgeEntity } from '../model/user-badge.entity';
import { BadgeOverviewResponse, CategoryProgress, TierProgress } from '../model/type/badge-overview.response';
import {
  BadgeOverviewException,
  BadgeSetActiveException,
  BadgeSetActiveNotUnlockedException,
} from '../gamification.exception';

@Injectable()
export class BadgeService {
  constructor(
    @InjectRepository(BadgeEntity) private readonly badgeRepository: Repository<BadgeEntity>,
    @InjectRepository(UserBadgeEntity) private readonly userBadgeRepository: Repository<UserBadgeEntity>,
    @InjectRepository(Credential) private readonly credentialRepository: Repository<Credential>,
    @InjectRepository(StoreEntity) private readonly storeRepository: Repository<StoreEntity>,
    @InjectRepository(ProductEntity) private readonly productRepository: Repository<ProductEntity>,
    @InjectRepository(PriceEntity) private readonly priceRepository: Repository<PriceEntity>,
    @InjectRepository(PostEntity) private readonly postRepository: Repository<PostEntity>,
    @InjectRepository(CommentEntity) private readonly commentRepository: Repository<CommentEntity>,
  ) {}

  // Recalcule la progression de l'utilisateur, synchronise les badges nouvellement débloqués
  // dans user_badge, et renvoie la vue d'ensemble groupée par catégorie.
  async getOverview(credentialId: string): Promise<BadgeOverviewResponse> {
    try {
      const credential = await this.credentialRepository.findOneBy({ credentialId });
      if (!credential) {
        throw new BadgeOverviewException();
      }

      const badges = await this.badgeRepository.find({
        order: { categoryName: 'ASC', requirementCount: 'ASC' },
      });

      const unlockedRows = await this.userBadgeRepository.find({ where: { credentialId } });
      const unlockedBadgeIds = new Set(unlockedRows.map((row) => row.badgeId));

      // Un seul calcul de compteur par actionType (partagé par tous les paliers de la catégorie)
      const countsByActionType = new Map<BadgeActionType, number>();
      const actionTypes = new Set(badges.map((badge) => badge.actionType));
      for (const actionType of actionTypes) {
        countsByActionType.set(actionType, await this.computeCurrentCount(actionType, credential));
      }

      // Sync : on insère dans user_badge les paliers nouvellement franchis
      const newlyUnlocked: UserBadgeEntity[] = [];
      for (const badge of badges) {
        const currentCount = countsByActionType.get(badge.actionType) ?? 0;
        if (currentCount >= badge.requirementCount && !unlockedBadgeIds.has(badge.badgeId)) {
          const userBadge = new UserBadgeEntity();
          userBadge.credentialId = credentialId;
          userBadge.badgeId = badge.badgeId;
          newlyUnlocked.push(userBadge);
          unlockedBadgeIds.add(badge.badgeId);
        }
      }
      if (newlyUnlocked.length > 0) {
        await this.userBadgeRepository.save(newlyUnlocked);
      }

      // Regroupement par catégorie (les paliers arrivent déjà triés par requirementCount ASC)
      const categoriesByName = new Map<string, CategoryProgress>();
      for (const badge of badges) {
        if (!categoriesByName.has(badge.categoryName)) {
          categoriesByName.set(badge.categoryName, {
            categoryName: badge.categoryName,
            actionType: badge.actionType,
            currentCount: countsByActionType.get(badge.actionType) ?? 0,
            tiers: [],
            nextTier: null,
          });
        }
        categoriesByName.get(badge.categoryName)!.tiers.push({
          badgeId: badge.badgeId,
          tierName: badge.tierName,
          tier: badge.tier,
          requirementCount: badge.requirementCount,
          unlocked: unlockedBadgeIds.has(badge.badgeId),
        });
      }

      const categories = Array.from(categoriesByName.values()).map((category) => ({
        ...category,
        nextTier: category.tiers.find((tier) => !tier.unlocked) ?? null,
      }));

      return { categories, unlockedCount: unlockedBadgeIds.size };
    } catch (e) {
      throw new BadgeOverviewException();
    }
  }

  async setActiveBadge(credentialId: string, tierName: string | null): Promise<Credential> {
    const credential = await this.credentialRepository.findOneBy({ credentialId });
    if (!credential) {
      throw new BadgeSetActiveException();
    }

    if (tierName !== null) {
      const badge = await this.badgeRepository.findOneBy({ tierName });
      const isUnlocked = badge
        ? await this.userBadgeRepository.findOneBy({ credentialId, badgeId: badge.badgeId })
        : null;
      if (!badge || !isUnlocked) {
        throw new BadgeSetActiveNotUnlockedException();
      }
    }

    try {
      credential.activeBadge = tierName;
      return await this.credentialRepository.save(credential);
    } catch (e) {
      throw new BadgeSetActiveException();
    }
  }

  // Traduit un actionType en compteur courant pour l'utilisateur, cf. mapping fourni :
  // Cartographe=ADD_STORE, Sourceur=ADD_PRODUCT, Chroniqueur=ADD_PRICE, Baron=STORE_POPULARITY,
  // Boussole=PRODUCT_POPULARITY, Inoxydable=WEEKLY_CIRCLE, Nomade=ADD_POSTAL_CODE,
  // Plume=FORUM_POST, Sniper=REPORT_PRICE_DROP
  private async computeCurrentCount(actionType: BadgeActionType, credential: Credential): Promise<number> {
    const credentialId = credential.credentialId;
    switch (actionType) {
      case BadgeActionType.ADD_STORE:
        return this.storeRepository.count({ where: { credentialId } });

      case BadgeActionType.ADD_PRODUCT:
        return this.productRepository.count({ where: { credentialId } });

      case BadgeActionType.ADD_PRICE:
        return this.priceRepository.count({ where: { user: { credentialId } } });

      case BadgeActionType.ADD_POSTAL_CODE:
        return this.getDistinctPostalCodeCount(credentialId);

      case BadgeActionType.STORE_POPULARITY:
        return this.getMaxProductsPerStore(credentialId);

      case BadgeActionType.PRODUCT_POPULARITY:
        return this.getMaxPricesPerProduct(credentialId);

      case BadgeActionType.FORUM_POST:
        return this.getForumActivityCount(credentialId);

      case BadgeActionType.WEEKLY_CIRCLE:
        return credential.weeklyCircle;

      case BadgeActionType.REPORT_PRICE_DROP:
        // Fonctionnalité de signalement non implémentée pour l'instant
        return 0;

      default:
        return 0;
    }
  }

  // Nomade : SELECT COUNT(DISTINCT postalCode) FROM store WHERE credentialId = X
  private async getDistinctPostalCodeCount(credentialId: string): Promise<number> {
    const result = await this.storeRepository
      .createQueryBuilder('store')
      .select('COUNT(DISTINCT store.postalCode)', 'count')
      .where('store.credentialId = :credentialId', { credentialId })
      .getRawOne();
    return parseInt(result?.count, 10) || 0;
  }

  // Baron : MAX(nb produits) parmi les magasins créés par X
  private async getMaxProductsPerStore(credentialId: string): Promise<number> {
    const rows = await this.productRepository
      .createQueryBuilder('product')
      .innerJoin('product.store', 'store')
      .select('COUNT(product.productId)', 'count')
      .where('store.credentialId = :credentialId', { credentialId })
      .groupBy('store.storeId')
      .getRawMany();
    return rows.reduce((max, row) => Math.max(max, parseInt(row.count, 10) || 0), 0);
  }

  // Boussole : MAX(nb prix) parmi les produits créés par X
  private async getMaxPricesPerProduct(credentialId: string): Promise<number> {
    const rows = await this.priceRepository
      .createQueryBuilder('price')
      .innerJoin('price.product', 'product')
      .select('COUNT(price.priceId)', 'count')
      .where('product.credentialId = :credentialId', { credentialId })
      .groupBy('product.productId')
      .getRawMany();
    return rows.reduce((max, row) => Math.max(max, parseInt(row.count, 10) || 0), 0);
  }

  // Plume : posts + commentaires écrits par X
  private async getForumActivityCount(credentialId: string): Promise<number> {
    const postCount = await this.postRepository.count({ where: { user: { credentialId } } });
    const commentCount = await this.commentRepository.count({ where: { user: { credentialId } } });
    return postCount + commentCount;
  }
}
