import React, { createRef, useEffect, useMemo, useState } from "react";
import { groupByZone } from "../lib/groupByZone";
import { Style } from "../Style";
import { GroupedUsers } from "./GroupedUsers";
import { Offset, World } from "./World";

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

  useEffect(() => {
    loadUsers().then((project) => {
      setProject(project);
      setUsers(project.users);
    });
  }, []);

  const groupedUsers = useMemo(() => groupByZone(users), [users]);
  const highlight = useMemo(() => {
    const names = groupedUsers.map(([zone]) =>
      zone.offsetName(new Date().valueOf(), { format: "short" })
    );

    return names.map((name) => {
      if (name.includes("-")) {
        return "-" + name.split("-")[1];
      } else if (name.includes("+")) {
        return name.split("+")[1];
      } else {
        return "0";
      }
    }) as Offset[];
  }, [groupedUsers]);

  useEffect(() => {
    console.log("height effect");
    const top = containerRef.current.offsetTop;
    containerRef.current.style.height = bodyHeight - top - 50 + "px";

    if (containerRef.current.scrollHeight > containerRef.current.clientHeight) {
      const diff =
        containerRef.current.scrollHeight - containerRef.current.clientHeight;
      console.log(diff, worldRef.current.clientHeight - diff);
      worldRef.current.style.height =
        worldRef.current.clientHeight - diff + "px";
      console.log(diff, worldRef.current.clientHeight - diff);
    }

    const handleResize = () => {
      setBodyHeight(document.body.scrollHeight);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [containerRef, worldRef, bodyHeight]);

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
          {project && <World highlight={highlight} />}
        </div>
      </div>
    </div>
  );
}

aha.on("page", ({ fields, onUnmounted }, { identifier, settings }) => {
  return (
    <>
      <Style />
      <App />
    </>
  );
});
