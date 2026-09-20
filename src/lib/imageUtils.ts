/**
 * Utilitário para formatação e compatibilidade de URLs de imagens,
 * incluindo links de compartilhamento do Google Drive.
 */
export function formatImageUrl(url?: string): string {
  if (!url) return '';
  const trimmed = url.trim();

  // Caso seja link de visualização do Google Drive (ex: /file/d/ID/view?usp=sharing)
  const driveMatch1 = trimmed.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (driveMatch1 && driveMatch1[1]) {
    return `https://lh3.googleusercontent.com/d/${driveMatch1[1]}`;
  }

  // Caso seja link com parâmetro ?id=ID ou &id=ID
  const driveMatch2 = trimmed.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (driveMatch2 && driveMatch2[1]) {
    return `https://lh3.googleusercontent.com/d/${driveMatch2[1]}`;
  }

  return trimmed;
}
