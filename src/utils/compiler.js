export class DatapackCompiler {
  constructor(srcHandle, buildHandle) {
    this.srcHandle = srcHandle;
    this.buildHandle = buildHandle;
  }

  async build() {
    const stats = { folders: 0, files: 0 };
    try {
      await this.syncRecursive(this.srcHandle, this.buildHandle, stats);
      return { success: true, stats };
    } catch (err) {
      return { success: false, error: err.message, stats };
    }
  }

  async syncRecursive(srcHandle, buildHandle, stats) {
    const buildEntries = new Map();
    for await (const entry of buildHandle.values()) {
      buildEntries.set(entry.name, entry);
    }

    for await (const entry of srcHandle.values()) {
      if (entry.kind === "directory") {
        stats.folders++;
        const newBuildDir = await buildHandle.getDirectoryHandle(entry.name, {
          create: true,
        });
        await this.syncRecursive(entry, newBuildDir, stats);
        buildEntries.delete(entry.name);
      } else if (entry.kind === "file") {
        stats.files++;
        await this.syncFile(entry, buildHandle);
        buildEntries.delete(entry.name);
      }
    }

    for (const [name] of buildEntries) {
      await buildHandle.removeEntry(name, { recursive: true });
    }
  }

  async syncFile(srcFileHandle, buildDirHandle) {
    const srcFile = await srcFileHandle.getFile();
    const isJson = srcFileHandle.name.toLowerCase().endsWith(".json");

    if (!isJson) {
      try {
        const targetFileHandle = await buildDirHandle.getFileHandle(
          srcFileHandle.name,
        );
        const targetFile = await targetFileHandle.getFile();
        if (srcFile.lastModified <= targetFile.lastModified) return;
      } catch (e) {}
    }

    const newHandle = await buildDirHandle.getFileHandle(srcFileHandle.name, {
      create: true,
    });
    const writable = await newHandle.createWritable();

    if (isJson) {
      try {
        const text = await srcFile.text();
        let json = JSON.parse(text);

        if (json && typeof json === "object") {
          if ("_meta" in json) {
            delete json._meta;
          }
          json = this.processMacros(json);
        }

        await writable.write(JSON.stringify(json, null, "\t"));
      } catch (err) {
        await writable.write(srcFile);
      }
    } else {
      await writable.write(srcFile);
    }

    await writable.close();
  }

  processMacros(node) {
    if (node === null || typeof node !== "object") {
      return node;
    }

    if (Array.isArray(node)) {
      const newArray = [];
      for (const item of node) {
        if (
          item &&
          typeof item === "object" &&
          !Array.isArray(item) &&
          "$self" in item
        ) {
          const selfData = item.$self;
          if (Array.isArray(selfData)) {
            for (const scope of selfData) {
              const templateCopy = { ...item };
              delete templateCopy.$self;
              const resolvedItem = this.resolveScope(templateCopy, scope);
              newArray.push(this.processMacros(resolvedItem));
            }
          }
        } else {
          newArray.push(this.processMacros(item));
        }
      }
      return newArray;
    }

    const newObj = {};
    for (const key in node) {
      if (Object.prototype.hasOwnProperty.call(node, key)) {
        newObj[key] = this.processMacros(node[key]);
      }
    }
    return newObj;
  }

  resolveScope(template, scope) {
    if (typeof template === "string") {
      if (template.startsWith("$self.")) {
        const fieldKey = template.substring(6);
        if (scope && typeof scope === "object" && fieldKey in scope) {
          return scope[fieldKey];
        }
      }
      return template;
    }

    if (template === null || typeof template !== "object") {
      return template;
    }

    if (Array.isArray(template)) {
      return template.map((item) => this.resolveScope(item, scope));
    }

    const resultObj = {};
    for (const key in template) {
      if (Object.prototype.hasOwnProperty.call(template, key)) {
        resultObj[key] = this.resolveScope(template[key], scope);
      }
    }
    return resultObj;
  }
}
