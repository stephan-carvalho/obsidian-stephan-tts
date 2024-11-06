// play.ts
import { Vault, Workspace, Notice } from 'obsidian';
import { AzureSpeechService } from '../services/azureSpeech';

export function playOrPause(vault: Vault, workspace: Workspace, azureSpeechService: AzureSpeechService, statusBarItem: HTMLElement) {
    if (azureSpeechService.getIsPlaying() && !azureSpeechService.getIsPaused()) {
        azureSpeechService.pause();
        statusBarItem.setText("▶️");
        new Notice("Leitura pausada.");
    } else if (azureSpeechService.getIsPaused()) {
        azureSpeechService.resume();
        statusBarItem.setText("⏸️");
        new Notice("Leitura retomada.");
    } else {
        const activeLeaf = workspace.getActiveFile();
        if (activeLeaf) {
            vault.read(activeLeaf).then((content) => {
                if (content.trim()) {
                    // Passa uma callback para atualizar o status ao final do áudio
                    azureSpeechService.play(content, () => {
                        statusBarItem.setText("▶️"); // Atualiza o botão ao terminar o áudio
                    });
                    statusBarItem.setText("⏸️");
                } else {
                    new Notice("A nota está vazia.");
                }
            }).catch(error => {
                console.error("Erro ao ler a nota:", error);
                new Notice("Erro ao acessar o conteúdo da nota. Verifique o arquivo e tente novamente.");
            });
        } else {
            new Notice("Nenhuma nota ativa encontrada.");
        }
    }
}
