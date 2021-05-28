import { DateTime, IANAZone } from "luxon";
import React, { useEffect, useRef, useState } from "react";
import { useRecoilState } from "recoil";
import { selectedZoneState } from "./store";
import { ZoneUser } from "./ZoneUser";

interface Props {
  zone: IANAZone;
  users: Aha.User[];
}

const ZoneGroupTime: React.FC<{ time: DateTime }> = ({ time }) => {
  const parts = time.toLocaleParts(DateTime.TIME_WITH_SECONDS);

  return (
    <span>
      {parts.map(({ type, value }, idx) => (
        <span key={idx} className={type}>
          {value}
        </span>
      ))}
    </span>
  );
};

export const ZoneGroup: React.FC<Props> = ({ zone, users }) => {
  const intervalHandle = useRef<any>();
  const [time, setTime] = useState(DateTime.local().setZone(zone));
  const [_, setSelectedZone] = useRecoilState(selectedZoneState);

  useEffect(() => {
    intervalHandle.current = setInterval(() => {
      setTime(DateTime.local().setZone(zone));
    }, 1000);

    return () => {
      clearInterval(intervalHandle.current);
    };
  }, [zone]);

  const handleMouseOver = () => {
    setSelectedZone(zone);
  };

  const handleMouseOut = () => {
    setSelectedZone(null);
  };

  return (
    <div
      className="zone-group"
      onMouseOver={handleMouseOver}
      onMouseOut={handleMouseOut}
    >
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
