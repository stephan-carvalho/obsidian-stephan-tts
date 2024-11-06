// play.ts
import { Vault, Workspace, Notice } from 'obsidian';
import { AzureSpeechService } from '../services/azureSpeech';
import { sanitizeText } from '../utils/textSanitizer';
import { StephanTTSSettings } from '../settings';

export function playOrPause(
    vault: Vault,
    workspace: Workspace,
    azureSpeechService: AzureSpeechService,
    statusBarItem: HTMLElement,
    settings: StephanTTSSettings // Adiciona o parâmetro settings
) {
    const voice = settings.voice; // Obtenha a voz configurada

    // Atualize a voz no AzureSpeechService
    azureSpeechService.setVoice(voice);

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
                    // Limpa o conteúdo usando a função sanitizeText
                    const cleanedContent = sanitizeText(content);

                    // Passa o conteúdo limpo para o serviço de leitura com callback
                    azureSpeechService.play(cleanedContent, () => {
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
