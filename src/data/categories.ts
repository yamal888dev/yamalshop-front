import type { Category } from '@/types';

export const categories: Category[] = [
  { id: 'c-electronics', name: 'อิเล็กทรอนิกส์', slug: 'electronics', icon: '📱' },
  { id: 'c-fashion', name: 'แฟชั่น', slug: 'fashion', icon: '👕' },
  { id: 'c-home', name: 'บ้านและครัว', slug: 'home', icon: '🏠' },
  { id: 'c-beauty', name: 'ความงาม', slug: 'beauty', icon: '💄' },
  { id: 'c-sports', name: 'กีฬาและกลางแจ้ง', slug: 'sports', icon: '⚽' },
  { id: 'c-toys', name: 'ของเล่นและงานอดิเรก', slug: 'toys', icon: '🎮' },
];

export function getCategoryById(id: string): Category | undefined {
  return categories.find((c) => c.id === id);
}

export function getCategoryBySlug(slug: string): Category | undefined {
  return categories.find((c) => c.slug === slug);
}
