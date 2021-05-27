import { IANAZone } from "luxon";
import React from "react";

interface Props {
  user: Aha.User;
  zone: IANAZone;
}

export const ZoneUser: React.FC<Props> = ({ zone, user }) => {
  return (
    <div className="zone-user">
      <div className="zone-user--name">{user.name}</div>
      <div className="zone-user--avatar">
        <img src={user.avatarUrl} />
      </div>
    </div>
  );
};
