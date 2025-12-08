// widgets/ZikhrHomeWidget.tsx
import React from "react";
import {
  FlexWidget,
  TextWidget,
} from "react-native-android-widget";

type ZikhrHomeWidgetProps = {
  zikrName: string;
  count: number;
  target?: number;
};

export function ZikhrHomeWidget({
  zikrName,
  count,
  target = 10000,
}: ZikhrHomeWidgetProps) {
  "use no memo"; // Prevent React Compiler from optimizing widget components (they run in separate context)
  const formattedCount = String(count).padStart(5, "0");
  const title = zikrName || "Zikir seçilmedi";
  const subtitle = zikrName
    ? "Günlük zikirmatik"
    : "Uygulamada bir zikir seç";

  return (
    <FlexWidget
      // Whole widget clickable → opens the main app
      clickAction="OPEN_APP"
      style={{
        width: "match_parent",
        height: "match_parent",
        backgroundColor: "#121212",
        borderRadius: 18,
        padding: 12,
        paddingHorizontal: 16,
        flexDirection: "column",
        justifyContent: "space-between",
      }}
    >
      {/* Top: zikr name */}
      <FlexWidget
        style={{
          flexDirection: "column",
          alignItems: "flex-start",
          marginBottom: 4,
        }}
      >
        <TextWidget
          text={title}
          style={{
            fontSize: 14,
            color: "#ffbf00"
          }}
        />
        <TextWidget
          text={subtitle}
          style={{
            fontSize: 11,
            color: "#a7acb5"
          }}
        />
      </FlexWidget>

      {/* Middle: digital zikirmatik display */}
      <FlexWidget
        style={{
          backgroundColor: "#0a8541",
          borderRadius: 10,
          paddingVertical: 6,
          paddingHorizontal: 10,
          alignItems: "center",
          justifyContent: "center",
          marginVertical: 4,
        }}
      >
        <TextWidget
          text={formattedCount}
          style={{
            fontSize: 28,
            fontFamily: "DSdigi", // same 7-segment font you use in the app
            color: "#003300"
          }}
        />
      </FlexWidget>

      {/* Bottom: target + CTA */}
      <FlexWidget
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <TextWidget
          text={`Hedef: ${target.toLocaleString("tr-TR")}`}
          style={{
            fontSize: 11,
            color: "#cccccc",
          }}
        />
        <TextWidget
          text="Uygulamayı aç"
          style={{
            fontSize: 11,
            color: "#ffffff",

          }}
        />
      </FlexWidget>
    </FlexWidget>
  );
}
