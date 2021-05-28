import { IANAZone } from "luxon";

interface Zoned {
  timezone: string;
}

const zoneOrDefault = (zoneIdentifier: string) =>
  IANAZone.isValidZone(zoneIdentifier)
    ? IANAZone.create(zoneIdentifier)
    : IANAZone.create("America/Los_Angeles");

/**
 * Group things by timezone, ordered by offset
 *
 * @param items things with a timezone
 */
export function groupByZone<T extends Zoned>(items: T[]) {
  const ts = new Date().valueOf();

  return [
    ...items
      .reduce((acc, user) => {
        const zone = zoneOrDefault(user.timezone);
        return acc.set(zone, [...(acc.get(zone) || []), user]);
      }, new Map<IANAZone, T[]>())
      .entries(),
  ].sort(([zoneA], [zoneB]) => zoneA.offset(ts) - zoneB.offset(ts));
}
