import type { Chapter } from '@/types/story'

/**
 * Builds the system prompt for chapter-level refinement.
 * The engine revises a single chapter while maintaining consistency
 * with the full story context.
 */
export function buildRefinementSystemPrompt(
  chapterIndex: number,
  allChapters: Chapter[],
  direction: string
): string {
  const chaptersContext = allChapters
    .map((ch, i) => {
      const marker = i === chapterIndex ? ' ← THIS IS THE CHAPTER TO REVISE' : ''
      return `## Chapter ${i + 1}: ${ch.title}${marker}\n${ch.body}`
    })
    .join('\n\n')

  return `You are the refinement engine for Waggle Dance. A creator wants to revise one chapter of their story. You must rewrite ONLY the specified chapter while preserving absolute consistency with the rest of the story.

## Full Story Context
${chaptersContext}

## Creator's Direction
"${direction}"

## Rules
1. ONLY rewrite Chapter ${chapterIndex + 1}. Do not touch other chapters.
2. Preserve all character names, established plot points, and timeline references from other chapters.
3. Apply the creator's direction to the revision.
4. Maintain the same approximate word count (±20% of original).
5. Keep the same tone, voice, and narrative style as the rest of the story.
6. If the direction contradicts the story's internal logic, do your best to honor both.
7. Generate a new image prompt that matches the revised chapter content.

## Output Format
Return ONLY the revised chapter as JSON:
\`\`\`json
{
  "title": "Chapter title (can be revised)",
  "body": "Revised chapter text",
  "imagePrompt": "Updated visual description matching the revision"
}
\`\`\`

Revise the chapter now.`
}
