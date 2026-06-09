import { PDFParse } from 'pdf-parse'
import * as mammoth from 'mammoth'

/**
 * Extract text content from uploaded documents.
 * Supports PDF, DOCX, and PPTX formats.
 */
export async function extractText(
  buffer: Buffer,
  fileType: 'pdf' | 'pptx' | 'docx'
): Promise<string> {
  switch (fileType) {
    case 'pdf':
      return extractPdf(buffer)
    case 'docx':
      return extractDocx(buffer)
    case 'pptx':
      return extractPptx(buffer)
    default:
      throw new Error(`Unsupported file type: ${fileType}`)
  }
}

async function extractPdf(buffer: Buffer): Promise<string> {
  const parser = new PDFParse({ data: new Uint8Array(buffer) })
  const result = await parser.getText()
  return result.text || ''
}

async function extractDocx(buffer: Buffer): Promise<string> {
  const result = await mammoth.extractRawText({ buffer })
  return result.value
}

async function extractPptx(buffer: Buffer): Promise<string> {
  // PPTX files are ZIP archives containing XML files
  // For v1, we use a simple extraction approach
  const JSZip = (await import('jszip')).default
  const zip = await JSZip.loadAsync(buffer)

  const slideTexts: string[] = []

  // PPTX slides are stored in ppt/slides/slide*.xml
  const slideFiles = Object.keys(zip.files)
    .filter((name) => name.match(/ppt\/slides\/slide\d+\.xml/))
    .sort()

  for (const slideFile of slideFiles) {
    const content = await zip.files[slideFile].async('text')
    // Extract text from XML tags (simple regex approach)
    const texts = content.match(/<a:t[^>]*>(.*?)<\/a:t>/g)
    if (texts) {
      const slideText = texts
        .map((t) => t.replace(/<[^>]+>/g, ''))
        .join(' ')
      slideTexts.push(slideText)
    }
  }

  return slideTexts.join('\n\n')
}
