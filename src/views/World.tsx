import React, { useEffect, useMemo, useRef, useState } from "react";
// @ts-ignore
import lines from "../images/lineso.svg";
import { SvgObject } from "../SvgObject";

const blob = new Blob([lines], { type: "image/svg+xml" });
const linesUrl = URL.createObjectURL(blob);

export type Offset =
  | "-12"
  | "-11"
  | "-10"
  | "-9"
  | "-8"
  | "-7"
  | "-6"
  | "-5"
  | "-4"
  | "-3"
  | "-2"
  | "-1"
  | "0"
  | "1"
  | "2"
  | "3"
  | "4"
  | "5"
  | "6"
  | "7"
  | "8"
  | "9"
  | "10"
  | "11"
  | "12";
export const offsets: Offset[] = [
  "-11",
  "-10",
  "-9",
  "-8",
  "-7",
  "-6",
  "-5",
  "-4",
  "-3",
  "-2",
  "-1",
  "0",
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "10",
  "11",
  "12",
  "-12",
];

const getLabel = (el: SVGElement) => el.getAttribute("inkscape:label");
const nodeIsElement = (node: any): node is SVGElement =>
  (node as any).setAttribute;
export interface ZoneProps {
  color?: string;
  opacity?: number;
}

export type ZoneProp = Partial<Record<Offset, ZoneProps>>;
interface Props {
  zones?: ZoneProp;
  onMouseOver?(offset: Offset): void;
  onMouseOut?(offset: Offset): void;
  onClick?(offset: Offset): void;
}

export const World: React.FC<Props> = ({
  zones: highlight,
  onMouseOut,
  onMouseOver,
  onClick,
}) => {
  const zoneRef = useRef<SVGElement>();
  const visibleZones = useRef<SVGElement[]>([]);
  const [zones, setZones] = useState<Partial<Record<Offset, SVGElement>>>({});

  const updateHighlights = useMemo(
    () => () => {
      visibleZones.current.forEach((zone) => (zone.style.opacity = "0.0"));
      visibleZones.current = [];

      if (!highlight) return;

      Object.entries(highlight).forEach(([offset, props]) => {
        const zone = zones[offset as Offset];
        if (!props || !zone) return;
        visibleZones.current = [...visibleZones.current, zone];

        const { color, opacity } = props;

        if (color) {
          zone.childNodes.forEach((group) => {
            if (nodeIsElement(group)) group.setAttribute("fill", color);
          });
        }

        zone.style.opacity = String(opacity || "0.0");
      });
    },
    [zones, highlight]
  );

  useEffect(() => {
    updateHighlights();
  }, [highlight, updateHighlights]);

  const initializeWorld = useMemo(
    () => (svg: Document) => {
      let zonesGroup: any = null;

      svg.querySelectorAll("g").forEach((g) => {
        if (g.getAttribute("inkscape:label") === "zones") {
          zonesGroup = g;
        }
      });

      if (!zonesGroup) {
        console.log("bail, no zones group");
        return;
      }
      if (zoneRef.current === zonesGroup) {
        console.log("bail, zonesRef already set");
        return;
      }
      zoneRef.current = zonesGroup;

      zonesGroup.id = "zones";

      const timeouts: NodeJS.Timeout[] = [];
      const zones = [
        ...(svg.querySelectorAll(`#${zonesGroup.id} > g`) as any),
      ].reverse() as SVGElement[];

      const zoneState: Partial<Record<Offset, SVGElement>> = {};

      zones.forEach((zone) => {
        zone.style.opacity = "0.0";

        const zoneOffset = getLabel(zone) as Offset;
        if (zoneOffset) zoneState[zoneOffset] = zone;
      });

      zonesGroup.style.opacity = "1.0";
      setZones(zoneState);

      return () => {
        timeouts.forEach((timeout) => {
          clearTimeout(timeout);
        });
      };
    },
    []
  );

  useEffect(() => {
    const zoneEvent = (callback?: (offset: Offset) => void) => (event: any) => {
      if (!callback) return;
      const path = event.target as SVGElement;
      const zone = path.parentElement as any as SVGElement;
      const offset = getLabel(zone) as Offset;
      callback(offset);
    };
    const events = [
      ["mouseover", onMouseOver],
      ["mouseout", onMouseOut],
      ["click", onClick],
    ]
      .filter(([_, ev]) => typeof ev === "function")
      .map(([name, ev]) => [name, zoneEvent(ev as any)]) as [
      string,
      EventListenerOrEventListenerObject
    ][];

    const zoneParents = Object.values(zones).filter(nodeIsElement);

    zoneParents.forEach((zoneParent) => {
      zoneParent.childNodes.forEach((group) => {
        events.forEach(([name, event]) => group.addEventListener(name, event));
      });
    });

    return () => {
      zoneParents.forEach((zoneParent) => {
        zoneParent.childNodes.forEach((group) => {
          events.forEach(([name, event]) =>
            group.removeEventListener(name, event)
          );
        });
      });
    };
  }, [zones, onMouseOver, onMouseOut, onClick]);

  return (
    <div className="world">
      <SvgObject
        data={linesUrl}
        onLoad={initializeWorld}
        style={{ visibility: "hidden", height: "100%" }}
        hideUntilLoad
      />
    </div>
  );
};
