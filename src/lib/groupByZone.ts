import { IANAZone } from "luxon";

interface Zoned {
  timezone: string;
}

const ts = new Date().valueOf();

const zoneOrDefault = (zoneIdentifier: string) =>
  IANAZone.isValidZone(zoneIdentifier)
    ? IANAZone.create(zoneIdentifier)
    : IANAZone.create("America/Los_Angeles");

const orderByOffset = (zoneA: IANAZone, zoneB: IANAZone) =>
  zoneA.offset(ts) - zoneB.offset(ts);

/**
 * Group things by timezone, ordered by offset
 *
 * @param items things with a timezone
 */
export function groupByZone<T extends Zoned>(items: T[]) {
  return [
    ...items
      .reduce((acc, user) => {
        const zone = zoneOrDefault(user.timezone);
        return acc.set(zone, [...(acc.get(zone) || []), user]);
      }, new Map<IANAZone, T[]>())
      .entries(),
  ].sort(([zoneA], [zoneB]) => orderByOffset(zoneA, zoneB));
}

export function zonesForItems(items: Zoned[]) {
  return [
    ...new Set(
      items
        .map((item) => zoneOrDefault(item.timezone))
        .filter(Boolean)
        .sort(orderByOffset)
    ),
  ];
}
