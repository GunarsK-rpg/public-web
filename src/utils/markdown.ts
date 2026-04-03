import { Marked } from 'marked';
import DOMPurify from 'dompurify';

const marked = new Marked({
  breaks: true,
  gfm: true,
});

export function renderMarkdown(text: string): string {
  const raw = marked.parse(text, { async: false });
  return DOMPurify.sanitize(raw, { USE_PROFILES: { html: true } });
}
