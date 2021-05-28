import React, { createRef, useEffect, useMemo, useState } from "react";
import { RecoilRoot, useRecoilState } from "recoil";
import { groupByZone } from "../lib/groupByZone";
import { useOffsetEffect } from "../lib/useOffsetEffect";
import { zoneToOffset } from "../lib/zoneToOffset";
import { Style } from "../Style";
import { GroupedUsers } from "./GroupedUsers";
import { selectedZoneState } from "./store";
import { Offset, offsets, World, ZoneProps } from "./World";

const loadUsers = async () => {
  return await aha.models.Project.select("name", "isTeam")
    .merge({
      users: aha.models.User.select(
        "id",
        "name",
        "timezone",
        `avatarUrl(size: ${aha.enums.AvatarSizeEnum.SIZE_40})`
      ),
    })
    .find(currentProject.id);
};

function App() {
  const containerRef = createRef<HTMLDivElement>();
  const worldRef = createRef<HTMLDivElement>();
  const [bodyHeight, setBodyHeight] = useState(document.body.scrollHeight);

  const [project, setProject] = useState<Aha.Project | null>(null);
  const [users, setUsers] = useState<Aha.User[]>([]);

  const [selectedZone] = useRecoilState(selectedZoneState);

  useEffect(() => {
    loadUsers().then((project) => {
      setProject(project);
      setUsers(project.users);
    });
  }, []);

  const groupedUsers = useMemo(() => groupByZone(users), [users]);

  useEffect(() => {
    const top = containerRef.current.offsetTop;
    containerRef.current.style.height = bodyHeight - top - 50 + "px";

    if (containerRef.current.scrollHeight > containerRef.current.clientHeight) {
      const diff =
        containerRef.current.scrollHeight - containerRef.current.clientHeight;
      worldRef.current.style.height = "100%";
      worldRef.current.style.height =
        worldRef.current.clientHeight - diff + "px";
    }

    const handleResize = () => {
      setBodyHeight(document.body.scrollHeight);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [worldRef, bodyHeight]);

  const effectZones = useOffsetEffect({
    color: "#f0c",
    interval: 75,
    delay: 250,
  });
  const [overZone, setOverZone] = useState<Offset>(null);
  const zones = useMemo(() => {
    const zones = {
      ...groupedUsers.reduce(
        (acc, [zone]) => ({
          ...acc,
          [zoneToOffset(zone)]: {
            color: "#f00",
            opacity: selectedZone ? 0.2 : 0.5,
          },
        }),
        {}
      ),
    };

    if (selectedZone) {
      zones[zoneToOffset(selectedZone)] = { color: "#f00", opacity: 0.5 };
    }

    if (overZone) {
      zones[overZone] = { color: "#f0c", opacity: 0.6 };
    }

    return zones;
  }, [groupedUsers, selectedZone, overZone]);

  const handleOver = (offset: Offset) => {
    setOverZone(offset);
  };
  const handleOut = () => {
    setOverZone(null);
  };

  return (
    <div className="App" ref={containerRef}>
      <div className="title">
        Time Bandit {project && <span>{project.name}</span>}
      </div>
      <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
        {project ? (
          <GroupedUsers users={users} groupedUsers={groupedUsers} />
        ) : (
          <aha-spinner />
        )}
        <div
          ref={worldRef}
          style={{
            display: "flex",
            justifyContent: "center",
            height: "100%",
          }}
        >
          {project && (
            <World
              zones={effectZones || zones}
              onMouseOver={handleOver}
              onMouseOut={handleOut}
            />
          )}
        </div>
      </div>
    </div>
  );
}

aha.on("page", ({ fields, onUnmounted }, { identifier, settings }) => {
  return (
    <>
      <Style />
      <RecoilRoot>
        <App />
      </RecoilRoot>
    </>
  );
});
