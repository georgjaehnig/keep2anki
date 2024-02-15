const fs = require("fs");
const path = require("path");

const directoryPath = "./Keep";

const processFile = (file) => {
  if (path.extname(file) === ".json") {
    const filePath = path.join(directoryPath, file);
    fs.readFile(filePath, "utf8", (err, data) => {
      if (err) {
        console.error("Error reading file:", err);
        return;
      }
      try {
        const jsonData = JSON.parse(data);
        // skip if isArchived is true
        if (jsonData.isArchived) {
          return;
        }
        // skip if not dictionary content
        if (
          !jsonData.textContent.includes(
            "Text generated by the application English Dictionary"
          )
        ) {
          return;
        }
        console.log(jsonData.title);
        const title = jsonData.title;
        let content = jsonData.textContent;
        // replace all occurences of title in content with 3 black blocks
        content = content.replace(new RegExp(title, "g"), "■■■");
        content = content.replace(
          /^(Etymology|Pronunciation)\n(?:\n)?((?:.+\n?)+)\n/gm,
          ""
        );
        console.log(content);
      } catch (error) {
        console.error("Error parsing JSON:", error);
      }
    });
  }
};

fs.readdir(directoryPath, (err, files) => {
  if (err) {
    console.error("Error reading directory:", err);
    return;
  }

  files.forEach(processFile);
});
