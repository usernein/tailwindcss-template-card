import { HaCardConfig } from "@components/HaCardConfig";
import { ConfigProvider } from "@store/ConfigProvider";
import React from "preact/compat";

export function HaCardConfigWrapper() {
  const MemoizedCardConfig = React.memo(HaCardConfig)
  return (
    <ConfigProvider>
      <MemoizedCardConfig />
    </ConfigProvider>
  );
}
