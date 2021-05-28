import { IANAZone } from "luxon";
import { atom } from "recoil";

export const selectedZoneState = atom<IANAZone | null>({
  key: "selectedZoneState",
  default: null,
});
