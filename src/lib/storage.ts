import { supabase } from './supabase';

const BUCKET_ID = 'images';

/**
 * Supabase Storage에 이미지를 업로드합니다.
 */
export async function uploadImage(
  file: File,
  folder: 'profile' | 'projects' = 'projects'
): Promise<string> {
  const ext = file.name.split('.').pop();
  const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  const { error } = await supabase.storage
    .from(BUCKET_ID)
    .upload(fileName, file, {
      contentType: file.type,
      upsert: false,
    });

  if (error) {
    throw new Error('이미지 업로드에 실패했어요: ' + error.message);
  }

  return getStorageUrl(fileName);
}

/**
 * Supabase Storage에서 이미지를 삭제합니다.
 */
export async function deleteImage(path: string): Promise<void> {
  const filePath = extractFilePath(path);
  if (!filePath) return;

  const { error } = await supabase.storage
    .from(BUCKET_ID)
    .remove([filePath]);

  if (error) {
    throw new Error('이미지 삭제에 실패했어요: ' + error.message);
  }
}

/**
 * Storage 파일의 공개 URL을 반환합니다.
 */
export function getStorageUrl(filePath: string): string {
  const { data } = supabase.storage
    .from(BUCKET_ID)
    .getPublicUrl(filePath);
  return data.publicUrl;
}

/**
 * 공개 URL에서 Storage 파일 경로를 추출합니다.
 */
function extractFilePath(url: string): string | null {
  const marker = `/storage/v1/object/public/${BUCKET_ID}/`;
  const idx = url.indexOf(marker);
  if (idx === -1) return null;
  return url.slice(idx + marker.length);
}

/**
 * URL이 Supabase Storage URL인지 확인합니다.
 */
export function isStorageUrl(url: string): boolean {
  return url.includes('supabase.co/storage/');
}
