import React, { createRef, useEffect, useMemo, useState } from "react";
import { IANAZone } from "luxon";
import { ZoneGroup } from "./ZoneGroup";

interface Props {
  users: Aha.User[];
}

const zoneOrDefault = (zoneIdentifier: string) =>
  IANAZone.isValidZone(zoneIdentifier)
    ? IANAZone.create(zoneIdentifier)
    : IANAZone.create("America/Los_Angeles");

export const GroupedUsers: React.FC<Props> = ({ users }) => {
  const elementRef = createRef<HTMLDivElement>();
  const [hideNames, setHideNames] = useState(false);

  const groupedUsers = useMemo(() => {
    const ts = new Date().valueOf();
    return [
      ...users
        .reduce((acc, user) => {
          const zone = zoneOrDefault(user.timezone);
          return acc.set(zone, [...(acc.get(zone) || []), user]);
        }, new Map<IANAZone, Aha.User[]>())
        .entries(),
    ].sort(([zoneA], [zoneB]) => zoneA.offset(ts) - zoneB.offset(ts));
  }, [users]);

  useEffect(() => {
    if (elementRef.current.clientWidth < elementRef.current.scrollWidth) {
      setHideNames(true);
    }
  }, [elementRef, groupedUsers]);

  return (
    <div
      className={`grouped-users ${hideNames ? "hide-names" : ""}`}
      ref={elementRef}
    >
      {groupedUsers.map(([zone, users]) => (
        <ZoneGroup key={zone.name} zone={zone} users={users} />
      ))}
    </div>
  );
};
