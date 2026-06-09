import type { Story } from '@/types/story'

/**
 * Generates a print-optimized HTML string for PDF export.
 * This HTML is designed to be rendered by a headless browser (Puppeteer)
 * or used as a print-optimized page.
 */
export function generatePdfHtml(story: Story): string {
  const chapters = story.storyContent
    .map(
      (chapter, i) => `
        <div class="chapter" ${i > 0 ? 'style="page-break-before: always;"' : ''}>
          <span class="chapter-number">Chapter ${i + 1}</span>
          <h2 class="chapter-title">${escapeHtml(chapter.title)}</h2>
          <div class="chapter-body">
            ${chapter.body
              .split('\n\n')
              .map((p) => `<p>${escapeHtml(p)}</p>`)
              .join('')}
          </div>
          ${
            story.visualsEnabled && chapter.imageUrl
              ? `<img src="${escapeHtml(chapter.imageUrl)}" class="chapter-image" alt="" />`
              : ''
          }
        </div>
      `
    )
    .join('')

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>${escapeHtml(story.title || 'Story')}</title>
  <style>
    @page {
      size: A4;
      margin: 25mm;
    }

    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: Georgia, 'Times New Roman', serif;
      font-size: 12pt;
      line-height: 1.8;
      color: #1a1a1a;
      background: #ffffff;
    }

    .cover {
      text-align: center;
      padding-top: 40%;
      page-break-after: always;
    }

    .cover h1 {
      font-size: 28pt;
      font-weight: normal;
      margin-bottom: 16pt;
      color: #1a1a1a;
    }

    .cover .topic {
      font-size: 11pt;
      color: #666;
      font-style: italic;
    }

    .chapter {
      padding-top: 24pt;
    }

    .chapter-number {
      display: block;
      font-size: 9pt;
      text-transform: uppercase;
      letter-spacing: 2pt;
      color: #999;
      margin-bottom: 8pt;
    }

    .chapter-title {
      font-size: 18pt;
      font-weight: normal;
      margin-bottom: 18pt;
      color: #1a1a1a;
    }

    .chapter-body p {
      margin-bottom: 12pt;
      text-align: justify;
      hyphens: auto;
    }

    .chapter-image {
      width: 100%;
      max-height: 250pt;
      object-fit: contain;
      margin-top: 18pt;
      border-radius: 4pt;
    }
  </style>
</head>
<body>
  <div class="cover">
    <h1>${escapeHtml(story.title || 'A Story')}</h1>
    <p class="topic">A story about ${escapeHtml(story.topic)}</p>
  </div>
  ${chapters}
</body>
</html>`
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}
