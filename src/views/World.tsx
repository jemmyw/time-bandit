import React, {
  createRef,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
// @ts-ignore
import lines from "../images/lineso.svg";
import { SvgObject } from "../SvgObject";

const blob = new Blob([lines], { type: "image/svg+xml" });
const linesUrl = URL.createObjectURL(blob);

type Offset =
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

const getLabel = (el: SVGElement) => el.getAttribute("inkscape:label");
const stripedOpacity = (index: number) => (index % 2 === 0 ? "0.1" : "0.3");
interface Props {
  highlight?: Offset[];
}

export const World: React.FC<Props> = ({ highlight }) => {
  const zoneRef = useRef<SVGElement>();
  const zonesRef = useRef<SVGElement[]>();

  const updateHighlight = useCallback((zone: SVGElement, idx: number) => {
    if (highlight.includes(getLabel(zone) as Offset)) {
      zone.style.opacity = "1.0";
    } else {
      zone.style.opacity = stripedOpacity(idx);
    }
  }, []);

  const updateHighlights = useCallback(() => {
    if (!zonesRef.current) return;

    zonesRef.current.forEach((zone, idx) => {
      updateHighlight(zone, idx);
    });
  }, [zonesRef]);

  useEffect(() => {
    updateHighlights();
  }, [highlight]);

  const initializeWorld = useCallback((svg: Document) => {
    let zone: any = null;

    svg.querySelectorAll("g").forEach((g) => {
      if (g.getAttribute("inkscape:label") === "zones") {
        zone = g;
      }
    });

    if (!zone) {
      return;
    }

    if (zoneRef.current === zone) return;
    zoneRef.current = zone;

    zone.id = "zones";

    const timeouts = [];
    const zones = [
      ...(svg.querySelectorAll(`#${zone.id} > g`) as any),
    ].reverse() as SVGElement[];

    const zoneMouseOverEvent = (event: any) => {
      const path = event.target as SVGElement;
      const zone = path.parentElement as any as SVGElement;

      if (!zone.getAttribute("data-prev-opacity"))
        zone.setAttribute("data-prev-opacity", zone.style.opacity);
      zone.style.opacity = "1.0";
    };

    const zoneMouseOutEvent = (event: any) => {
      const path = event.target as SVGElement;
      const zone = path.parentElement as any as SVGElement;
      const prevOpacity = zone.getAttribute("data-prev-opacity");
      if (prevOpacity) {
        zone.style.opacity = prevOpacity;
        zone.removeAttribute("data-prev-opacity");
      }
    };

    zones.forEach((zone, idx) => {
      // zone.style.opacity = idx % 2 === 0 ? "0.1" : "0.3";
      zone.style.opacity = "0";
      // zone.style.transition = "opacity 0.2s";

      zone.childNodes.forEach((group) => {
        group.addEventListener("mouseover", zoneMouseOverEvent);
        group.addEventListener("mouseout", zoneMouseOutEvent);
      });

      timeouts.push(
        setTimeout(() => {
          zone.style.opacity = "0.6";
          timeouts.push(
            setTimeout(() => {
              updateHighlight(zone, idx);
            }, 100)
          );
        }, 100 + idx * 100)
      );
    });

    zone.style.opacity = "0.0";
    timeouts.push(
      setTimeout(() => {
        zone.style.transition = "opacity 1s";
        zone.style.opacity = "0.5";
      }, 250)
    );

    return () => {
      timeouts.forEach((timeout) => {
        clearTimeout(timeout);
      });

      zones.forEach((zone) => {
        zone.childNodes.forEach((group) => {
          group.removeEventListener("mouseover", zoneMouseOverEvent);
          group.removeEventListener("moutout", zoneMouseOutEvent);
        });
      });
    };
  }, []);

  return (
    <div className="world">
      <SvgObject
        data={linesUrl}
        onLoad={initializeWorld}
        style={{ visibility: "hidden" }}
        hideUntilLoad
      />
    </div>
  );
};
