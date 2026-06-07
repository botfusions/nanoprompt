import Link from "next/link";

interface BlogPostData {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  category: string;
}

export default function BlogPost({ post }: { post: BlogPostData }) {
  return (
    <article className="border-2 border-brand-black/10 p-6 hover:border-brand-cyan/30 transition-colors">
      <div className="flex items-center gap-3 mb-3">
        <span className="bg-brand-cyan/10 text-brand-cyan text-xs font-bold px-3 py-1 border border-brand-cyan/30">
          {post.category}
        </span>
        <time className="text-sm text-brand-black/40" dateTime={post.date}>
          {new Date(post.date).toLocaleDateString("tr-TR", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </time>
      </div>
      <h2 className="text-xl font-bold mb-2 text-brand-black">
        <Link href={`/blog/${post.slug}`} className="hover:text-brand-cyan transition-colors">
          {post.title}
        </Link>
      </h2>
      <p className="text-brand-black/60 leading-relaxed">
        {post.excerpt}
      </p>
    </article>
  );
}
