import React from "react";
// @ts-ignore
import pin from "../images/pin.svg";
import { SvgObject } from "../SvgObject";

const blob = new Blob([pin], { type: "image/svg+xml" });
const pinUrl = URL.createObjectURL(blob);

interface Props {
  imgSrc: string;
  style?: any;
  className?: string;
}

export const Pin: React.FC<Props> = ({ imgSrc, style, className }) => {
  const update = (svg) => {
    const face = svg.getElementById("face");
    if (!face) return;
    face.setAttribute("xlink:href", imgSrc);
  };

  return (
    <div className={`pin ${className}`} style={style}>
      <SvgObject data={pinUrl} onLoad={update} style={{ width: "100%" }} />
    </div>
  );
};
