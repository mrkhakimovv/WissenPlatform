import fs from 'fs';
let code = fs.readFileSync('vite.config.ts', 'utf8');

if (!code.includes('VitePWA')) {
  code = code.replace(
    "import react from '@vitejs/plugin-react';",
    "import react from '@vitejs/plugin-react';\nimport { VitePWA } from 'vite-plugin-pwa';"
  );
  
  code = code.replace(
    "plugins: [react(), tailwindcss()],",
    `plugins: [
      react(), 
      tailwindcss(),
      VitePWA({
        registerType: 'autoUpdate',
        manifest: {
          name: 'Talaba Ilovasi',
          short_name: 'Talaba',
          description: 'Talabalar uchun platforma',
          theme_color: '#FEC204',
          background_color: '#0d0d0d',
          display: 'standalone',
          icons: [
            {
              src: 'icon.svg',
              sizes: '512x512',
              type: 'image/svg+xml'
            }
          ]
        }
      })
    ],`
  );
  
  fs.writeFileSync('vite.config.ts', code);
}
