import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class ImageUtils {

    /**
     * Compresses and resizes an image file to a small square avatar.
     * Returns a Data URL (Base64) string suitable for storage/display.
     * Max size target: ~20-50KB
     */
    static processAvatarImage(file: File): Promise<string> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (event) => {
                const img = new Image();
                img.src = event.target?.result as string;
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');

                    if (!ctx) {
                        reject(new Error("Canvas context failed"));
                        return;
                    }

                    // Target dimensions
                    const SIZE = 256;

                    // Calculate crop - Center Crop logic
                    let sourceSize = Math.min(img.width, img.height);
                    let startX = (img.width - sourceSize) / 2;
                    let startY = (img.height - sourceSize) / 2;

                    canvas.width = SIZE;
                    canvas.height = SIZE;

                    // Draw centered crop
                    ctx.drawImage(img, startX, startY, sourceSize, sourceSize, 0, 0, SIZE, SIZE);

                    // Compress to JPEG 70% quality, generating a base64 string
                    const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
                    resolve(dataUrl);
                };
                img.onerror = (err) => reject(err);
            };
            reader.onerror = (err) => reject(err);
        });
    }
}
