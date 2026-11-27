export type MediaKind = 'PHOTO' | 'VIDEO' | 'LICENSE' | 'ID_CARD';
export type Review = 'PENDING' | 'VERIFIED' | 'REJECTED';
export interface MediaItem {
  id: string; ownerType: string; ownerId: string; kind: MediaKind; review: Review;
  name: string; contentType: string; size: number; createdAt: string;
}