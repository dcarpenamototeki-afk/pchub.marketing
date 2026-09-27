export function driveFile(url: string) {
  try {
    const u = new URL(url);
    if (u.protocol !== 'https:' || u.hostname !== 'drive.google.com') return null;
    const id = u.pathname.match(/^\/file\/d\/([\w-]+)/)?.[1] ?? u.searchParams.get('id');
    if (!id || !/^[\w-]+$/.test(id)) return null;
    const resourceKey = u.searchParams.get('resourcekey');
    const suffix = resourceKey ? `&resourcekey=${encodeURIComponent(resourceKey)}` : '';
    return { preview: `https://drive.google.com/file/d/${id}/preview${resourceKey ? `?resourcekey=${encodeURIComponent(resourceKey)}` : ''}`, download: `https://drive.google.com/uc?export=download&id=${id}${suffix}` };
  } catch { return null; }
}
export function validateAssetLink(value: unknown) {
  if (typeof value !== 'string' || value.length > 2048) throw Error('Invalid asset link.');
  if (!value) return;
  const u = new URL(value);
  if (u.protocol !== 'https:' || u.hostname !== 'drive.google.com' || !driveFile(value)) throw Error('Use a Google Drive file link (not a folder link).');
}
