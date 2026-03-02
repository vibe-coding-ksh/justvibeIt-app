import { storage } from './appwrite';
import { ID, Permission, Role } from 'appwrite';

const BUCKET_ID = import.meta.env.VITE_APPWRITE_BUCKET_ID || 'images';

export async function uploadImage(
  file: File,
  _folder: 'profile' | 'projects' = 'projects'
): Promise<string> {
  const result = await storage.createFile(
    BUCKET_ID,
    ID.unique(),
    file,
    [Permission.read(Role.any())]
  );

  return getStorageUrl(result.$id);
}

export async function deleteImage(fileId: string): Promise<void> {
  await storage.deleteFile(BUCKET_ID, fileId);
}

export function getStorageUrl(fileId: string): string {
  const endpoint = import.meta.env.VITE_APPWRITE_ENDPOINT || '';
  const projectId = import.meta.env.VITE_APPWRITE_PROJECT_ID || '';
  return `${endpoint}/storage/buckets/${BUCKET_ID}/files/${fileId}/view?project=${projectId}`;
}

export function isStorageUrl(url: string): boolean {
  return url.includes('/storage/buckets/');
}
