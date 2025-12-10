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
    ? "Çekilen Zikir"
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
        paddingVertical: 14,
        paddingHorizontal: 12,
        flexDirection: "column",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      {/* Top: zikr name */}
      <FlexWidget
        style={{
          flexDirection: "column",
          alignItems: "center",
          marginBottom: 4,
        }}
      >
        <TextWidget
          text={title}
          style={{
            fontSize: 16,
            color: "#ffbf00",
            textAlign: "center",
          }}
        />
        <TextWidget
          text={subtitle}
          style={{
            fontSize: 12,
            color: "#a7acb5",
            textAlign: "center",
          }}
        />
      </FlexWidget>

      {/* Middle: digital zikirmatik display */}
      <FlexWidget
        style={{
          backgroundColor: "#0a8541",
          borderRadius: 12,
          paddingVertical: 10,
          paddingHorizontal: 12,
          minHeight: 76,
          width: "100%",
          alignItems: "center",
          justifyContent: "center",
          marginVertical: 6,
        }}
      >
        <TextWidget
          text={formattedCount}
          style={{
            fontSize: 40,
            // Use the font name derived from the file "DS-DIGI.ttf" (widget env)
            fontFamily: "DS-DIGI",
            color: "#003300"
          }}
        />
      </FlexWidget>
      
      <FlexWidget
        style={{
          flexDirection: "row",
          justifyContent: "center",
          alignItems: "center",
          columnGap: 10,
        }}
      >
        <TextWidget
                text={`Hedef: ${target.toLocaleString("tr-TR")}`}
                style={{
                  fontSize: 14,
                  color: "#cccccc",
                  textAlign: "center",
                }}
              />
      </FlexWidget>


      {/* Bottom: target + CTA */}
      <FlexWidget
        style={{
          flexDirection: "row",
          justifyContent: "center",
          alignItems: "center",
          columnGap: 10,
        }}
      >
        
        <TextWidget
          text="Uygulamayı aç"
          style={{
            fontSize: 10,
            color: "#ffffff",
            textAlign: "center",

          }}
        />
      </FlexWidget>
    </FlexWidget>
  );
}
