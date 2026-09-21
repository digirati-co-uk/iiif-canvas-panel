import { useAtlas } from "@atlas-viewer/atlas/react";
import { bindViewerControls } from "../../library/viewer-controls";
import { useContext, useLayoutEffect, useRef, type ReactNode } from "react";
import { SlotsContext, type PanelSlot } from "../../library/slots";

export function PanelOutlet({
  name,
  type = "status",
  children,
}: {
  name: string;
  type?: PanelSlot["type"];
  children?: ReactNode;
}) {
  const slots = useContext(SlotsContext);
  const preset = useAtlas();
  const outlet = useRef<HTMLSlotElement>(null);
  useLayoutEffect(() => {
    if (outlet.current) return slots?.mount(outlet.current, { key: name, slotName: name, type });
    return undefined;
  }, [slots, name, type]);
  useLayoutEffect(() => {
    if (name === "overlay" && outlet.current && preset?.runtime)
      return bindViewerControls(outlet.current, preset.runtime);
    return undefined;
  }, [name, preset]);
  return (
    <slot name={name} ref={outlet}>
      {children}
    </slot>
  );
}
