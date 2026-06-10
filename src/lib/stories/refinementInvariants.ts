import type { Chapter, StoryStatus } from '@/types/story'

/**
 * Refinement Invariants
 *
 * This module enforces correctness properties for the refinement flow:
 * (a) Only the targeted chapter changes during chapter refinement
 * (b) Full regeneration pushes current content to previous_versions before overwrite
 * (c) Refinement only applies to stories with status `complete`
 *
 * Validates: Requirements 5.1, 5.2, 5.5
 */

/**
 * (a) Applies a chapter refinement at the given index, returning the updated array.
 * Only the chapter at `targetIndex` is replaced; all others remain identical.
 */
export function applyChapterRefinement(
  chapters: Chapter[],
  targetIndex: number,
  revisedChapter: Chapter
): Chapter[] {
  if (targetIndex < 0 || targetIndex >= chapters.length) {
    throw new Error(
      `Invalid target index: ${targetIndex} (story has ${chapters.length} chapters)`
    )
  }

  return chapters.map((ch, i) => (i === targetIndex ? revisedChapter : ch))
}

/**
 * (a) Validates that only the targeted chapter differs between original and refined arrays.
 * Returns true if all chapters except `targetIndex` are identical.
 */
export function isOnlyTargetedChapterChanged(
  original: Chapter[],
  refined: Chapter[],
  targetIndex: number
): boolean {
  if (original.length !== refined.length) {
    return false
  }

  for (let i = 0; i < original.length; i++) {
    if (i === targetIndex) continue

    if (
      original[i].title !== refined[i].title ||
      original[i].body !== refined[i].body ||
      original[i].imagePrompt !== refined[i].imagePrompt ||
      original[i].imageUrl !== refined[i].imageUrl
    ) {
      return false
    }
  }

  return true
}

/**
 * (b) Applies a full regeneration: pushes current content to previous_versions,
 * then returns the new previous_versions array.
 */
export function pushToPreviousVersions(
  currentContent: Chapter[],
  previousVersions: Chapter[][]
): Chapter[][] {
  return [...previousVersions, currentContent]
}

/**
 * (b) Validates that a full regeneration correctly pushed current content before overwrite.
 * The updated previous_versions must contain the old content as its last entry,
 * and all prior entries must remain unchanged.
 */
export function isFullRegenerationValid(
  previousVersionsBefore: Chapter[][],
  previousVersionsAfter: Chapter[][],
  oldContent: Chapter[]
): boolean {
  // After should be exactly one entry longer
  if (previousVersionsAfter.length !== previousVersionsBefore.length + 1) {
    return false
  }

  // All existing entries must be preserved
  for (let i = 0; i < previousVersionsBefore.length; i++) {
    const before = previousVersionsBefore[i]
    const after = previousVersionsAfter[i]

    if (before.length !== after.length) {
      return false
    }

    for (let j = 0; j < before.length; j++) {
      if (
        before[j].title !== after[j].title ||
        before[j].body !== after[j].body ||
        before[j].imagePrompt !== after[j].imagePrompt
      ) {
        return false
      }
    }
  }

  // The last entry must be the old content
  const lastEntry = previousVersionsAfter[previousVersionsAfter.length - 1]
  if (lastEntry.length !== oldContent.length) {
    return false
  }

  for (let j = 0; j < oldContent.length; j++) {
    if (
      lastEntry[j].title !== oldContent[j].title ||
      lastEntry[j].body !== oldContent[j].body ||
      lastEntry[j].imagePrompt !== oldContent[j].imagePrompt
    ) {
      return false
    }
  }

  return true
}

/**
 * (c) Returns true if refinement is allowed for the given status.
 * Refinement only applies to stories with status `complete`.
 */
export function canRefine(status: StoryStatus): boolean {
  return status === 'complete'
}
