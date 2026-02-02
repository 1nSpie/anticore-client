// Типы для админ-панели

export interface PriceData {
  id: number;
  segment: number;
  standartML: number | null;
  standartMLBody: number | null;
  complexML: number | null;
  complexMLBody: number | null;
}

export interface Brand {
  id: number;
  name: string;
}

export interface Car {
  id: number;
  model: string;
  segment: number;
  brandId: number | null;
  brand?: Brand | null;
}

export interface ContentBlock {
  subtitle?: string;
  text: string;
}

export interface BlogCategory {
  id: number;
  name: string;
  slug: string;
}

export interface BlogPost {
  id: number;
  title: string;
  excerpt: string;
  content: ContentBlock[];
  slug: string;
  readTime: string;
  categoryId: number;
  image?: string;
  author: string;
  published: boolean;
  featured: boolean;
  tags: string[];
  category?: BlogCategory;
}

export interface BlogPostFormData {
  title: string;
  excerpt: string;
  content: ContentBlock[];
  slug: string;
  readTime: string;
  categoryId: number;
  image: string;
  author: string;
  published: boolean;
  featured: boolean;
  tags: string[];
}

export interface Work {
  id: number;
  title: string;
  description: string;
  slug: string;
  beforeImage?: string;
  afterImage?: string;
  duration: string;
  year: string;
  carBrand: string;
  carModel: string;
  categoryId: number;
  featured: boolean;
  published: boolean;
}

export const SEGMENT_NAMES: Record<number, string> = {
  1: "Сегмент 1",
  2: "Сегмент 2",
  3: "Сегмент 3",
  4: "Сегмент 4",
  5: "Сегмент 5",
  6: "Сегмент 6",
};

export const SEGMENT_COLORS: Record<number, string> = {
  1: "bg-green-500/20 text-green-300 border-green-500/30",
  2: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
  3: "bg-teal-500/20 text-teal-300 border-teal-500/30",
  4: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
  5: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  6: "bg-violet-500/20 text-violet-300 border-violet-500/30",
};
