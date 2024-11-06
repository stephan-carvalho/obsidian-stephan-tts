import { Plugin } from 'obsidian';
import { StephanTTSSettings, DEFAULT_SETTINGS } from '../settings';

export async function loadSettings(plugin: Plugin): Promise<StephanTTSSettings> {
    return Object.assign({}, DEFAULT_SETTINGS, await plugin.loadData());
}
