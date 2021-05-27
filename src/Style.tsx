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

        .App {
          position: relative;
        }

        .world {
          margin: 0 20px;
          background-image: url(${zones});
          background-repeat: no-repeat;
          background-size: contain;
        }

        .pin {
          width: 50px;
          position: absolute;
        }

        .grouped-users {
          display: flex;
          justify-content: space-between;
          gap: 5px;
          margin: 0 20px;
          overflow-x: auto;
        }

        .zone-group {
          background: var(--aha-gray-100);
          border: 1px solid var(--aha-gray-400);
          border-radius: 5px;
          display: flex;
          flex-direction: column;
          gap: 10px;
          justify-content: space-between;
        }

        .zone-group--header {
          background-color: var(--aha-gray-900);
          color: var(--aha-gray-100);
          border-radius: 5px 5px 0 0;
          padding: 2px 5px;
        }

        .zone-group--users {
          display: flex;
          gap: 5px;
          flex-wrap: wrap;
          padding: 0 10px;
        }

        .zone-group--time {
          text-align: center;
          font-size: 200%;
          font-weight: 100;
          font-family: monospace;
          padding: 0 8px;
        }
        .zone-group--time .literal {
          color: var(--aha-gray-800);
        }
        .zone-group--time .second {
          color: var(--aha-gray-700);
        }

        .zone-user {
          display: flex;
          align-items: center;
          position: relative;
        }

        .zone-user--name {
          order: 1;
          padding: 5px 10px 5px 15px;
          background: white;
          border-top-right-radius: 12px;
          border-bottom-right-radius: 12px;
          margin-left: -10px;
          z-index: 0;
          box-shadow: 0px 0px 2px 0px rgb(0 0 0 / 49%);
          font-size: 90%;
          font-weight: 600;
          white-space: nowrap;
        }
        .hide-names .zone-user--name {
          display: none;
        }

        .zone-user--avatar {
          z-index: 1;
        }

        .zone-user--avatar img {
          flex-shrink: 0;
          border-radius: 50%;
          width: 32px;
          height: 32px;
          min-width: 32px;
          min-height: 32px;
          box-shadow: 0 0 0 rgba(0, 0, 0, 0.2);
        }
      `}
    </style>
  );
}
