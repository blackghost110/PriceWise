import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  effect,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import {NgClass} from '@angular/common';
import {Header} from '@core/layout/header/header';
import {Footer} from '@core/layout/footer/footer';
import {FormControl, ReactiveFormsModule, Validators} from '@angular/forms';
import {MatFormField, MatLabel} from '@angular/material/form-field';
import {MatInput} from '@angular/material/input';
import {MatButton, MatIconButton} from '@angular/material/button';
import {MatOptgroup, MatOption, MatSelect} from '@angular/material/select';
import {MatIcon} from '@angular/material/icon';
import {MatTooltip} from '@angular/material/tooltip';
import {catchError, EMPTY} from 'rxjs';
import {takeUntilDestroyed, toSignal} from '@angular/core/rxjs-interop';
import {AuthService} from '@core/auth/auth.service';
import {AccountService} from '@features/account/service/account.service';
import {BadgeService} from '@features/account/service/badge.service';
import {ErrorMessageService} from '@shared/api/service/error-message.service';
import {HttpErrorResponse} from '@angular/common/http';
import {BadgeTier, CategoryProgressDto, TierProgressDto} from '@features/account/data/dto/badge-overview.dto';

@Component({
  selector: 'app-profile',
  imports: [
    NgClass,
    Header,
    Footer,
    ReactiveFormsModule,
    MatFormField,
    MatLabel,
    MatInput,
    MatButton,
    MatIconButton,
    MatIcon,
    MatTooltip,
    MatSelect,
    MatOption,
    MatOptgroup,
  ],
  templateUrl: './profile.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './profile.css',
})
export class Profile implements OnInit, AfterViewInit {

  private readonly destroyRef = inject(DestroyRef);
  private readonly errorMessageService = inject(ErrorMessageService);

  readonly authService = inject(AuthService);
  private readonly accountService = inject(AccountService);
  private readonly badgeService = inject(BadgeService);

  // ── Données réactives ────────────────────────────────────────────────────
  currentUser = this.authService.currentUser;
  overview     = this.badgeService.overview;
  profileStats = this.badgeService.profileStats;

  // ── État UI ──────────────────────────────────────────────────────────────
  isEditing = signal(false);
  /** Déclenche les transitions SVG après 120 ms (animation d'entrée) */
  animated  = signal(false);

  // ── Formulaires (réutilisés de l'ancienne page) ──────────────────────────
  displayNameControl = new FormControl<string>('', {nonNullable: true, validators: [Validators.required]});
  availability       = signal<'idle' | 'checking' | 'available' | 'taken'>('idle');
  displayNameError   = signal<string | null>(null);

  activeBadgeControl = new FormControl<string | null>(null);
  activeBadgeError   = signal<string | null>(null);

  // ── Computed ─────────────────────────────────────────────────────────────

  initials = computed(() => {
    const name = this.currentUser()?.displayName ?? '';
    return name
      .split(' ')
      .map(w => w[0] ?? '')
      .join('')
      .toUpperCase()
      .slice(0, 2);
  });

  /** Nom de code = titre du badge actif */
  codename = computed(() => this.currentUser()?.activeBadge ?? null);

  /** Catégories ayant au moins un palier débloqué (pour la sélection de badge actif) */
  unlockedCategories = computed(() => {
    const overview = this.overview();
    if (!overview) return [];
    return overview.categories
      .map(c => ({categoryName: c.categoryName, tiers: c.tiers.filter(t => t.unlocked)}))
      .filter(c => c.tiers.length > 0);
  });

  // ── Cercle XP ────────────────────────────────────────────────────────────
  readonly xpCircumference = 2 * Math.PI * 58; // ≈ 364.42

  xpOffset = computed(() => {
    const stats = this.profileStats();
    if (!stats) return this.xpCircumference; // chargement → cercle vide
    if (stats.xpForNextLevel === 0) return 0; // niveau max → cercle plein
    const ratio = Math.min(stats.xpIntoLevel / stats.xpForNextLevel, 1);
    return this.xpCircumference * (1 - ratio);
  });

  // ── Cercle hebdomadaire ───────────────────────────────────────────────────
  readonly weeklyCircumference = 2 * Math.PI * 32; // ≈ 201.06

  weeklyCount = computed(() => Math.min(this.profileStats()?.weeklyCount ?? 0, 10));
  weeklyCompleted = computed(() => this.profileStats()?.weeklyCircleCompleted ?? false);
  weekDays    = computed(() => this.profileStats()?.weekDays ?? [false, false, false, false, false, false, false]);

  weeklyOffset = computed(() => {
    const count = this.weeklyCount();
    return this.weeklyCircumference * (1 - count / 10);
  });

  readonly dayLabels = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];

  // ── Progression badges ────────────────────────────────────────────────────
  unlockedCount  = computed(() => this.overview()?.unlockedCount ?? 0);
  totalBadgeCount = computed(() => {
    const overview = this.overview();
    if (!overview) return 36; // valeur par défaut
    return overview.categories.reduce((sum, c) => sum + c.tiers.length, 0);
  });
  badgePct = computed(() => {
    const total = this.totalBadgeCount();
    return total === 0 ? 0 : Math.round((this.unlockedCount() / total) * 100);
  });

  // ── Lifecycle ─────────────────────────────────────────────────────────────

  constructor() {
    // Déclenche les appels HTTP et laisse le service alimenter ses signals via tap()
    toSignal(this.badgeService.getOverview().pipe(catchError(() => EMPTY)));
    toSignal(this.badgeService.getProfileGamification().pipe(catchError(() => EMPTY)));

    // Réinitialise la dispo à chaque frappe — effect remplace le subscribe non-HTTP
    const displayNameValue = toSignal(this.displayNameControl.valueChanges, { initialValue: '' });
    effect(() => {
      displayNameValue();
      this.availability.set('idle');
    });
  }

  ngOnInit() {
    const user = this.currentUser();
    this.displayNameControl.setValue(user?.displayName ?? '');
    this.activeBadgeControl.setValue(user?.activeBadge ?? null);
  }

  ngAfterViewInit() {
    // Déclenche les animations SVG après le rendu initial
    setTimeout(() => this.animated.set(true), 120);
  }

  // ── Actions édition ───────────────────────────────────────────────────────

  toggleEdit() {
    this.isEditing.update(v => !v);
    if (!this.isEditing()) {
      // Réinitialise l'état quand on ferme
      this.availability.set('idle');
      this.displayNameError.set(null);
      this.activeBadgeError.set(null);
    }
  }

  onCheckAvailability() {
    const value = this.displayNameControl.value.trim();
    if (!value) return;
    this.availability.set('checking');
    this.displayNameError.set(null);

    this.accountService.checkDisplayNameAvailable(value).pipe(
      takeUntilDestroyed(this.destroyRef),
      catchError((err: HttpErrorResponse) => {
        this.availability.set('idle');
        this.displayNameError.set(this.errorMessageService.getErrorMessage(err.error?.code, err.error?.data));
        return EMPTY;
      })
    ).subscribe(result => {
      this.availability.set(result.available ? 'available' : 'taken');
    });
  }

  onApplyDisplayName() {
    if (this.availability() !== 'available') return;
    this.displayNameError.set(null);

    this.accountService.updateDisplayName({displayName: this.displayNameControl.value.trim()}).pipe(
      takeUntilDestroyed(this.destroyRef),
      catchError((err: HttpErrorResponse) => {
        this.displayNameError.set(this.errorMessageService.getErrorMessage(err.error?.code, err.error?.data));
        return EMPTY;
      })
    ).subscribe(async () => {
      this.availability.set('idle');
      await this.authService.refreshCurrentUser();
    });
  }

  onApplyActiveBadge() {
    this.activeBadgeError.set(null);

    this.accountService.setActiveBadge({activeBadge: this.activeBadgeControl.value}).pipe(
      takeUntilDestroyed(this.destroyRef),
      catchError((err: HttpErrorResponse) => {
        this.activeBadgeError.set(this.errorMessageService.getErrorMessage(err.error?.code, err.error?.data));
        return EMPTY;
      })
    ).subscribe(async () => {
      await this.authService.refreshCurrentUser();
    });
  }

  // ── Helpers badges ────────────────────────────────────────────────────────

  /** Construit le chemin de l'image du badge selon la catégorie et le palier le plus élevé débloqué. */
  getBadgeImage(category: CategoryProgressDto): string {
    const unlockedTiers = category.tiers.filter(t => t.unlocked);
    if (unlockedTiers.length === 0) {
      return '/image/badges/locked_badge.webp';
    }
    const highestTier = unlockedTiers[unlockedTiers.length - 1];
    const slug = this.categorySlug(category.categoryName);
    const tier = highestTier.tier.toLowerCase();
    return `/image/badges/${slug}_${tier}.webp`;
  }

  /** Retourne true si au moins un palier est débloqué dans la catégorie. */
  hasUnlockedTier(category: CategoryProgressDto): boolean {
    return category.tiers.some(t => t.unlocked);
  }

  /** Calcule le % de progression vers le prochain palier (0–100). */
  getCategoryProgressPct(category: CategoryProgressDto): number {
    if (!category.nextTier) return 100;
    if (category.nextTier.requirementCount <= 0) return 0;
    return Math.min((category.currentCount / category.nextTier.requirementCount) * 100, 100);
  }

  getCategoryProgressText(category: CategoryProgressDto): string {
    if (!category.nextTier) return `${category.currentCount} / ${category.tiers[category.tiers.length - 1]?.requirementCount ?? '?'}`;
    return `${category.currentCount} / ${category.nextTier.requirementCount}`;
  }

  /** Nom du prochain palier à débloquer (ou 'Complété' si tous débloqués). */
  getNextTierName(category: CategoryProgressDto): string {
    return category.nextTier?.tierName ?? 'Complété';
  }

  /** Classe de fond métallique selon le palier le plus élevé débloqué ('' si aucun). */
  getMetalClass(category: CategoryProgressDto): string {
    const unlockedTiers = category.tiers.filter(t => t.unlocked);
    if (unlockedTiers.length === 0) return '';
    const highest = unlockedTiers[unlockedTiers.length - 1].tier;
    const map: Record<BadgeTier, string> = {
      BRONZE:  'metal-bronze',
      ARGENT:  'metal-silver',
      OR:      'metal-gold',
      DIAMANT: 'metal-diamond',
    };
    return map[highest];
  }

  /**
   * Convertit le categoryName en slug pour les noms de fichiers d'images.
   * Cas spécial : 'Nomade' → 'explorateur' (l'asset s'appelle explorateur_*.webp).
   */
  private categorySlug(categoryName: string): string {
    const lower = categoryName.toLowerCase();
    if (lower === 'nomade') return 'explorateur';
    return lower;
  }

  // ── État dépliage cartes badges ───────────────────────────────────────────
  /** Noms de catégories actuellement dépliées (toggle indépendant par carte). */
  private expandedCategories = signal<Set<string>>(new Set());

  /** Paliers débloqués d'une catégorie, du plus bas au plus haut. */
  getUnlockedTiers(category: CategoryProgressDto): TierProgressDto[] {
    return category.tiers.filter(t => t.unlocked);
  }

  /** Une carte est dépliable dès qu'au moins 1 palier est débloqué. */
  isExpandable(category: CategoryProgressDto): boolean {
    return this.getUnlockedTiers(category).length >= 1;
  }

  isExpanded(category: CategoryProgressDto): boolean {
    return this.expandedCategories().has(category.categoryName);
  }

  /** Toggle du dépliage — no-op si la carte n'est pas dépliable. */
  toggleExpand(category: CategoryProgressDto): void {
    if (!this.isExpandable(category)) return;
    this.expandedCategories.update(set => {
      const next = new Set(set);
      next.has(category.categoryName)
        ? next.delete(category.categoryName)
        : next.add(category.categoryName);
      return next;
    });
  }

  /** Chemin d'image pour un palier précis (réutilise categorySlug). */
  getTierImage(category: CategoryProgressDto, tier: TierProgressDto): string {
    return `/image/badges/${this.categorySlug(category.categoryName)}_${tier.tier.toLowerCase()}.webp`;
  }
}
