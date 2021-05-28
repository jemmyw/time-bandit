import { useEffect, useState } from "react";
import { offsets, ZoneProp } from "../views/World";

export function useOffsetEffect({
  color,
  interval,
  delay,
}: {
  color: string;
  interval: number;
  delay?: number;
}) {
  const [zones, setZones] = useState<ZoneProp | null>(null);

  useEffect(() => {
    const timeouts = [];
    const fn = offsets
      .concat([...Array(6).keys()].map(() => "a"))
      .map((offset, idx) =>
        offsets
          .slice(Math.abs(idx - 4), Math.abs(idx))
          .reverse()
          .reduce(
            (acc, offset, idx) => ({
              ...acc,
              [offset]: { color, opacity: 0.5 - 0.1 * idx },
            }),
            { [offset]: { color, opacity: 0.6 } } as ZoneProp
          )
      )
      .map((step) => () => setZones(step))
      .reduceRight(
        (nextFn, step) => {
          return () => {
            step();
            if (nextFn) timeouts.push(setTimeout(nextFn, interval));
          };
        },
        () => setZones(null)
      );

    timeouts.push(setTimeout(fn, delay || 0));

    return () => timeouts.forEach(clearTimeout);
  }, []);

  return zones;
}
