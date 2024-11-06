import { Plugin } from 'obsidian';
import { StephanTTSSettings } from '../settings';

export async function saveSettings(plugin: Plugin, settings: StephanTTSSettings): Promise<void> {
    await plugin.saveData(settings);
}
