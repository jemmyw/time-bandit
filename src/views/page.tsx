import React, { createRef, useEffect, useState } from "react";
import { Style } from "../Style";
import { GroupedUsers } from "./GroupedUsers";
import { World } from "./World";

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
  const [bodyHeight, setBodyHeight] = useState(document.body.scrollHeight);

  const [project, setProject] = useState<Aha.Project | null>(null);
  const [users, setUsers] = useState<Aha.User[]>([]);

  useEffect(() => {
    loadUsers().then((project) => {
      setProject(project);
      setUsers(project.users);
    });
  }, []);

  useEffect(() => {
    const top = containerRef.current.offsetTop;
    containerRef.current.style.height = bodyHeight - top - 50 + "px";

    const handleResize = () => setBodyHeight(document.body.scrollHeight);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [containerRef, bodyHeight]);

  return (
    <div className="App" ref={containerRef}>
      <div className="title">
        Time Bandit {project && <span>{project.name}</span>}
      </div>
      <aha-flex direction="column">
        {project ? <GroupedUsers users={users} /> : <aha-spinner />}
        <World />
      </aha-flex>
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
