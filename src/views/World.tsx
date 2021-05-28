import React, { useCallback, useEffect, useRef, useState } from "react";
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

export interface ZoneProps {
  color: string;
  opacity: number;
}

export type ZoneProp = Record<Offset, ZoneProps>;
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
  const [zones, setZones] = useState<Record<Offset, SVGElement>>({});

  // const updateHighlight = useCallback(
  //   (zone: SVGElement, idx: number) => {
  //     if (highlight && highlight.includes(getLabel(zone) as Offset)) {
  //       zone.style.opacity = "1.0";
  //     } else {
  //       zone.style.opacity = stripedOpacity(idx);
  //     }
  //   },
  //   [highlight]
  // );

  const updateHighlights = useCallback(() => {
    // zones.forEach((zone, idx) => {
    //   updateHighlight(zone, idx);
    // });
    visibleZones.current.forEach((zone) => (zone.style.opacity = "0.0"));
    visibleZones.current = [];

    Object.entries(highlight || {}).forEach(([offset, props]) => {
      const zone = zones[offset as Offset];
      if (!zone) return;

      visibleZones.current = [...visibleZones.current, zone];

      zone.childNodes.forEach((group) => {
        if (group.setAttribute) group.setAttribute("fill", props.color);
      });

      zone.style.opacity = String(props.opacity);
    });
  }, [zones, highlight]);

  useEffect(() => {
    updateHighlights();
  }, [highlight, updateHighlights]);

  const initializeWorld = useCallback((svg: Document) => {
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

    const timeouts = [];
    const zones = [
      ...(svg.querySelectorAll(`#${zonesGroup.id} > g`) as any),
    ].reverse() as SVGElement[];

    const zoneEvent = (callback: (offset: Offset) => void) => (event: any) => {
      if (!callback) return;
      const path = event.target as SVGElement;
      const zone = path.parentElement as any as SVGElement;
      const offset = getLabel(zone) as Offset;
      callback(offset);
    };
    const clickEvent = zoneEvent(onClick);
    const mouseOverEvent = zoneEvent(onMouseOver);
    const mouseOutEvent = zoneEvent(onMouseOut);
    const zoneState = {};

    zones.forEach((zone, idx) => {
      zone.style.opacity = "0.0";

      zone.childNodes.forEach((group) => {
        group.addEventListener("mouseover", mouseOverEvent);
        group.addEventListener("mouseout", mouseOutEvent);
        group.addEventListener("click", clickEvent);
      });

      zoneState[getLabel(zone)] = zone;

      // timeouts.push(
      //   setTimeout(() => {
      //     zone.style.opacity = "0.6";
      //     timeouts.push(
      //       setTimeout(() => {
      //         setZones((zones) => [...zones, zone]);
      //       }, 100)
      //     );
      //   }, 100 + idx * 100)
      // );
    });

    zonesGroup.style.opacity = "1.0";
    setZones(zoneState);

    return () => {
      timeouts.forEach((timeout) => {
        clearTimeout(timeout);
      });

      zones.forEach((zone) => {
        zone.childNodes.forEach((group) => {
          group.removeEventListener("mouseover", mouseOverEvent);
          group.removeEventListener("mouseout", mouseOutEvent);
          group.removeEventListener("click", clickEvent);
        });
      });
    };
  }, []);

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
