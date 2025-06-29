
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    target: 'esnext',
    minify: 'esbuild',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          // React ecosystem
          'react-vendor': ['react', 'react-dom'],
          'react-router': ['react-router-dom'],
          
          // UI libraries
          'ui-vendor': [
            '@radix-ui/react-accordion',
            '@radix-ui/react-alert-dialog',
            '@radix-ui/react-avatar',
            '@radix-ui/react-button',
            '@radix-ui/react-card',
            '@radix-ui/react-checkbox',
            '@radix-ui/react-dialog',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-form',
            '@radix-ui/react-input',
            '@radix-ui/react-label',
            '@radix-ui/react-popover',
            '@radix-ui/react-progress',
            '@radix-ui/react-select',
            '@radix-ui/react-separator',
            '@radix-ui/react-sheet',
            '@radix-ui/react-slider',
            '@radix-ui/react-switch',
            '@radix-ui/react-tabs',
            '@radix-ui/react-textarea',
            '@radix-ui/react-toast',
            '@radix-ui/react-tooltip'
          ],
          
          // Icons
          'icons-vendor': ['lucide-react'],
          
          // Data fetching and state management
          'query-vendor': ['@tanstack/react-query'],
          
          // Forms and validation
          'form-vendor': [
            'react-hook-form', 
            '@hookform/resolvers', 
            'zod'
          ],
          
          // Charts and visualization
          'chart-vendor': ['recharts'],
          
          // Backend integration
          'supabase-vendor': ['@supabase/supabase-js'],
          
          // Utilities
          'utils-vendor': [
            'date-fns',
            'clsx',
            'tailwind-merge',
            'class-variance-authority'
          ]
        },
        chunkFileNames: (chunkInfo) => {
          const facadeModuleId = chunkInfo.facadeModuleId ? 
            chunkInfo.facadeModuleId.split('/').pop()?.replace('.tsx', '').replace('.ts', '') || 'chunk' 
            : 'chunk';
          return `js/${facadeModuleId}-[hash].js`;
        }
      }
    },
    chunkSizeWarningLimit: 1000,
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@tanstack/react-query',
      'lucide-react'
    ]
  }
}));
