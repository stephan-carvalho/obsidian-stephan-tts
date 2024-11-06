import * as sdk from 'microsoft-cognitiveservices-speech-sdk';
import { Howl } from 'howler';

export class AzureSpeechService {
    private speechConfig: sdk.SpeechConfig;
    private audioBuffer: ArrayBuffer | null = null;
    private sound: Howl | null = null;
    private isPlaying = false;
    private isPaused = false;

    constructor(apiKey: string, region: string) {
        this.speechConfig = sdk.SpeechConfig.fromSubscription(apiKey, region);
        console.log("AzureSpeechService initialized.");
    }

    private async fetchAudioBuffer(text: string): Promise<ArrayBuffer> {
        console.log("Fetching audio buffer...");
        return new Promise((resolve, reject) => {
            const audioStream = sdk.AudioOutputStream.createPullStream();
            const audioConfig = sdk.AudioConfig.fromStreamOutput(audioStream);
            const synthesizer = new sdk.SpeechSynthesizer(this.speechConfig, audioConfig);

            synthesizer.speakTextAsync(
                text,
                result => {
                    if (result.reason === sdk.ResultReason.SynthesizingAudioCompleted) {
                        console.log("Audio synthesis completed.");
                        resolve(result.audioData);
                    } else {
                        console.error("Audio synthesis failed with reason:", result.reason);
                        reject("Failed to synthesize audio.");
                    }
                    synthesizer.close();
                },
                error => {
                    console.error("Error during audio synthesis:", error);
                    reject(error);
                    synthesizer.close();
                }
            );
        });
    }

    public async loadAudio(text: string, onEndCallback?: () => void): Promise<void> {
        console.log("Loading audio...");
        this.audioBuffer = await this.fetchAudioBuffer(text);
        this.initializeHowl(onEndCallback); // Passa a callback para ser chamada ao final
        console.log("Audio buffer loaded successfully.");
    }

    private initializeHowl(onEndCallback?: () => void) {
        if (this.audioBuffer) {
            const blob = new Blob([this.audioBuffer], { type: 'audio/wav' });
            const url = URL.createObjectURL(blob);

            this.sound = new Howl({
                src: [url],
                format: ['wav'],
                onplay: () => {
                    this.isPlaying = true;
                    this.isPaused = false;
                    console.log("Playback started.");
                },
                onend: () => {
                    console.log("Playback ended.");
                    this.isPlaying = false;
                    this.isPaused = false;
                    if (onEndCallback) {
                        onEndCallback(); // Chama a função de callback ao final do áudio
                    }
                },
                onpause: () => {
                    console.log("Playback paused.");
                    this.isPlaying = false;
                    this.isPaused = true;
                }
            });
        }
    }

    public async play(text: string, onEndCallback?: () => void): Promise<void> {
        console.log("Attempting to play...");
        
        // Limpa o áudio anterior se já houver uma instância de `Howl`
        if (this.sound) {
            this.sound.stop();
            this.sound = null;
            this.audioBuffer = null;
        }

        // Carrega o novo áudio e inicializa `Howl`
        await this.loadAudio(text, onEndCallback);
        
        // Verifica se `this.sound` foi inicializado e se não está tocando
        if (this.sound && !this.isPlaying) {
            (this.sound as Howl).play(); // Type assertion para garantir que `this.sound` é do tipo `Howl`
        } else {
            console.warn("Play called but sound is either not initialized or already playing.");
        }
    }

    public pause() {
        console.log("Attempting to pause...");
        if (this.sound && this.isPlaying) {
            (this.sound as Howl).pause(); // Type assertion para garantir que `this.sound` é do tipo `Howl`
        } else {
            console.warn("Pause called but either not playing or sound is not initialized.");
        }
    }

    public resume() {
        console.log("Attempting to resume...");
        if (this.sound && this.isPaused) {
            (this.sound as Howl).play(); // Type assertion para garantir que `this.sound` é do tipo `Howl`
        } else {
            console.warn("Resume called but either not paused or sound is not initialized.");
        }
    }

    public stop() {
        console.log("Stopping playback...");
        if (this.sound) {
            (this.sound as Howl).stop(); // Type assertion para garantir que `this.sound` é do tipo `Howl`
            this.isPlaying = false;
            this.isPaused = false;
        }
    }

    public getIsPlaying(): boolean {
        return this.isPlaying;
    }

    public getIsPaused(): boolean {
        return this.isPaused;
    }
}
