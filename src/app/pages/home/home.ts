import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Cart } from '../../core/cart';
import { SITE } from '../../core/site';
import { Icon } from '../../shared/icon/icon';
import { OrderForm } from '../../shared/order-form/order-form';
import { Picture } from '../../shared/picture/picture';
import { ProductCard } from '../../shared/product-card/product-card';

@Component({
  selector: 'app-home',
  imports: [RouterLink, Picture, Icon, ProductCard, OrderForm],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {
  protected readonly site = SITE;
  protected readonly cart = inject(Cart);
  protected readonly year = new Date().getFullYear();
  protected readonly menuOpen = signal(false);
  protected readonly split = SITE.hero.layout === 'split';
  protected readonly wordmark = SITE.logoStyle === 'wordmark';
  /** Fallback brand mark when there is no logo: first letters of the first two words. */
  protected readonly initials = SITE.name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();

  /** Big catalogues get a search box and category filter; every product is still listed. */
  protected readonly bigCatalogue = SITE.products.items.length > 12;
  protected readonly categories = [
    ...new Set(SITE.products.items.map((p) => p.category).filter((c): c is string => !!c)),
  ];
  protected readonly query = signal('');
  protected readonly category = signal<string | null>(null);
  protected readonly visibleProducts = computed(() => {
    const q = this.query().trim().toLowerCase();
    const c = this.category();
    return SITE.products.items.filter(
      (p) =>
        (!c || p.category === c) &&
        (!q || `${p.name} ${p.description} ${p.category ?? ''}`.toLowerCase().includes(q)),
    );
  });

  protected readonly nav = [
    ['products', 'Products'],
    ['story', 'Our story'],
    ['order', 'Order'],
    ['contact', 'Contact'],
  ] as const;

  protected readonly socialIcon = { Facebook: 'facebook', Instagram: 'instagram', TikTok: 'tiktok' } as const;
}
