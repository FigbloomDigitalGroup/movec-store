/**
 * Applies Cloudinary on-the-fly delivery transforms (auto format/quality, capped width)
 * to an existing Cloudinary URL by inserting a transform segment after `/upload/`.
 * Works retroactively on already-uploaded images — no re-upload needed.
 * Non-Cloudinary URLs (e.g. local blob previews) are returned unchanged.
 */
export function cloudinaryTransform(
  url: string | null | undefined,
  width: number,
): string | undefined {
  if (!url) return url ?? undefined;

  const marker = '/upload/';
  const markerIndex = url.indexOf(marker);
  if (!url.includes('res.cloudinary.com') || markerIndex === -1) return url;

  const transform = `f_auto,q_auto,w_${width},c_limit`;
  const insertAt = markerIndex + marker.length;
  return `${url.slice(0, insertAt)}${transform}/${url.slice(insertAt)}`;
}
