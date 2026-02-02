import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL || 'http://localhost:4444/api';

const blogApi = axios.create({
  baseURL: `${API_BASE_URL}/blog`,
  headers: {
    'Content-Type': 'application/json',
  },
});

const imageApi = axios.create({
  baseURL: `${API_BASE_URL}/image`,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface ContentBlock {
  subtitle?: string;
  text: string;
}

export interface BlogPost {
  id: number;
  title: string;
  excerpt: string;
  content: ContentBlock[];
  slug: string;
  date: string;
  readTime: string;
  categoryId: number;
  image?: string;
  author: string;
  featured: boolean;
  published: boolean;
  createdAt: string;
  updatedAt: string;
  category: {
    id: number;
    name: string;
    slug: string;
  };
  tags: {
    id: number;
    name: string;
    slug: string;
  }[];
}

export interface BlogCategory {
  id: number;
  name: string;
  slug: string;
  createdAt: string;
  updatedAt: string;
  _count?: {
    posts: number;
  };
}

export interface BlogTag {
  id: number;
  name: string;
  slug: string;
  createdAt: string;
  updatedAt: string;
  _count?: {
    posts: number;
  };
}

export interface BlogPostsResponse {
  posts: BlogPost[];
  total: number;
  hasMore: boolean;
}

export interface BlogQueryParams {
  category?: string;
  tag?: string;
  featured?: boolean;
  limit?: number;
  offset?: number;
  search?: string;
}

export interface BlogImageResponse {
  images: string[];
  total: number;
}

export const blogApiClient = {
  // Posts
  async getPosts(params?: BlogQueryParams): Promise<BlogPostsResponse> {
    const response = await blogApi.get('/posts', { params });
    return response.data;
  },

  async getPostById(id: number): Promise<BlogPost> {
    const response = await blogApi.get(`/posts/${id}`);
    return response.data;
  },

  async getPostBySlug(slug: string): Promise<BlogPost> {
    const response = await blogApi.get(`/posts/slug/${slug}`);
    return response.data;
  },

  async getFeaturedPost(): Promise<BlogPost> {
    const response = await blogApi.get('/posts/featured');
    return response.data;
  },

  async getRelatedPosts(postId: number): Promise<BlogPost[]> {
    const response = await blogApi.get(`/posts/${postId}/related`);
    return response.data;
  },

  // Categories
  async getCategories(): Promise<BlogCategory[]> {
    const response = await blogApi.get('/categories');
    return response.data;
  },

  async getCategoryById(id: number): Promise<BlogCategory> {
    const response = await blogApi.get(`/categories/${id}`);
    return response.data;
  },

  // Tags
  async getTags(): Promise<BlogTag[]> {
    const response = await blogApi.get('/tags');
    return response.data;
  },

  // Stats
  async getStats(): Promise<{
    totalPosts: number;
    totalCategories: number;
    totalTags: number;
    featuredPosts: number;
  }> {
    const response = await blogApi.get('/stats');
    return response.data;
  },

  // Images
  async getBlogImages(): Promise<BlogImageResponse> {
    const response = await imageApi.get('/blog');
    return response.data;
  },

  getBlogImageUrl(filename: string): string {
    return `${API_BASE_URL}/image/blog/${filename}`;
  },

  getImageUrl(filename: string): string {
    return `${API_BASE_URL}/image/${filename}`;
  },

  // Helper function to get optimized image URL
  getOptimizedImageUrl(filename: string, width?: number, height?: number): string {
    const baseUrl = `${API_BASE_URL}/image/blog/${filename}`;
    const params = new URLSearchParams();
    
    if (width) params.append('w', width.toString());
    if (height) params.append('h', height.toString());
    
    return params.toString() ? `${baseUrl}?${params.toString()}` : baseUrl;
  },

};

export default blogApiClient;
