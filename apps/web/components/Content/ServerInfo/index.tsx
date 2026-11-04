"use client";
import { useState, useEffect } from "react";

export default function ServerInfo() {
  const [time, setTime] = useState("");
  useEffect(() => {
    const update = () =>
      setTime(
        new Date().toLocaleTimeString("en-GB", {
          timeZone: "UTC",
          hour: "2-digit",
          minute: "2-digit",
        }),
      );
    update();
    const timer = setInterval(update, 1000);
    return () => clearInterval(timer);
  }, []);
  return (
    <div className="realm-status">
      <span>MMORPG COMMUNITY</span>
      <span className="realm-status-diamond">◆</span>
      <span>WORLD TIME {time} UTC</span>
    </div>
  );
}
