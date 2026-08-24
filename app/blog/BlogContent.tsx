'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { blogService, BlogPost } from '@/services/blogService';
import { ArrowRight, Calendar, User } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import PageLoader from '@/components/common/PageLoader';
import { Pagination } from '@/types';
import '@/i18n';

// Helper to ensure we always have a valid Pagination object
const getValidPagination = (data: any): Pagination => {
  if (data && typeof data === 'object') {
    return {
      total: data.total ?? data.totalDocs ?? data.count ?? 0,
      totalPages: data.totalPages ?? data.pages ?? 1,
      page: data.page ?? data.currentPage ?? 1,
      // if your Pagination type expects 'limit', add it here if present
      // limit: data.limit ?? 9,
    };
  }
  return { total: 0, totalPages: 1, page: 1 };
};

export default function BlogContent() {
  const { t } = useTranslation();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const page = parseInt(searchParams.get('page') || '1');

  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ total: 0, totalPages: 1, page: 1 });
  const [loading, setLoading] = useState(true);

  const goToPage = (nextPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', String(nextPage));
    router.push(`${pathname}?${params.toString()}`);
  };

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      try {
        const res = await blogService.getPosts({ limit: 9 });
        // Safely extract data and pagination
        const data = res?.data?.data ?? [];
        const rawPagination = res?.data?.pagination;
        const validPagination = getValidPagination(rawPagination);

        setPosts(data);
        setPagination(validPagination);
      } catch (error) {
        console.error('Failed to fetch blog posts:', error);
        setPosts([]);
        setPagination({ total: 0, totalPages: 1, page: 1 });
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) return <PageLoader />;

  return (
    <div className="bg-cream min-h-screen py-16">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <h1 className="font-playfair text-4xl font-extrabold text-primary">{t('blog.title')}</h1>
          <p className="text-textSecondary mt-2 max-w-2xl mx-auto">
            {t('blog.subtitle')}
          </p>
        </div>

        {posts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-textSecondary">{t('blog.emptyMessage')}</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {posts.map((post) => (
                <div
                  key={post._id}
                  className="bg-white rounded-2xl overflow-hidden border border-border shadow-card hover:shadow-cardHover transition group"
                >
                  <div className="aspect-[16/9] overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={
                        post.coverImage ||
                        'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&w=400&q=80'
                      }
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                      loading="lazy"
                    />
                  </div>
                  <div className="p-6">
                    <div className="flex items-center gap-4 text-xs text-textSecondary mb-2">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        {new Date(post.createdAt).toLocaleDateString()}
                      </span>
                      {post.author && (
                        <span className="flex items-center gap-1">
                          <User className="h-3.5 w-3.5" />
                          {post.author.name || t('blog.defaultAuthor')}
                        </span>
                      )}
                    </div>
                    <h3 className="font-playfair text-xl font-bold text-primary mb-2 line-clamp-2">{post.title}</h3>
                    <p className="text-textSecondary text-sm line-clamp-3 mb-4">
                      {post.excerpt || post.body?.slice(0, 150) + '...'}
                    </p>
                    <Link
                      href={`/blog/${post.slug || post._id}`}
                      className="inline-flex items-center gap-1 text-gold hover:text-gold-dark font-medium text-sm transition"
                    >
                      {t('blog.readMore')} <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            {pagination.totalPages > 1 && (
              <div className="flex justify-center items-center gap-3 mt-12">
                <button
                  onClick={() => goToPage(page - 1)}
                  disabled={page <= 1}
                  className="px-4 py-2 rounded-full border border-border text-textSecondary hover:bg-gold hover:text-white hover:border-gold transition disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-textSecondary"
                >
                  {t('blog.pagination.prev')}
                </button>
                <span className="text-sm text-textSecondary">
                  {t('blog.pagination.pageOf', { current: page, total: pagination.totalPages })}
                </span>
                <button
                  onClick={() => goToPage(page + 1)}
                  disabled={page >= pagination.totalPages}
                  className="px-4 py-2 rounded-full border border-border text-textSecondary hover:bg-gold hover:text-white hover:border-gold transition disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-textSecondary"
                >
                  {t('blog.pagination.next')}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}