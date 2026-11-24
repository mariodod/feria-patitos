import { defineConfig } from 'vite';

export default defineConfig({
  // Rutas relativas para que funcione también en GitHub Pages.
  base: './',
  build: {
    target: 'es2022',
  },
});
