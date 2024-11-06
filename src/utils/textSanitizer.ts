// utils/textSanitizer.ts
export function sanitizeText(content: string): string {
    // Remove tags HTML
    content = content.replace(/<\/?[^>]+(>|$)/g, "");

    // Remove formatações Markdown para negrito, itálico, cabeçalhos, etc.
    content = content.replace(/(\*\*|__|\*|_|#|\`|\~{2}|\>|\-|\+|=|\[|\]\(.*?\))/g, "");

    // Remove itálico e sublinhado Markdown em volta de palavras ou frases (_texto_ ou *texto*)
    content = content.replace(/(_.*?_|\*.*?\*)/g, "");

    // Remove blocos de equação em Markdown ($$ ... $$)
    content = content.replace(/\$\$[^$]*\$\$/g, "");

    return content.trim();
}
