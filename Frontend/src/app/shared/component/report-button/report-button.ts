import {ChangeDetectionStrategy, Component, HostBinding, inject, input} from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import {MatIconButton} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';
import {MatTooltip} from '@angular/material/tooltip';
import {ReportDialog} from '@shared/component/report-dialog/report-dialog';
import {ReportDialogData, ReportDialogDetail} from '@shared/component/data/report-dialog.type';
import {ReportTargetType} from '@features/report/data/dto/report.dto';

// Bouton de signalement réutilisable : ouvre le ReportDialog pré-rempli avec le contexte
// de la page (targetType/targetId/label). variant="ghost" = transparent, visible au survol
// uniquement (utilisé sur les commentaires du forum).
@Component({
  selector: 'app-report-button',
  imports: [
    MatIconButton,
    MatIcon,
    MatTooltip,
  ],
  templateUrl: './report-button.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './report-button.css'
})
export class ReportButton {

  private readonly dialog = inject(MatDialog);

  targetType = input.required<ReportTargetType>();
  targetId = input.required<string>();
  label = input.required<string>();
  details = input<ReportDialogDetail[]>();
  variant = input<'default' | 'ghost'>('default');

  // Appliqué sur l'élément hôte <app-report-button> (et non sur un élément interne au template) :
  // c'est ce qui permet au CSS de la page parente de le cibler pour l'effet "visible au survol"
  // (l'encapsulation Angular empêche de cibler des classes internes au template de ce composant).
  @HostBinding('class.report-button--ghost')
  get isGhost(): boolean {
    return this.variant() === 'ghost';
  }

  open(event: Event) {
    event.stopPropagation();
    const data: ReportDialogData = {
      targetType: this.targetType(),
      targetId: this.targetId(),
      label: this.label(),
      details: this.details(),
    };
    this.dialog.open(ReportDialog, {data, width: '500px'});
  }
}
