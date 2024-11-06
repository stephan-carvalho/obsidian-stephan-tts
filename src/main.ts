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

    async onload() {
        this.settings = await loadSettings(this);
        this.azureSpeechService = new AzureSpeechService(this.settings.azureApiKey, this.settings.azureRegion);
        this.addSettingTab(new StephanTTSSettingTab(this.app, this));

        this.statusBarItem = this.addStatusBarItem();
        this.statusBarItem.setText("▶️");
        this.statusBarItem.addEventListener("click", () => 
            playOrPause(this.app.vault, this.app.workspace, this.azureSpeechService, this.statusBarItem)
        );
    }

    async saveSettings() {
        await saveSettings(this, this.settings);
    }
}
