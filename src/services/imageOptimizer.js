export const compressAndConvertToBase64 = (file, maxWidth = 1200, quality = 0.75) => {
  return new Promise((resolve, reject) => {
    if (!file) return reject(new Error("No se proporcionó ningún archivo"));

    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;

      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        // Exportar como WebP si el navegador lo soporta, o JPEG como fallback
        let compressedBase64 = canvas.toDataURL('image/webp', quality);
        if (compressedBase64.indexOf('data:image/webp') !== 0) {
          compressedBase64 = canvas.toDataURL('image/jpeg', quality);
        }

        resolve(compressedBase64);
      };

      img.onerror = (err) => reject(err);
    };

    reader.onerror = (err) => reject(err);
  });
};