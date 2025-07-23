// API Configuration
export const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL || 'http://localhost:4444';
export const API_ENDPOINTS = {
  // Static files
  static: {
    images: (folder: string) => `${API_BASE_URL}/static/images/${folder}`,
    image: (folder: string, filename: string) => `${API_BASE_URL}/static/images/${folder}/${filename}`,
  },
  // Other API endpoints
  blog: `${API_BASE_URL}/api/blog`,
  works: `${API_BASE_URL}/api/works`,
  cars: `${API_BASE_URL}/api/cars`,
} as const;

// API Response Types
export interface ImageInfo {
  name: string;
  url: string;
  fullUrl: string;
}

export interface ImagesListResponse {
  folder: string;
  count: number;
  images: ImageInfo[];
}

// API Helper Functions
export const apiClient = {
  async get<T>(url: string): Promise<T> {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  },

  async getImagesList(folder: string): Promise<ImagesListResponse> {
    return this.get<ImagesListResponse>(API_ENDPOINTS.static.images(folder));
  },

  getImageUrl: (folder: string, filename: string) => 
    API_ENDPOINTS.static.image(folder, filename),
};
