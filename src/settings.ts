import { App, PluginSettingTab, Setting, Notice, DropdownComponent } from 'obsidian';
import StephanTTSPlugin from './main';
import * as speechsdk from 'microsoft-cognitiveservices-speech-sdk';

// Interface para as configurações do plugin
export interface StephanTTSSettings {
  azureApiKey: string;
  azureRegion: string;
  voice: string; // Altere para selecionar a voz
  selectedLocale: string; // Filtro persistente de idioma
  selectedGender: string; // Filtro persistente de gênero
}

// Valores padrão das configurações
export const DEFAULT_SETTINGS: StephanTTSSettings = {
  azureApiKey: '',
  azureRegion: '',
  voice: 'en-US-AriaNeural',
  selectedLocale: '', // Default: sem filtro
  selectedGender: ''  // Default: sem filtro
};

// Aba de configurações no Obsidian
export class StephanTTSSettingTab extends PluginSettingTab {
  plugin: StephanTTSPlugin;
  voices: { shortName: string, localizedName: string, locale: string, gender: string }[] = [];
  voiceDropdown!: DropdownComponent; // Usando definite assignment assertion

  constructor(app: App, plugin: StephanTTSPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  async display(): Promise<void> {
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
          await this.refreshVoices(); // Recarrega as vozes ao mudar a chave
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
          await this.refreshVoices(); // Recarrega as vozes ao mudar a região
        }));

    // Inicializar vozes com a configuração atual
    await this.refreshVoices();
  }

  // Função auxiliar para atualizar o dropdown de vozes ao mudar região ou chave de API
  async refreshVoices(): Promise<void> {
    const { containerEl } = this;
    this.voices = await this.fetchVoices();

    // Adicionar filtros de idioma e gênero
    new Setting(containerEl)
      .setName('Idioma')
      .setDesc('Escolha o idioma das vozes')
      .addDropdown(dropdown => {
        dropdown.addOption('', 'Todos');
        [...new Set(this.voices.map(v => v.locale))].forEach(locale => {
          dropdown.addOption(locale, locale);
        });
        dropdown.setValue(this.plugin.settings.selectedLocale); // Carrega filtro salvo
        dropdown.onChange(async (value) => {
          this.plugin.settings.selectedLocale = value;
          await this.plugin.saveSettings();
          this.updateVoiceOptions(); // Atualiza opções de voz ao mudar o idioma
        });
      });

    new Setting(containerEl)
      .setName('Gênero')
      .setDesc('Escolha o gênero das vozes')
      .addDropdown(dropdown => {
        dropdown.addOption('', 'Todos');
        dropdown.addOption('Male', 'Masculino');
        dropdown.addOption('Female', 'Feminino');
        dropdown.setValue(this.plugin.settings.selectedGender); // Carrega filtro salvo
        dropdown.onChange(async (value) => {
          this.plugin.settings.selectedGender = value;
          await this.plugin.saveSettings();
          this.updateVoiceOptions(); // Atualiza opções de voz ao mudar o gênero
        });
      });

    // Dropdown de voz com vozes filtradas e ordenadas
    new Setting(containerEl)
      .setName('Voice')
      .setDesc('Escolha a voz para a leitura')
      .addDropdown(dropdown => {
        this.voiceDropdown = dropdown; // Armazena referência do dropdown
        this.updateVoiceOptions(dropdown); // Preenche o dropdown inicialmente
        dropdown.onChange(async (value) => {
          this.plugin.settings.voice = value;
          await this.plugin.saveSettings();
        });
      });
  }

  // Função para buscar vozes do Azure Speech Service
  async fetchVoices(): Promise<{ shortName: string, localizedName: string, locale: string, gender: string }[]> {
    const { azureApiKey, azureRegion } = this.plugin.settings;
    if (!azureApiKey || !azureRegion) {
      new Notice("Por favor, insira a chave de API e a região do Azure nas configurações.");
      return [];
    }

    try {
      const response = await fetch(`https://${azureRegion}.tts.speech.microsoft.com/cognitiveservices/voices/list`, {
        method: 'GET',
        headers: {
          'Ocp-Apim-Subscription-Key': azureApiKey
        }
      });

      if (!response.ok) {
        new Notice("Erro ao obter a lista de vozes.");
        return [];
      }

      const voicesData = await response.json();
      const voices = voicesData.map((voice: any) => ({
        shortName: voice.ShortName,
        localizedName: voice.LocalName,
        locale: voice.Locale,
        gender: voice.Gender
      }));

      return voices;
    } catch (error) {
      console.error("Erro ao configurar a chamada de API:", error);
      new Notice("Erro ao configurar a API do serviço de fala.");
      return [];
    }
  }

  // Função para filtrar e ordenar vozes antes de exibi-las no dropdown
  async updateVoiceOptions(dropdown?: DropdownComponent) {
    // Use o dropdown armazenado se não for passado um dropdown como parâmetro
    const targetDropdown = dropdown || this.voiceDropdown;

    // Filtrar as vozes conforme os filtros selecionados
    let filteredVoices = this.voices;
    if (this.plugin.settings.selectedLocale) {
      filteredVoices = filteredVoices.filter(voice => voice.locale === this.plugin.settings.selectedLocale);
    }
    if (this.plugin.settings.selectedGender) {
      filteredVoices = filteredVoices.filter(voice => voice.gender === this.plugin.settings.selectedGender);
    }

    // Ordenar as vozes alfabeticamente pelo nome
    filteredVoices.sort((a, b) => a.localizedName.localeCompare(b.localizedName));

    // Atualizar o dropdown com as vozes filtradas e ordenadas
    if (targetDropdown) {
      targetDropdown.selectEl.empty(); // Esvaziar opções do dropdown
      filteredVoices.forEach(voice => {
        targetDropdown.addOption(voice.shortName, voice.localizedName);
      });
      targetDropdown.setValue(this.plugin.settings.voice);
    }
  }
}
