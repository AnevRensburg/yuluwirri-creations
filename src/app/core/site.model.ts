import type { IconName } from '../shared/icon/icon';

/** A size or variant with its own price. `price: null` shows "Price on request". */
export interface ProductOption {
  readonly label: string;
  readonly price: number | null;
}

export interface Product {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  /** Image key from the generated manifest (file name in images-src without extension). */
  readonly image: string;
  readonly imageAlt: string;
  readonly badge?: string;
  /** Group for the category filter (shown when a business has many products). */
  readonly category?: string;
  /** Show prices as "From R…" (the business has more sizes than listed; the size is confirmed later). */
  readonly fromPrice?: boolean;
  /** Multi-buy special on the first option (counted across lines), e.g. any 2 for R220. */
  readonly multiBuy?: { readonly quantity: number; readonly price: number };
  readonly options: readonly ProductOption[];
}

export interface DeliveryOption {
  readonly id: string;
  readonly label: string;
  readonly note: string;
  readonly needsAddress: boolean;
}

export interface SiteConfig {
  /** Repo name; the site is served at https://anevrensburg.github.io/<slug>/. */
  readonly slug: string;
  readonly name: string;
  /** Short line under the logo text. */
  readonly tagline: string;
  /** Image key for a logo, or null to show the name as text. */
  readonly logo: string | null;
  /** 'mark' (default): square/round logo in a tile beside the name. 'wordmark': a wide logo shown alone. */
  readonly logoStyle?: 'mark' | 'wordmark';
  readonly meta: { readonly title: string; readonly description: string };
  readonly hero: {
    readonly eyebrow: string;
    readonly title: string;
    readonly lead: string;
    readonly image: string;
    readonly imageAlt: string;
    readonly cta: string;
    /** 'cover' (default): full-bleed photo. 'split': text beside the photo, for small product shots. */
    readonly layout?: 'cover' | 'split';
  };
  readonly highlights: readonly { readonly icon: IconName; readonly title: string; readonly text: string }[];
  readonly products: {
    readonly eyebrow: string;
    readonly title: string;
    readonly lead: string;
    readonly items: readonly Product[];
  };
  readonly story: {
    readonly eyebrow: string;
    readonly title: string;
    readonly paragraphs: readonly string[];
    readonly image: string;
    readonly imageAlt: string;
  };
  readonly gallery: readonly { readonly image: string; readonly alt: string }[];
  readonly order: {
    readonly title: string;
    readonly lead: string;
    readonly steps: readonly string[];
    readonly deliveryOptions: readonly DeliveryOption[];
    /** Shown under the steps, e.g. payment or lead-time notes. */
    readonly notes: readonly string[];
  };
  readonly faq: readonly { readonly q: string; readonly a: string }[];
  readonly contact: {
    readonly email: string;
    readonly phoneDisplay: string | null;
    /** International format without "+" or spaces, e.g. 27821234567. Null: orders go by email. */
    readonly whatsapp: string | null;
    readonly address: readonly string[];
    readonly hours: readonly string[];
    readonly socials: readonly { readonly label: 'Facebook' | 'Instagram' | 'TikTok'; readonly url: string }[];
  };
}
