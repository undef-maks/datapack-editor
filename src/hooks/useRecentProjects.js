import { useState, useEffect } from "react";
import { getRecentProjects } from "../utils/recentProjects";

export const useRecentProjects = () => {
  const [recentProjects, setRecentProjects] = useState([]);

  useEffect(() => {
    setRecentProjects(getRecentProjects());
  }, []);

  const refreshProjects = () => {
    setRecentProjects(getRecentProjects());
  };

  return { recentProjects, refreshProjects };
};
