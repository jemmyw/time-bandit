import { DateTime, IANAZone } from "luxon";
import React, { useEffect, useRef, useState } from "react";
import { ZoneUser } from "./ZoneUser";

interface Props {
  zone: IANAZone;
  users: Aha.User[];
}

const ZoneGroupTime: React.FC<{ time: DateTime }> = ({ time }) => {
  const parts = time.toLocaleParts(DateTime.TIME_WITH_SECONDS);

  return (
    <span>
      {parts.map(({ type, value }) => (
        <span className={type}>{value}</span>
      ))}
    </span>
  );
};

export const ZoneGroup: React.FC<Props> = ({ zone, users }) => {
  const intervalHandle = useRef<any>();
  const [time, setTime] = useState(DateTime.local().setZone(zone));

  useEffect(() => {
    intervalHandle.current = setInterval(() => {
      setTime(DateTime.local().setZone(zone));
    }, 1000);

    return () => {
      clearInterval(intervalHandle.current);
    };
  }, [zone]);

  return (
    <div className="zone-group">
      <div className="zone-group--header">
        <span className="zone-group--offset">
          {zone.offsetName(new Date().valueOf(), { format: "short" })}
        </span>
      </div>

      <div className="zone-group--users">
        {users.map((user) => (
          <ZoneUser zone={zone} user={user} key={user.id} />
        ))}
      </div>

      <div className="zone-group--time">
        <ZoneGroupTime time={time} />
      </div>
    </div>
  );
};
