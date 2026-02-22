import { Notice, Plugin, TFile } from "obsidian";

export default class UpdownPlugin extends Plugin {
  async onload() {
    console.log("[updown] plugin loaded");

    this.addCommand({
      id: "open-in-updown",
      name: "Open note as slideshow",
      callback: () => {
        const file = this.app.workspace.getActiveFile();
        if (!(file instanceof TFile)) {
          new Notice("updown: no active file");
          console.log("[updown] no active file");
          return;
        }
        console.log("[updown] open slideshow for:", file.path);
        new Notice(`updown: opening ${file.basename}`);
      },
    });
  }

  async onunload() {
    console.log("[updown] plugin unloaded");
  }
}
