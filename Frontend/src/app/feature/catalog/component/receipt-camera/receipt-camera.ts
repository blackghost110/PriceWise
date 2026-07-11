import { ChangeDetectionStrategy, Component, effect, ElementRef, OnDestroy, output, signal, viewChild } from '@angular/core';
import { MatButton } from '@angular/material/button';

/**
 * Capture une photo via la caméra du navigateur (getUserMedia) pour le scan de ticket de caisse.
 * Contrairement à `BarcodeScanner` (qui décode un code-barres en continu via @zxing), ce composant
 * se contente d'afficher un flux vidéo live et de prendre un seul cliché sur demande.
 * Nécessite un contexte sécurisé (localhost en dev, HTTPS en production).
 */
@Component({
  selector: 'app-receipt-camera',
  imports: [MatButton],
  templateUrl: './receipt-camera.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './receipt-camera.css',
})
export class ReceiptCamera implements OnDestroy {

  captured = output<Blob>();

  videoRef = viewChild<ElementRef<HTMLVideoElement>>('video');

  hasCamera = signal<boolean | null>(null);
  permissionDenied = signal(false);

  private stream: MediaStream | null = null;

  constructor() {
    // Le <video> n'apparaît dans le template qu'une fois hasCamera() à true ; cet effect attache
    // le flux dès que la query signal-based résout l'élément.
    effect(() => {
      const video = this.videoRef()?.nativeElement;
      if (video && this.stream && video.srcObject !== this.stream) {
        video.srcObject = this.stream;
        video.play().catch(() => {});
      }
    });

    this.startCamera();
  }

  private async startCamera() {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      this.hasCamera.set(true);
    } catch {
      this.hasCamera.set(false);
      this.permissionDenied.set(true);
    }
  }

  capture() {
    const video = this.videoRef()?.nativeElement;
    if (!video || !video.videoWidth) {
      return;
    }

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext('2d');
    if (!context) {
      return;
    }
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob((blob) => {
      if (blob) {
        this.captured.emit(blob);
      }
    }, 'image/jpeg', 0.9);
  }

  ngOnDestroy() {
    this.stream?.getTracks().forEach(track => track.stop());
  }
}
