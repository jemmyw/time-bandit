import { IANAZone } from "luxon";
import { Offset } from "../views/World";

export function zoneToOffset(zone: IANAZone) {
  const name = zone.offsetName(new Date().valueOf(), { format: "short" });

  if (name.includes("-")) {
    return ("-" + name.split("-")[1]) as Offset;
  } else if (name.includes("+")) {
    return name.split("+")[1] as Offset;
  } else {
    return "0" as Offset;
  }
}
