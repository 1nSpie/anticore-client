import { navigationLinks } from '@/lib/contants';
import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.SITE_LINK;
  
   return navigationLinks.map(({ link }) => ({
    url: `${baseUrl}${link}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: link === '/' ? 1.0 : 0.8,
  }));
}

