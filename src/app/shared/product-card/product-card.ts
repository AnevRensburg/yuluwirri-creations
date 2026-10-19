import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { Cart, formatRand } from '../../core/cart';
import { Product } from '../../core/site.model';
import { Icon } from '../icon/icon';
import { Picture } from '../picture/picture';

/** Product with an option picker (when there is more than one size) and an add-to-order stepper. */
@Component({
  selector: 'app-product-card',
  imports: [Picture, Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @let p = product();
    <article class="card">
      <div class="card__media">
        <app-picture [src]="p.image" [alt]="p.imageAlt" sizes="(min-width: 960px) 380px, (min-width: 600px) 45vw, 92vw" />
        @if (p.badge) {
          <span class="card__badge">{{ p.badge }}</span>
        }
      </div>
      <div class="card__body">
        <h3 class="card__name">{{ p.name }}</h3>
        @if (p.description) {
          <p class="card__text">{{ p.description }}</p>
        } @else {
          <span class="card__text" aria-hidden="true"></span>
        }

        @if (p.options.length > 1) {
          <div class="card__options" role="group" [attr.aria-label]="p.name + ' size'">
            @for (o of p.options; track o.label; let i = $index) {
              <button
                type="button"
                class="chip"
                [attr.aria-pressed]="selected() === i"
                (click)="selected.set(i)"
              >
                {{ o.label }}
              </button>
            }
          </div>
        }

        <div class="card__footer">
          <p class="card__price">
            {{ price() }}
            @if (p.options.length === 1 && p.options[0].label) {
              <span>{{ p.options[0].label }}</span>
            }
          </p>
          @if (quantity() === 0) {
            <button type="button" class="button button--accent button--small" (click)="add(1)">
              <app-icon name="plus" /> Add to order
            </button>
          } @else {
            <div class="stepper" role="group" [attr.aria-label]="'Quantity of ' + p.name">
              <button type="button" (click)="add(-1)" [attr.aria-label]="'One less ' + p.name">
                <app-icon name="minus" />
              </button>
              <output aria-live="polite">{{ quantity() }}</output>
              <button type="button" (click)="add(1)" [attr.aria-label]="'One more ' + p.name">
                <app-icon name="plus" />
              </button>
            </div>
          }
        </div>
      </div>
    </article>
  `,
  styleUrl: './product-card.scss',
})
export class ProductCard {
  private readonly cart = inject(Cart);
  readonly product = input.required<Product>();
  protected readonly selected = signal(0);

  protected readonly quantity = computed(() =>
    this.cart.quantity(this.product().id, this.selected()),
  );
  protected readonly price = computed(() => {
    const price = this.product().options[this.selected()].price;
    return price === null
      ? 'Price on request'
      : `${this.product().fromPrice ? 'From ' : ''}${formatRand(price)}`;
  });

  protected add(step: number): void {
    this.cart.change(this.product().id, this.selected(), step);
  }
}
