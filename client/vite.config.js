import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // The shared .env stays at the monorepo root; only VITE_ variables reach the browser.
  envDir: '..',
});
