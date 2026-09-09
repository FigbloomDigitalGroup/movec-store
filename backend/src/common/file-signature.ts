// `file.mimetype` on a multer file is whatever the client's Content-Disposition
// declared for that part — trivially spoofable (rename a script to photo.png,
// set the field's content-type header to image/png). Checking the actual leading
// bytes of the uploaded buffer instead confirms the file *is* one of these image
// formats, not just labeled as one.
const SIGNATURES: { mimetype: string; check: (buf: Buffer) => boolean }[] = [
  {
    mimetype: 'image/jpeg',
    check: (buf) =>
      buf.length >= 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff,
  },
  {
    mimetype: 'image/png',
    check: (buf) =>
      buf.length >= 8 &&
      buf
        .subarray(0, 8)
        .equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])),
  },
  {
    mimetype: 'image/gif',
    check: (buf) =>
      buf.length >= 6 &&
      (buf.subarray(0, 6).toString('ascii') === 'GIF87a' ||
        buf.subarray(0, 6).toString('ascii') === 'GIF89a'),
  },
  {
    mimetype: 'image/webp',
    check: (buf) =>
      buf.length >= 12 &&
      buf.subarray(0, 4).toString('ascii') === 'RIFF' &&
      buf.subarray(8, 12).toString('ascii') === 'WEBP',
  },
];

export function isAllowedImageBuffer(buffer: Buffer): boolean {
  return SIGNATURES.some(({ check }) => check(buffer));
}
