// main.ts
import { Plugin } from 'obsidian';
import { StephanTTSSettings, StephanTTSSettingTab } from './settings';
import { AzureSpeechService } from './services/azureSpeech';
import { playOrPause } from './commands/play';
import { loadSettings } from './commands/loadSettings';
import { saveSettings } from './commands/saveSettings';

export default class StephanTTSPlugin extends Plugin {
    settings!: StephanTTSSettings;
    azureSpeechService!: AzureSpeechService;
    private statusBarItem!: HTMLElement;
    private stopButton!: HTMLElement; // Novo botão de Stop

    async onload() {
        this.settings = await loadSettings(this);
        this.azureSpeechService = new AzureSpeechService(
            this.settings.azureApiKey,
            this.settings.azureRegion,
            this.settings.voice
        );
        this.addSettingTab(new StephanTTSSettingTab(this.app, this));

        // Criação do botão de Play/Pause
        this.statusBarItem = this.addStatusBarItem();
        this.statusBarItem.setText("▶️");
        this.statusBarItem.addEventListener("click", () => 
            playOrPause(this.app.vault, this.app.workspace, this.azureSpeechService, this.statusBarItem, this.settings)
        );

        // Criação do botão de Stop
        this.stopButton = this.addStatusBarItem();
        this.stopButton.setText("⏹️");
        this.stopButton.addEventListener("click", () => {
            this.azureSpeechService.stop();
            this.statusBarItem.setText("▶️"); // Atualiza o botão de Play para o estado inicial
        });
    }

    async saveSettings() {
        await saveSettings(this, this.settings);
    }
}
