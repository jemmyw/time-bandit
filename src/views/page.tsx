import React, { createRef, useEffect, useState } from "react";
// @ts-ignore
import lines from "../images/lines.svg";
import { Style } from "../Style";

const blob = new Blob([lines], { type: "image/svg+xml" });
const linesUrl = URL.createObjectURL(blob);

function App() {
  const linesRef = createRef<HTMLObjectElement>();
  const [incLoader, setIncLoader] = useState(0);

  useEffect(() => {
    if (!linesRef.current) return;

    const objectElement = linesRef.current;
    if (objectElement.data !== linesUrl) objectElement.data = linesUrl;

    const svg = objectElement.contentDocument;

    let zone: any = null;

    svg?.querySelectorAll("g").forEach((g) => {
      if (g.getAttribute("inkscape:label") === "zones") {
        zone = g;
      }
    });

    if (!zone) {
      setTimeout(() => setIncLoader((i) => i + 1), 100);
      return;
    }

    zone.style.opacity = 0.5;

    const zones = [
      ...(svg?.querySelectorAll(`#${zone.id} > g`) as any),
    ] as SVGElement[];

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
      zone.style.opacity = idx % 2 === 0 ? "0.1" : "0.3";
      zone.style.transition = "opacity 0.3s";
      zone.firstChild?.addEventListener("mouseover", zoneMouseOverEvent);
      zone.firstChild?.addEventListener("mouseout", zoneMouseOutEvent);
    });

    objectElement.style.opacity = "0.0";
    setTimeout(() => {
      objectElement.style.transition = "opacity 1s";
      objectElement.style.visibility = "visible";
      objectElement.style.opacity = "1.0";
    }, 250);

    return () => {
      zones.forEach((zone) => {
        zone.firstChild?.removeEventListener("mouseover", zoneMouseOverEvent);
        zone.firstChild?.removeEventListener("moutout", zoneMouseOutEvent);
      });
    };
  }, [linesRef, incLoader]);

  return (
    <div className="App">
      <div className="world">
        <object
          ref={linesRef}
          id="lines"
          data=""
          type="image/svg+xml"
          style={{ visibility: "hidden" }}
        ></object>
      </div>
    </div>
  );
}

aha.on("page", ({ fields, onUnmounted }, { identifier, settings }) => {
  return (
    <>
      <Style />
      <div className="title">Time Bandit</div>
      <App />
    </>
  );
});
