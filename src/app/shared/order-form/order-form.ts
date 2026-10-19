import { ChangeDetectionStrategy, Component, DOCUMENT, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Cart, formatRand } from '../../core/cart';
import { SITE } from '../../core/site';
import { Icon } from '../icon/icon';

const ADDRESS_MAX = 400;

/**
 * Order form. There is no server: submitting builds the order as a message and opens WhatsApp
 * with it pre-filled (or the visitor's email app when the business has no WhatsApp number), so
 * nothing is sent until the customer presses Send.
 */
@Component({
  selector: 'app-order-form',
  imports: [ReactiveFormsModule, Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './order-form.html',
  styleUrl: './order-form.scss',
})
export class OrderForm {
  private readonly document = inject(DOCUMENT);
  private readonly fb = inject(NonNullableFormBuilder);
  protected readonly cart = inject(Cart);

  protected readonly deliveryOptions = SITE.order.deliveryOptions;
  protected readonly viaWhatsapp = !!SITE.contact.whatsapp;
  protected readonly formatRand = formatRand;

  protected readonly form = this.fb.group({
    name: ['', [Validators.required, Validators.maxLength(80)]],
    phone: ['', [Validators.required, Validators.pattern(/^\+?[\d\s()-]{9,20}$/)]],
    email: ['', [Validators.email, Validators.maxLength(120)]],
    delivery: [SITE.order.deliveryOptions[0]?.id ?? '', Validators.required],
    address: ['', Validators.maxLength(ADDRESS_MAX)],
    notes: ['', Validators.maxLength(600)],
  });

  private readonly value = toSignal(this.form.valueChanges, {
    initialValue: this.form.getRawValue(),
  });
  protected readonly needsAddress = computed(
    () => this.deliveryOptions.find((d) => d.id === this.value().delivery)?.needsAddress ?? false,
  );

  protected readonly submitted = signal(false);
  protected readonly emptyError = signal(false);
  protected readonly sentUrl = signal<string | null>(null);
  protected readonly emailUrl = signal<string | null>(null);

  constructor() {
    const { delivery, address } = this.form.controls;
    delivery.valueChanges.subscribe((id) => {
      const required = this.deliveryOptions.find((d) => d.id === id)?.needsAddress;
      address.setValidators(
        required
          ? [Validators.required, Validators.maxLength(ADDRESS_MAX)]
          : Validators.maxLength(ADDRESS_MAX),
      );
      address.updateValueAndValidity();
    });
  }

  protected showError(name: keyof typeof this.form.controls): boolean {
    const control = this.form.controls[name];
    return control.invalid && (control.touched || this.submitted());
  }

  protected submit(): void {
    this.submitted.set(true);
    const empty = this.cart.count() === 0 && !this.form.controls.notes.value.trim();
    this.emptyError.set(empty);
    if (this.form.invalid || empty) {
      this.form.markAllAsTouched();
      this.document.querySelector<HTMLElement>('.order-form .ng-invalid:not(form)')?.focus();
      return;
    }

    const message = this.buildMessage();
    const email =
      `mailto:${SITE.contact.email}?subject=${encodeURIComponent(`Website order for ${SITE.name}`)}` +
      `&body=${encodeURIComponent(message)}`;
    const whatsapp = SITE.contact.whatsapp
      ? `https://wa.me/${SITE.contact.whatsapp}?text=${encodeURIComponent(message)}`
      : null;
    this.sentUrl.set(whatsapp ?? email);
    this.emailUrl.set(email);
    if (whatsapp) this.document.defaultView?.open(whatsapp, '_blank', 'noopener');
    else this.document.location.href = email;
  }

  protected startOver(): void {
    this.form.reset();
    this.cart.clear();
    this.submitted.set(false);
    this.sentUrl.set(null);
  }

  private buildMessage(): string {
    const v = this.form.getRawValue();
    const lines = [`Hi ${SITE.name}! I'd like to place an order.`, ``];
    for (const l of this.cart.lines()) {
      const opt = l.option.label
        ? ` (${l.option.label})`
        : l.product.fromPrice
          ? ' (size to confirm)'
          : '';
      const price =
        l.option.price === null
          ? ''
          : ` = ${l.product.fromPrice ? 'from ' : ''}${formatRand(l.option.price * l.quantity)}`;
      lines.push(`${l.quantity} × ${l.product.name}${opt}${price}`);
    }
    const { amount, partial, from, saving } = this.cart.total();
    if (this.cart.count()) {
      lines.push(
        amount === 0 && partial
          ? `Please send me a quote.`
          : `Total: ${from ? 'from ' : ''}${formatRand(amount)}${partial ? ' + items priced on request' : ''}` +
            (saving ? ` (multi-buy special, saving ${formatRand(saving)})` : ''),
        ``,
      );
    }
    lines.push(`Name: ${v.name.trim()}`, `Contact number: ${v.phone.trim()}`);
    if (v.email.trim()) lines.push(`Email: ${v.email.trim()}`);
    const delivery = this.deliveryOptions.find((d) => d.id === v.delivery);
    if (delivery) lines.push(`Delivery: ${delivery.label}`);
    if (this.needsAddress()) lines.push(`Address: ${v.address.trim()}`);
    if (v.notes.trim()) lines.push(``, `Message: ${v.notes.trim()}`);
    return lines.join('\n');
  }
}
