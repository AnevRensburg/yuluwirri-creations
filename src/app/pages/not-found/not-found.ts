import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SITE } from '../../core/site';

@Component({
  selector: 'app-not-found',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <main class="container">
      <p class="logo">{{ name }}</p>
      <h1>This page doesn't exist.</h1>
      <p><a routerLink="/">Back to the home page</a></p>
    </main>
  `,
  styles: `
    main {
      min-block-size: 100svh;
      display: grid;
      place-content: center;
      text-align: center;
      gap: 1rem;
    }
    .logo {
      font-family: var(--font-display);
      
      font-size: 3rem;
      margin: 0;
    }
    h1 {
      font-family: var(--font-display);
      font-weight: 500;
      margin: 0;
    }
  `,
})
export class NotFound {
  protected readonly name = SITE.name;
}
