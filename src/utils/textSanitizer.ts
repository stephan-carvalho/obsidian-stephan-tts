import emojiRegex from 'emoji-regex';

export function sanitizeText(content: string): string {
    // Remove tags HTML
    content = content.replace(/<\/?[^>]+(>|$)/g, "");

    // Remove formatações Markdown para negrito, itálico, cabeçalhos, etc.
    content = content.replace(/(\*\*|__|\*|_|#|\`|\~{2}|\>|\-|\+|=|\[|\]\(.*?\))/g, "");

    // Remove itálico e sublinhado Markdown em volta de palavras ou frases (_texto_ ou *texto*)
    content = content.replace(/(_.*?_|\*.*?\*)/g, "");

    // Remove delimitadores de bloco de equação ($$), mas mantém o conteúdo da equação
    content = content.replace(/\$\$/g, "");

    // Remove emojis usando emoji-regex
    const regex = emojiRegex();
    content = content.replace(regex, "");

    return content.trim();
}