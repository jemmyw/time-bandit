import React, { createRef, useEffect, useState } from "react";
// @ts-ignore
import pin from "../images/pin.svg";

const blob = new Blob([pin], { type: "image/svg+xml" });
const pinUrl = URL.createObjectURL(blob);

interface Props {
  imgSrc: string;
  style?: any;
  className?: string;
}

export const Pin: React.FC<Props> = ({ imgSrc, style, className }) => {
  const objectRef = createRef<HTMLObjectElement>();

  const update = () => {
    if (!objectRef.current) return;
    const svg = objectRef.current.contentDocument;
    if (!svg) return;
    const face = svg.getElementById("face");
    if (!face) return;
    face.setAttribute("xlink:href", imgSrc);
  };

  useEffect(() => {
    update();
  }, [objectRef, imgSrc]);

  return (
    <div className={`pin ${className}`} style={style}>
      <object
        ref={objectRef}
        data={pinUrl}
        type="image/svg+xml"
        onLoad={update}
        style={{ width: "100%" }}
      ></object>
    </div>
  );
};
