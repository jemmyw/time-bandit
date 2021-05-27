import React, { createRef, useEffect, useRef, useState } from "react";
// @ts-ignore
import lines from "../images/lineso.svg";

const blob = new Blob([lines], { type: "image/svg+xml" });
const linesUrl = URL.createObjectURL(blob);

export function World() {
  const linesRef = createRef<HTMLObjectElement>();
  const zoneRef = useRef();
  const [incLoader, setIncLoader] = useState(0);

  useEffect(() => {
    if (!linesRef.current) return;

    const objectElement = linesRef.current;
    if (objectElement.data !== linesUrl) objectElement.data = linesUrl;
    updateWorld();
  }, [linesRef, incLoader]);

  const updateWorld = () => {
    if (!linesRef.current) return;
    const objectElement = linesRef.current;
    if (!objectElement) return;
    const svg = objectElement.contentDocument;
    if (!svg) return;

    let zone: any = null;

    svg?.querySelectorAll("g").forEach((g) => {
      if (g.getAttribute("inkscape:label") === "zones") {
        zone = g;
      }
    });

    if (!zone) {
      return;
    }

    if (zoneRef.current === zone) return;
    console.log("start anim");
    zoneRef.current = zone;

    zone.style.opacity = 0.5;
    zone.id = "zones";

    const zones = [
      ...(svg?.querySelectorAll(`#${zone.id} > g`) as any),
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
      zone.style.transition = "opacity 0.3s";

      zone.childNodes.forEach((group) => {
        group.addEventListener("mouseover", zoneMouseOverEvent);
        group.addEventListener("mouseout", zoneMouseOutEvent);
      });

      setTimeout(() => {
        zone.style.opacity = "0.6";
        setTimeout(() => {
          zone.style.opacity = idx % 2 === 0 ? "0.1" : "0.3";
        }, 300);
      }, idx * 100);
    });

    objectElement.style.opacity = "0.0";
    setTimeout(() => {
      objectElement.style.transition = "opacity 1s";
      objectElement.style.visibility = "visible";
      objectElement.style.opacity = "1.0";
    }, 250);

    return () => {
      zones.forEach((zone) => {
        zone.childNodes.forEach((group) => {
          group.removeEventListener("mouseover", zoneMouseOverEvent);
          group.removeEventListener("moutout", zoneMouseOutEvent);
        });
      });
    };
  };

  return (
    <div className="world">
      <object
        ref={linesRef}
        onLoad={updateWorld}
        id="lines"
        data=""
        type="image/svg+xml"
        style={{ visibility: "hidden" }}
      ></object>
    </div>
  );
}
