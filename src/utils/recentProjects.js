export const addRecentProject = (name, game, path) => {
  const projects = JSON.parse(localStorage.getItem("recentProjects") || "[]");
  const newProject = {
    id: Date.now(),
    name,
    game,
    path,
    lastModified: new Date().toLocaleString(),
  };

  const updated = [
    newProject,
    ...projects.filter((p) => p.path !== path),
  ].slice(0, 10);
  localStorage.setItem("recentProjects", JSON.stringify(updated));
};

export const getRecentProjects = () => {
  return JSON.parse(localStorage.getItem("recentProjects") || "[]");
};
