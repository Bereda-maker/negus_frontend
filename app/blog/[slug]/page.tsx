'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { blogService, BlogPost } from '@/services/blogService';
import { ArrowLeft, Calendar, User, Share2 } from 'lucide-react';
import PageLoader from '@/components/common/PageLoader';

export default function BlogPostPage() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPost = async () => {
      setLoading(true);
      try {
        const res = await blogService.getPost(slug);
        setPost(res.data.data);
      } catch (error) {
        console.error('Failed to fetch blog post:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, [slug]);

  if (loading) return <PageLoader />;

  if (!post) {
    return (
      <div className="bg-cream min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-primary">Post not found</h2>
          <p className="text-textSecondary mt-2">The blog post you're looking for doesn't exist.</p>
          <Link href="/blog" className="inline-block mt-4 text-gold hover:underline">
            ← Back to Blog
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-cream min-h-screen py-16">
      <div className="container mx-auto px-4 sm:px-6 max-w-4xl">
        <Link
          href="/blog"
          className="inline-flex items-center gap-1 text-gold hover:text-gold-dark text-sm font-medium transition"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Blog
        </Link>

        {post.coverImage && (
          <div className="rounded-2xl overflow-hidden mb-8 mt-4 shadow-card">
            {/* eslint-disable-next-line @next/next/no-img-element -- CMS-supplied cover image, arbitrary aspect ratio */}
            <img src={post.coverImage} alt={post.title} className="w-full h-[300px] md:h-[400px] object-cover" />
          </div>
        )}

        <h1 className="font-playfair text-3xl md:text-4xl font-extrabold text-primary mb-4">{post.title}</h1>

        <div className="flex flex-wrap items-center gap-6 text-sm text-textSecondary mb-8 border-b border-border pb-4">
          <span className="flex items-center gap-1.5">
            <Calendar className="h-4 w-4" />
            {new Date(post.createdAt).toLocaleDateString()}
          </span>
          {post.author && (
            <span className="flex items-center gap-1.5">
              <User className="h-4 w-4" />
              {post.author.name || 'Admin'}
            </span>
          )}
          <span className="flex items-center gap-1.5">
            <Share2 className="h-4 w-4" />
            {post.viewCount || 0} views
          </span>
        </div>

        <div className="prose prose-lg max-w-none">
          {post.body.split('\n').map((paragraph, idx) => (
            <p key={idx} className="text-textPrimary leading-relaxed">
              {paragraph}
            </p>
          ))}
        </div>

        {post.tags && post.tags.length > 0 && (
          <div className="mt-8 pt-6 border-t border-border">
            <h4 className="text-sm font-semibold text-primary mb-2">Tags</h4>
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <span key={tag} className="bg-warm-bg text-textSecondary text-xs px-3 py-1 rounded-full">
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
