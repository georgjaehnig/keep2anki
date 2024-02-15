const fs = require("fs").promises; // Use the Promise-based version of fs
const fsSync = require("fs");

const path = require("path");
const directoryPath = "./Keep";
const AnkiExport = require("anki-apkg-export").default;

class Keep2Anki {
  constructor(options) {
    this.cards = [];
    this.processDirectory(directoryPath).then(() => {
      const apkg = new AnkiExport(
        options.deckName,
        "A package from Google Keep notes."
      );
      for (let card of this.cards) {
        apkg.addCard(card.content, card.title);
      }
      apkg
        .save()
        .then((zip) => {
          fsSync.writeFileSync("./output.apkg", zip, "binary");
          console.log(`Package has been generated: output.pkg`);
        })
        .catch((err) => console.log(err.stack || err));
    });
  }

  processData(jsonData) {
    // skip if isArchived is true
    if (jsonData.isArchived) {
      return;
    }
    // skip if not dictionary content
    if (
      !jsonData.textContent ||
      !jsonData.textContent.includes(
        "Text generated by the application English Dictionary"
      )
    ) {
      return;
    }
    const title = jsonData.title;
    let content = jsonData.textContent;
    content = content.replace(
      new RegExp(`${title} \\(http://en\\.wiktionary\\.org/wiki/.*\\)\n`, "g"),
      ""
    );
    content = content.replace(new RegExp(title, "g"), "■■■");
    content = content.replace(
      /^(Etymology(?: \d)?|Pronunciation)\n(?:\n)?((?:.+\n?)+)\n/gm,
      ""
    );
    content = content.replace(
      new RegExp("This text.*livio.pack.lang.en_US", "gms"),
      ""
    );
    content = content.replace(/\n/gm, "<br>");
    content = `<p align="left">${content}</p>`;
    console.log(content);
    this.cards.push({ content, title });
  }
  async processFile(file) {
    if (path.extname(file) === ".json") {
      const filePath = path.join(directoryPath, file);
      try {
        const data = await fs.readFile(filePath, "utf8");
        const jsonData = JSON.parse(data);
        this.processData(jsonData);
      } catch (error) {
        console.error("Error reading or parsing file:", error);
      }
    }
  }

  async processDirectory(directoryPath) {
    try {
      const files = await fs.readdir(directoryPath);
      for (let file of files) {
        await this.processFile(file); // Wait for each file to be processed
      }
    } catch (err) {
      console.error("Error reading directory:", err);
    }
  }
}

const args = process.argv.slice(2);
const options = { deckName: "keep2anki" };

if (args.length > 0) {
  options.deckName = args[0];
}

new Keep2Anki(options);
