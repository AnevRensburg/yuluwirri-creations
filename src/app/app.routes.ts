import { Routes } from '@angular/router';
import { SITE } from './core/site';
import { Home } from './pages/home/home';

export const routes: Routes = [
  {
    path: '',
    component: Home,
    title: SITE.meta.title,
  },
  // Rendered to 404.html by scripts/postbuild.mjs; GitHub Pages serves it for unknown URLs.
  {
    path: '404',
    loadComponent: () => import('./pages/not-found/not-found').then((m) => m.NotFound),
    title: `Page not found | ${SITE.name}`,
  },
  { path: '**', redirectTo: '404' },
];
