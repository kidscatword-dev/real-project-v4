import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.fantichinese.wordlibrary",
  appName: "中文認字樂",
  webDir: "dist/public", 
  android: {
    allowMixedContent: true
  }
};

export default config;
