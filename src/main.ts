import { FileSystemAdapter, Notice, Plugin, TFile } from "obsidian";
import { DEFAULT_SETTINGS, UpdownSettingTab } from "./settings";
import type { UpdownSettings } from "./settings";
import { UpdownProcess } from "./updown-process";

export default class UpdownPlugin extends Plugin {
  settings!: UpdownSettings;
  private process = new UpdownProcess();

  async onload() {
    console.log("[updown] plugin loaded");

    await this.loadSettings();
    this.addSettingTab(new UpdownSettingTab(this.app, this));

    this.addCommand({
      id: "start",
      name: "Start slideshow",
      callback: async () => {
        const filePath = this.getActiveFilePath();
        if (!filePath) return;

        if (!this.settings.updownPath) {
          new Notice("updown: executable path not configured — check settings");
          return;
        }

        try {
          new Notice("updown: starting…");
          await this.process.start(filePath, {
            updownPath: this.settings.updownPath,
            plantumlJarPath: this.settings.plantumlJarPath || undefined,
          });
          new Notice("updown: slideshow started");
        } catch (err) {
          new Notice(`updown: failed to start — ${err}`);
          console.error("[updown] start error", err);
        }
      },
    });

    this.addCommand({
      id: "stop",
      name: "Stop slideshow",
      callback: async () => {
        await this.process.stop();
        new Notice("updown: stopped");
      },
    });

    this.addCommand({
      id: "reload",
      name: "Reload slideshow",
      callback: async () => {
        const filePath = this.getActiveFilePath();
        if (!filePath) return;

        if (!this.settings.updownPath) {
          new Notice("updown: executable path not configured — check settings");
          return;
        }

        try {
          new Notice("updown: reloading…");
          await this.process.reload(filePath, {
            updownPath: this.settings.updownPath,
            plantumlJarPath: this.settings.plantumlJarPath || undefined,
          });
          new Notice("updown: slideshow reloaded");
        } catch (err) {
          new Notice(`updown: failed to reload — ${err}`);
          console.error("[updown] reload error", err);
        }
      },
    });
  }

  async onunload() {
    console.log("[updown] plugin unloaded");
    await this.process.stop();
  }

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }

  private getActiveFilePath(): string | null {
    const file = this.app.workspace.getActiveFile();
    if (!(file instanceof TFile)) {
      new Notice("updown: no active file");
      return null;
    }
    const adapter = this.app.vault.adapter;
    if (!(adapter instanceof FileSystemAdapter)) {
      new Notice("updown: vault must be on local filesystem");
      return null;
    }
    return adapter.getFullPath(file.path);
  }
}
