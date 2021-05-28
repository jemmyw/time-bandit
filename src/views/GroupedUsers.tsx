import { IANAZone } from "luxon";
import React, { createRef, useEffect, useState } from "react";
import { ZoneGroup } from "./ZoneGroup";

interface Props {
  users: Aha.User[];
  groupedUsers: [IANAZone, Aha.User[]][];
}

export const GroupedUsers: React.FC<Props> = ({ users, groupedUsers }) => {
  const elementRef = createRef<HTMLDivElement>();
  const [hideNames, setHideNames] = useState(false);

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
