import React, { useEffect, useState } from "react";
import { Style } from "../Style";
import { Pin } from "./Pin";
import { World } from "./World";

const loadUser = async () => {
  return await aha.models.User.select(`avatarUrl(size: SIZE_160)`).find(
    currentUser.id
  );
};

function App() {
  const [avatarUrl, setAvatarUrl] = useState<string>();

  useEffect(() => {
    loadUser().then((user) => {
      setAvatarUrl(user.avatarUrl);
    });
  });

  return (
    <div className="App">
      <World />
      {avatarUrl && <Pin imgSrc={avatarUrl} style={{ top: "0px" }} />}
    </div>
  );
}

aha.on("page", ({ fields, onUnmounted }, { identifier, settings }) => {
  return (
    <>
      <Style />
      <div className="title">Time Bandit</div>
      <App />
    </>
  );
});
