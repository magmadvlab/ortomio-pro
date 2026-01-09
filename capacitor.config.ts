import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.ortomio.app',
  appName: 'OrtoMio AI',
  webDir: 'out', // Next.js output directory
  server: {
    androidScheme: 'https',
    iosScheme: 'https',
  },
  plugins: {
    Filesystem: {
      // Configurazione per accesso file system
      // Usato per sincronizzazione iCloud/Google Drive
    },
  },
};

export default config;

