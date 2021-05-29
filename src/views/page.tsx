import React, {
  createRef,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { RecoilRoot, useRecoilState } from "recoil";
import { groupByZone } from "../lib/groupByZone";
import { useOffsetEffect } from "../lib/useOffsetEffect";
import { zoneToOffset } from "../lib/zoneToOffset";
import { Style } from "../Style";
import { GroupedUsers } from "./GroupedUsers";
import { selectedZoneState } from "./store";
import { Offset, offsets, World, ZoneProp } from "./World";

declare global {
  var currentProject: { id: string };
}

const loadUsers = async () => {
  return await aha.models.Project.select("name", "isTeam")
    .merge({
      users: aha.models.User.select(
        "id",
        "name",
        "timezone",
        // @ts-ignore
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
  const [overZone, setOverZone] = useState<Offset | null>(null);

  useEffect(() => {
    loadUsers().then((project) => {
      setProject(project);
      setUsers(project.users);
    });
  }, []);

  const groupedUsers = useMemo(() => groupByZone(users), [users]);

  useEffect(() => {
    const containerEl = containerRef.current;
    const worldEl = worldRef.current;
    if (!containerEl) return;

    const top = containerEl.offsetTop;
    containerEl.style.height = bodyHeight - top - 50 + "px";

    if (worldEl && containerEl.scrollHeight > containerEl.clientHeight) {
      const diff = containerEl.scrollHeight - containerEl.clientHeight;
      worldEl.style.height = "100%";
      worldEl.style.height = worldEl.clientHeight - diff + "px";
    }

    const handleResize = () => {
      setBodyHeight(document.body.scrollHeight);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [worldRef, bodyHeight]);

  const effectZones = useOffsetEffect({
    color: "#f0c",
    interval: 50,
    delay: 50,
  });
  const zones = useMemo(() => {
    const zones: ZoneProp = {
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
      const offset = zoneToOffset(selectedZone);
      zones[offset] = { color: "#ff0", opacity: 0.5 };

      const offsetIndex = offsets.indexOf(offset) + offsets.length;
      const offsetX = offsets.concat(offsets).concat(offsets);

      [0, 0.0, 0.05, 0.1, 0.15, 0.2, 0.25, 0.5, 0.5, 0.6, 0.6, 0.6].forEach(
        (opacity, idx) => {
          let offset = offsetX[offsetIndex + idx + 1];
          zones[offset] = { color: zones[offset]?.color || "#000", opacity };
          offset = offsetX[offsetIndex - (idx + 1)];
          zones[offset] = { color: zones[offset]?.color || "#000", opacity };
        }
      );
    }

    if (overZone) {
      zones[overZone] = { color: "#f0c", opacity: 0.6 };
    }

    return zones;
  }, [groupedUsers, selectedZone, overZone]);

  const handleOver = useCallback((offset: Offset) => {
    setOverZone(offset);
  }, []);
  const handleOut = useCallback(() => {
    setOverZone(null);
  }, []);

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

aha.on("page", ({}, {}) => {
  return (
    <>
      <Style />
      <RecoilRoot>
        <App />
      </RecoilRoot>
    </>
  );
});
