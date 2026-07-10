import { ChangeDetectionStrategy, Component, output, signal } from '@angular/core';
import { ZXingScannerModule } from '@zxing/ngx-scanner';
import { BarcodeFormat } from '@zxing/library';

/**
 * Encapsule <zxing-scanner> pour la lecture de codes-barres (EAN) via la caméra du navigateur.
 * Nécessite un contexte sécurisé (localhost en dev, HTTPS en production) pour accéder à `getUserMedia`.
 */
@Component({
  selector: 'app-barcode-scanner',
  imports: [ZXingScannerModule],
  templateUrl: './barcode-scanner.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './barcode-scanner.css',
})
export class BarcodeScanner {

  readonly allowedFormats = [BarcodeFormat.EAN_13, BarcodeFormat.EAN_8];

  codeScanned = output<string>();

  hasCamera = signal<boolean | null>(null);
  permissionDenied = signal(false);

  devices = signal<MediaDeviceInfo[]>([]);
  selectedDevice = signal<MediaDeviceInfo | undefined>(undefined);

  onScanSuccess(code: string) {
    this.codeScanned.emit(code);
  }

  onCamerasFound(devices: MediaDeviceInfo[]) {
    this.devices.set(devices);
    this.hasCamera.set(devices.length > 0);

    if (devices.length === 0) {
      return;
    }

    // Certains ordinateurs (notamment portables AMD) exposent une caméra virtuelle "privacy"
    // qui ne renvoie jamais d'image (flux noir). On évite de la sélectionner par défaut.
    const preferred = devices.find(device => !/privacy/i.test(device.label)) ?? devices[0];
    this.selectedDevice.set(preferred);
  }

  onCamerasNotFound() {
    this.hasCamera.set(false);
  }

  onPermissionResponse(allowed: boolean) {
    this.permissionDenied.set(!allowed);
  }

  onDeviceChange(deviceId: string) {
    const device = this.devices().find(d => d.deviceId === deviceId);
    this.selectedDevice.set(device);
  }

}
