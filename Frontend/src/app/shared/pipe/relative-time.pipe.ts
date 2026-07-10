import {Pipe, PipeTransform} from '@angular/core';

/**
 * Affiche une date sous forme relative courte ("à l'instant", "il y a 2 h", "hier",
 * "il y a 3 j"), avec repli sur une date courte au-delà d'une semaine.
 * La date complète reste disponible via un attribut [title] séparé (ex. `date | date:'medium'`).
 */
@Pipe({
  name: 'relativeTime',
  pure: true
})
export class RelativeTimePipe implements PipeTransform {

  transform(value: string | Date | null | undefined): string {
    if (!value) {
      return '';
    }

    const date = new Date(value);
    const diffMs = Date.now() - date.getTime();
    const diffMinutes = Math.floor(diffMs / (60 * 1000));

    if (diffMinutes < 1) {
      return "à l'instant";
    }
    if (diffMinutes < 60) {
      return `il y a ${diffMinutes} min`;
    }

    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) {
      return `il y a ${diffHours} h`;
    }

    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) {
      return 'hier';
    }
    if (diffDays < 7) {
      return `il y a ${diffDays} j`;
    }

    return date.toLocaleDateString('fr-BE', {day: 'numeric', month: 'short', year: 'numeric'});
  }
}
