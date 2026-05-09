import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@shared': path.resolve(__dirname, '../../shared')
    }
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icons/*.png'],
      manifest: {
        "id": "/",
        "short_name": "Vork",
        "name": "Vork - Marketplace Artisans",
        "description": "Trouvez les meilleurs artisans pour tous vos travaux de maison avec Vork.",
        "categories": ["business", "lifestyle", "productivity"],
        "icons": [
          { "src": "/icons/icon-72x72.png", "sizes": "72x72", "type": "image/png" },
          { "src": "/icons/icon-96x96.png", "sizes": "96x96", "type": "image/png" },
          { "src": "/icons/icon-128x128.png", "sizes": "128x128", "type": "image/png" },
          { "src": "/icons/icon-144x144.png", "sizes": "144x144", "type": "image/png" },
          { "src": "/icons/icon-152x152.png", "sizes": "152x152", "type": "image/png" },
          { "src": "/icons/icon-192x192.png", "sizes": "192x192", "type": "image/png" },
          { "src": "/icons/icon-192x192.png", "sizes": "192x192", "type": "image/png", "purpose": "maskable" },
          { "src": "/icons/icon-384x384.png", "sizes": "384x384", "type": "image/png" },
          { "src": "/icons/icon-512x512.png", "sizes": "512x512", "type": "image/png" },
          { "src": "/icons/icon-512x512.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable" }
        ],
        "start_url": "/?app",
        "scope": "/",
        "display": "standalone",
        "theme_color": "#6366f1",
        "background_color": "#0a0a0c"
      },
      devOptions: {
        enabled: true,
        type: 'module',
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/esm\.sh\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'esm-sh-cache',
              expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 * 24 * 30 }
            }
          },
          {
            urlPattern: /^https:\/\/www\.gstatic\.com\/firebasejs\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'firebase-cache',
              expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 30 }
            }
          },
          {
            urlPattern: /^https:\/\/.*\.supabase\.co\/storage\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'supabase-storage-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 30
              }
            }
          },
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'google-fonts-stylesheets',
            }
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-webfonts',
              expiration: {
                maxEntries: 30,
                maxAgeSeconds: 60 * 60 * 24 * 365
              }
            }
          }
        ]
      }
    })
  ],
  build: {
    chunkSizeWarningLimit: 800, // Augmenté légèrement car 600 est très strict pour un PWA
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes('node_modules')) {
            // Regrouper Firebase (très lourd)
            if (id.includes('firebase')) return 'vendor-firebase';
            // Regrouper Supabase
            if (id.includes('@supabase')) return 'vendor-supabase';
            // Regrouper les icônes séparément (792ko)
            if (id.includes('lucide-react')) return 'vendor-icons';
            // Regrouper React core
            if (id.includes('react')) return 'vendor-react';
            // Regrouper les libs UI (framer-motion, etc.)
            if (id.includes('framer-motion') || id.includes('lucide')) return 'vendor-ui';
            
            return 'vendor-others'; 
          }
        },
      }
    }
  },
  server: {
    port: 3000,
    host: '0.0.0.0'
  },
  preview: {
    port: 4173
  }
});
