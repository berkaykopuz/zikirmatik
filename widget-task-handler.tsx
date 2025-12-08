// widget-task-handler.tsx
import AsyncStorage from "@react-native-async-storage/async-storage";
import React from "react";
import type { WidgetTaskHandlerProps } from "react-native-android-widget";
import { ZikhrHomeWidget } from "./widgets/ZikhrHomeWidget";

const nameToWidget = {
  ZikhrHome: ZikhrHomeWidget,
};

async function getZikrDataFromStorage() {
  try {
    const [[, name], [, countStr], [, targetStr]] =
      await AsyncStorage.multiGet([
        "activeZikrName",
        "activeZikrCount",
        "activeZikrTarget",
      ]);

    return {
      zikrName: name || "",
      count: Number(countStr || "0") || 0,
      target: Number(targetStr || "10000") || 10000,
    };
  } catch (e) {
    return { zikrName: "", count: 0, target: 10000 };
  }
}

export async function widgetTaskHandler(props: WidgetTaskHandlerProps) {
  const widgetInfo = props.widgetInfo;
  const Widget =
    nameToWidget[widgetInfo.widgetName as keyof typeof nameToWidget];

  if (!Widget) {
    console.warn(`Unknown widget: ${widgetInfo.widgetName}`);
    return;
  }

  const data = await getZikrDataFromStorage();

  switch (props.widgetAction) {
    case "WIDGET_ADDED":
    case "WIDGET_UPDATE":
    case "WIDGET_RESIZED":
      // Use React.createElement to avoid React Compiler optimizations that conflict with widget context
      props.renderWidget(
        React.createElement(Widget, {
          zikrName: data.zikrName,
          count: data.count,
          target: data.target,
        })
      );
      break;

    case "WIDGET_DELETED":
      // optional: cleanup
      break;

    case "WIDGET_CLICK":
      // clickAction="OPEN_APP" handled natively, nothing to do here
      break;

    default:
      break;
  }
}
