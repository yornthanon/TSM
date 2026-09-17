import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 3000,
    host: '0.0.0.0',
    allowedHosts: [
      '3000-i1xx85ye206qw088tjg3z-12e3dc3c.us1.manus.computer',
      '3000-i9zbpw60yaokp5ayo3xzs-0680514c.us1.manus.computer',
    ],
  },
  preview: {
    port: 3000,
    host: '0.0.0.0',
    allowedHosts: [
      '3000-i1xx85ye206qw088tjg3z-12e3dc3c.us1.manus.computer',
      '3000-i9zbpw60yaokp5ayo3xzs-0680514c.us1.manus.computer',
    ],
  },
});
