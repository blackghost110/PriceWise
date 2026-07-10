import {ChangeDetectionStrategy, Component, computed, inject, OnInit, signal} from '@angular/core';
import {Footer} from '@core/layout/footer/footer';
import {Header} from '@core/layout/header/header';
import {ForumNav} from '@features/social/component/forum-nav/forum-nav';
import {catchError, EMPTY} from 'rxjs';
import {HttpErrorResponse} from '@angular/common/http';
import {SocialService} from '@features/social/service/social.service';
import {AuthService} from '@core/auth/auth.service';
import {ErrorMessageService} from '@shared/api/service/error-message.service';
import {LeaderboardEntryDto, LeaderboardPeriod} from '@features/social/data/dto/leaderboard-entry.dto';

type Scale = 'global' | 'local';

export interface LeaderboardRow extends LeaderboardEntryDto {
  rank: number;
  isMe: boolean;
}

interface MonthCountdown {
  days: number;
  hours: number;
  minutes: number;
}

// Palette cyclique assignée par utilisateur (userId) pour le dégradé d'avatar placeholder.
const AVATAR_PALETTE = ['#c8704a', '#5b8dd9', '#43a047', '#8e63c9', '#e0a03c', '#3caea3', '#d16b8f'];

const XP_FORMATTER = new Intl.NumberFormat('fr-FR');

@Component({
  selector: 'app-leaderboard',
  imports: [
    Footer,
    Header,
    ForumNav,
  ],
  templateUrl: './leaderboard.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './leaderboard.css'
})
export class Leaderboard implements OnInit {

  private readonly socialService = inject(SocialService);
  private readonly authService = inject(AuthService);
  private readonly errorMessageService = inject(ErrorMessageService);

  isLoading = signal(false);
  errorMessage = signal<string | null>(null);

  scale = signal<Scale>('global');
  period = signal<LeaderboardPeriod>('all');

  private readonly currentUser = this.authService.currentUser;

  /** Classement reçu du backend (déjà trié par XP décroissant), enrichi du rang et de isMe. */
  entries = computed<LeaderboardRow[]>(() => {
    const raw = this.socialService.leaderboard();
    const myId = this.currentUser()?.credentialId;
    if (!raw) return [];
    return raw.map((entry, index) => ({
      ...entry,
      rank: index + 1,
      isMe: entry.userId === myId,
    }));
  });

  /** Top 3 pour le podium. */
  podium = computed(() => this.entries().slice(0, 3));

  /** Rang 4 et suivants pour la liste classée. */
  rest = computed(() => this.entries().slice(3));

  /** Compte à rebours jusqu'à la fin du mois — calculé une fois au chargement (pas besoin de live). */
  monthCountdown = signal<MonthCountdown>(this.computeMonthCountdown());

  ngOnInit() {
    this.loadLeaderboard();
  }

  setScale(scale: Scale) {
    this.scale.set(scale);
  }

  setPeriod(period: LeaderboardPeriod) {
    if (this.period() === period) return;
    this.period.set(period);
    if (period === 'month') {
      this.monthCountdown.set(this.computeMonthCountdown());
    }
    this.loadLeaderboard();
  }

  private loadLeaderboard() {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.socialService.getLeaderboard(this.period()).pipe(
      catchError((err: HttpErrorResponse) => {
        this.errorMessage.set(this.errorMessageService.getErrorMessage(err.error?.code, err.error?.data));
        return EMPTY;
      })
    ).subscribe(() => this.isLoading.set(false));
  }

  private computeMonthCountdown(): MonthCountdown {
    const now = new Date();
    const nextMonthStart = new Date(now.getFullYear(), now.getMonth() + 1, 1, 0, 0, 0);
    const diffMs = Math.max(nextMonthStart.getTime() - now.getTime(), 0);

    const days = Math.floor(diffMs / (24 * 60 * 60 * 1000));
    const hours = Math.floor((diffMs % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
    const minutes = Math.floor((diffMs % (60 * 60 * 1000)) / (60 * 1000));

    return {days, hours, minutes};
  }

  // ── Helpers d'affichage ──────────────────────────────────────────────────

  initials(name: string): string {
    return name
      .split(' ')
      .map(w => w[0] ?? '')
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  avatarGradient(userId: string): string {
    const color = this.avatarColor(userId);
    return `linear-gradient(145deg, ${color}, ${color}cc)`;
  }

  formatXp(xp: number): string {
    return XP_FORMATTER.format(xp);
  }

  medalColor(rank: number): string {
    switch (rank) {
      case 1: return '#e0a03c';
      case 2: return '#757575';
      case 3: return '#c8724a';
      default: return '#2e7d32';
    }
  }

  private avatarColor(userId: string): string {
    let hash = 0;
    for (let i = 0; i < userId.length; i++) {
      hash = (hash * 31 + userId.charCodeAt(i)) >>> 0;
    }
    return AVATAR_PALETTE[hash % AVATAR_PALETTE.length];
  }
}
