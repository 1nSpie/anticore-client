const API_BASE_URL =
  process.env.NEXT_PUBLIC_BACKEND_API_URL || "http://localhost:4444/api";

export interface WorkImage {
  id: number;
  url: string;
  alt?: string;
  order: number;
}

export interface WorkService {
  id: number;
  name: string;
}

export interface WorkCategory {
  id: number;
  name: string;
  slug: string;
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
  createdAt: string;
  updatedAt: string;
  category: WorkCategory;
  services: WorkService[];
  images: WorkImage[];
}

export interface WorksResponse {
  works: Work[];
  total: number;
}

export interface WorksFilter {
  categoryId?: number;
  featured?: boolean;
  published?: boolean;
  limit?: number;
  offset?: number;
}

export const worksApi = {
  // Get all works with optional filters
  async getWorks(filters: WorksFilter = {}): Promise<Work[]> {
    const params = new URLSearchParams();
    
    if (filters.categoryId) params.append('categoryId', filters.categoryId.toString());
    if (filters.featured !== undefined) params.append('featured', filters.featured.toString());
    if (filters.published !== undefined) params.append('published', filters.published.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.offset) params.append('offset', filters.offset.toString());

    const response = await fetch(`${API_BASE_URL}/works?${params}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch works: ${response.statusText}`);
    }
    
    return response.json();
  },

  // Get work by ID
  async getWorkById(id: number): Promise<Work> {
    const response = await fetch(`${API_BASE_URL}/works/${id}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch work: ${response.statusText}`);
    }
    
    return response.json();
  },

  // Get work by slug
  async getWorkBySlug(slug: string): Promise<Work> {
    const response = await fetch(`${API_BASE_URL}/works/slug/${slug}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch work: ${response.statusText}`);
    }
    
    return response.json();
  },

  // Get all work categories
  async getWorkCategories(): Promise<WorkCategory[]> {
    const response = await fetch(`${API_BASE_URL}/works/categories/all`);
    if (!response.ok) {
      throw new Error(`Failed to fetch work categories: ${response.statusText}`);
    }
    
    return response.json();
  },

  // Get works stats
  async getWorksStats(): Promise<{ totalWorks: number; publishedWorks: number; featuredWorks: number }> {
    const response = await fetch(`${API_BASE_URL}/works/stats`);
    if (!response.ok) {
      throw new Error(`Failed to fetch works stats: ${response.statusText}`);
    }
    
    return response.json();
  },

  // Get featured works
  async getFeaturedWorks(): Promise<Work[]> {
    return this.getWorks({ featured: true, published: true });
  },

  // Get works by category
  async getWorksByCategory(categoryId: number): Promise<Work[]> {
    return this.getWorks({ categoryId, published: true });
  }
};
