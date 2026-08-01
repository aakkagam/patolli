/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';

// The base path is passed on the command line (`--base=/patolli/`), not set
// here — see CLAUDE.md. Building without it roots every asset at `/`, which
// 404s once the site is mounted under /patolli/.
export default defineConfig({
  plugins: [svelte()],
  test: {
    include: ['src/**/*.test.ts'],
    environment: 'node'
  }
});
