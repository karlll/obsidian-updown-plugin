import { App, PluginSettingTab, Setting } from "obsidian";
import type UpdownPlugin from "./main";

export type UpdownSettings = {
  updownPath: string;
  plantumlJarPath: string;
};

export const DEFAULT_SETTINGS: UpdownSettings = {
  updownPath: "",
  plantumlJarPath: "",
};

export class UpdownSettingTab extends PluginSettingTab {
  constructor(app: App, private plugin: UpdownPlugin) {
    super(app, plugin);
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();

    new Setting(containerEl)
      .setName("updown executable path")
      .setDesc("Path to the updown executable (e.g. /usr/local/bin/updown)")
      .addText((text) =>
        text
          .setPlaceholder("/path/to/updown")
          .setValue(this.plugin.settings.updownPath)
          .onChange(async (value) => {
            this.plugin.settings.updownPath = value.trim();
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName("PlantUML JAR path")
      .setDesc("Optional: path to plantuml.jar for PlantUML diagram support")
      .addText((text) =>
        text
          .setPlaceholder("/path/to/plantuml.jar")
          .setValue(this.plugin.settings.plantumlJarPath)
          .onChange(async (value) => {
            this.plugin.settings.plantumlJarPath = value.trim();
            await this.plugin.saveSettings();
          })
      );
  }
}
