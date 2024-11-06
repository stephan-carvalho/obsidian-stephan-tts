// src/settings.ts
import { App, PluginSettingTab, Setting } from 'obsidian';
import StephanTTSPlugin from './main';

// Interface para as configurações do plugin
export interface StephanTTSSettings {
  azureApiKey: string;
  azureRegion: string;
}

// Valores padrão das configurações
export const DEFAULT_SETTINGS: StephanTTSSettings = {
  azureApiKey: '',
  azureRegion: ''
};

// Aba de configurações no Obsidian
export class StephanTTSSettingTab extends PluginSettingTab {
  plugin: StephanTTSPlugin;

  constructor(app: App, plugin: StephanTTSPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();

    containerEl.createEl('h1', { text: 'Configurações do Stephan TTS Plugin' });

    // Campo para a chave de API do Azure
    new Setting(containerEl)
      .setName('Azure API Key')
      .setDesc('Insira sua chave de API do Azure Speech')
      .addText(text => text
        .setPlaceholder('Insira a chave de API...')
        .setValue(this.plugin.settings.azureApiKey)
        .onChange(async (value) => {
          this.plugin.settings.azureApiKey = value;
          await this.plugin.saveSettings();
        }));

    // Campo para a região do Azure
    new Setting(containerEl)
      .setName('Azure Region')
      .setDesc('Insira a região do seu recurso Azure Speech (ex: brazilsouth)')
      .addText(text => text
        .setPlaceholder('Insira a região...')
        .setValue(this.plugin.settings.azureRegion)
        .onChange(async (value) => {
          this.plugin.settings.azureRegion = value;
          await this.plugin.saveSettings();
        }));
  }
}
