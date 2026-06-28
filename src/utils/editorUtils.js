const IMAGE_EXTENSIONS = ["png", "jpg", "jpeg", "gif", "webp", "ico", "svg"];
const MODEL_EXTENSIONS = ["glb", "gltf"];

export const getFileLayoutId = (fileContent) => {
  if (
    !fileContent ||
    typeof fileContent !== "string" ||
    fileContent.trim() === ""
  ) {
    return null;
  }
  try {
    const parsed = JSON.parse(fileContent);
    return parsed?._meta?.layout_id || null;
  } catch (e) {
    return null;
  }
};

export const findLayoutById = (layoutsList, layoutId) => {
  if (!layoutsList || !layoutId) return null;
  return layoutsList.find((l) => l.id === layoutId) || null;
};

export const isImageFile = (filePath) => {
  if (!filePath) return false;
  const ext = filePath.split(".").pop().toLowerCase();
  return IMAGE_EXTENSIONS.includes(ext);
};

export const isModelFile = (filePath) => {
  if (!filePath) return false;
  const ext = filePath.split(".").pop().toLowerCase();
  return MODEL_EXTENSIONS.includes(ext);
};
