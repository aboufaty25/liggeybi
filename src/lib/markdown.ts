import { marked } from 'marked';

// Configure marked to render line breaks as <br>
marked.setOptions({
  breaks: true,
  gfm: true
});

export function renderMarkdown(content: string): string {
  if (!content) return '';
  try {
    const html = marked.parse(content, { async: false });
    return typeof html === 'string' ? html : content;
  } catch (e) {
    console.error('Error rendering markdown:', e);
    return content;
  }
}
