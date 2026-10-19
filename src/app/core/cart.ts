import { Injectable, computed, signal } from '@angular/core';
import { Product, ProductOption } from './site.model';
import { SITE } from './site';

export interface CartLine {
  readonly key: string;
  readonly product: Product;
  readonly option: ProductOption;
  readonly quantity: number;
}

const MAX_QUANTITY = 50;

/** "R1 250" style price, without cents. */
export const formatRand = (amount: number): string => `R${amount.toLocaleString('en-ZA')}`;

/** The order being built on the page. Quantities are keyed by "<product id>:<option index>". */
@Injectable({ providedIn: 'root' })
export class Cart {
  private readonly quantities = signal<Record<string, number>>({});

  readonly lines = computed<CartLine[]>(() =>
    Object.entries(this.quantities())
      .filter(([, q]) => q > 0)
      .map(([key, quantity]) => {
        const [id, index] = key.split(':');
        const product = SITE.products.items.find((p) => p.id === id)!;
        return { key, product, option: product.options[Number(index)], quantity };
      }),
  );

  readonly count = computed(() => this.lines().reduce((sum, l) => sum + l.quantity, 0));

  /**
   * Total of the priced lines. `partial`: some lines are "price on request".
   * `from`: some prices are "from" prices, so the total is a minimum.
   */
  readonly total = computed(() => {
    let amount = 0;
    let partial = false;
    let from = false;
    const multiBuyCounts = new Map<string, number>();
    for (const l of this.lines()) {
      if (l.option.price === null) partial = true;
      else amount += l.option.price * l.quantity;
      if (l.product.fromPrice) from = true;
      // Multi-buy specials apply to the product's first (single-item) option.
      if (l.product.multiBuy && l.product.options.indexOf(l.option) === 0) {
        multiBuyCounts.set(l.product.id, (multiBuyCounts.get(l.product.id) ?? 0) + l.quantity);
      }
    }
    // Multi-buy: every full set costs the special price instead of the single prices.
    let saving = 0;
    for (const [id, count] of multiBuyCounts) {
      const p = SITE.products.items.find((x) => x.id === id)!;
      const unit = p.options[0].price ?? 0;
      saving += Math.floor(count / p.multiBuy!.quantity) * (p.multiBuy!.quantity * unit - p.multiBuy!.price);
    }
    amount -= saving;
    return { amount, partial, from, saving };
  });

  quantity(productId: string, optionIndex: number): number {
    return this.quantities()[`${productId}:${optionIndex}`] ?? 0;
  }

  change(productId: string, optionIndex: number, step: number): void {
    const key = `${productId}:${optionIndex}`;
    this.quantities.update((q) => ({
      ...q,
      [key]: Math.min(MAX_QUANTITY, Math.max(0, (q[key] ?? 0) + step)),
    }));
  }

  clear(): void {
    this.quantities.set({});
  }
}
