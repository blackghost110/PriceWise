/**
 * Compresse une image (photo de ticket de caisse issue d'un fichier ou de la caméra) avant envoi au
 * backend : redimensionne au maximum à `maxDimension` px et réencode en JPEG. Évite de dépasser la
 * limite de taille du body HTTP (voir Backend/src/main.ts, `app.use(json({ limit: '15mb' }))`) et
 * accélère l'appel à l'IA côté backend.
 */
export function compressImage(source: Blob, maxDimension = 1600, quality = 0.8): Promise<{ imageBase64: string; mimeType: string }> {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(source);
    const image = new Image();

    image.onload = () => {
      URL.revokeObjectURL(objectUrl);

      const scale = Math.min(1, maxDimension / Math.max(image.width, image.height));
      const width = Math.round(image.width * scale);
      const height = Math.round(image.height * scale);

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const context = canvas.getContext('2d');
      if (!context) {
        reject(new Error('Impossible de créer le contexte de dessin pour compresser l\'image'));
        return;
      }
      context.drawImage(image, 0, 0, width, height);

      const dataUrl = canvas.toDataURL('image/jpeg', quality);
      const imageBase64 = dataUrl.split(',')[1] ?? '';
      resolve({ imageBase64, mimeType: 'image/jpeg' });
    };

    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Impossible de charger l'image sélectionnée"));
    };

    image.src = objectUrl;
  });
}
