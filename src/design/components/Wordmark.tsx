import Link from 'next/link';
import { STAR } from '@/lib/merope';
import { SITE } from '@/lib/site';
import { Mark } from './Mark';

/**
 * The studio signature: the mark, the name, and optionally its catalogue
 * designation set underneath the way a plate is captioned.
 *
 * The lockup is not an alternative to the mark — it pairs with it. On its own
 * the designation is beautiful in a header and useless as an icon.
 */

type WordmarkProps = {
  size?: 'nav' | 'display';
  /** Adds `23 Tau · M45` under the name. Reserved for the hero and the footer. */
  lockup?: boolean;
  /** Wraps the mark in a link home. Off inside the styleguide and the hero. */
  href?: string;
  className?: string;
};

const SIZES = {
  nav: { mark: 17, text: 'text-[1.35rem]', gap: 'gap-2.5' },
  display: { mark: 40, text: 'text-title', gap: 'gap-4' },
} as const;

export function Wordmark({ size = 'nav', lockup = false, href, className = '' }: WordmarkProps) {
  const scale = SIZES[size];

  const content = (
    <span className={`inline-flex items-center ${scale.gap}`}>
      <Mark size={scale.mark} />
      <span className="inline-flex flex-col">
        <span className={`${scale.text} leading-none font-extralight tracking-tight`}>
          {SITE.name}
        </span>
        {lockup ? (
          <span className="annotation mt-1.5" style={{ letterSpacing: '0.3em' }}>
            {STAR.designation} · {STAR.cluster.messier}
          </span>
        ) : null}
      </span>
    </span>
  );

  if (!href) return <span className={className}>{content}</span>;

  return (
    <Link href={href} className={`hover:text-accent transition-colors ${className}`}>
      {content}
    </Link>
  );
}
