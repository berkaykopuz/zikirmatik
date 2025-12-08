// index.ts  (root, not inside app/)
import "expo-router/entry"; // this boots your (tabs)/index.tsx, _layout.tsx etc.

import { registerWidgetTaskHandler } from "react-native-android-widget";
import { widgetTaskHandler } from "@/widget-task-handler"; // <- file you created in step 3

// connect Android home widget system to your handler
registerWidgetTaskHandler(widgetTaskHandler);
