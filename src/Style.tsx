import React from "react";
// @ts-ignore
import zones from "./images/zones.png";

function css(strings: TemplateStringsArray, ...expr: string[]) {
  return (
    expr.reduce((output, value, index) => {
      return output + strings[index] + value;
    }, "") + strings[expr.length]
  );
}

export function Style() {
  return (
    <style>
      {css`
        .title {
          color: var(--aha-green-800);
          font-size: 20px;
          text-align: center;
          margin: 20px;
        }

        .world {
          width: 1000px;
          height: 1000px;
          background-image: url(${zones});
          background-repeat: no-repeat;
          background-size: contain;
        }
      `}
    </style>
  );
}
