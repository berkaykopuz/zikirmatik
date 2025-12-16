// index.ts  (root, not inside app/)
import "expo-router/entry"; // this boots your (tabs)/index.tsx, _layout.tsx etc.

import { widgetTaskHandler } from "@/widget-task-handler"; // <- file you created in step 3
import { registerWidgetTaskHandler } from "react-native-android-widget";
import mobileAds from "react-native-google-mobile-ads";

// Initialize AdMob once when the JS bundle loads
mobileAds()
  .initialize()
  .catch(() => {
  });

// connect Android home widget system to your handler
registerWidgetTaskHandler(widgetTaskHandler);
