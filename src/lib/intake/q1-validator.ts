/**
 * Client-side Q1 validation.
 * Rejects gibberish and bare topics before sending to the AI.
 * This is a safety net — the AI prompt also validates, but cannot be fully trusted.
 */

/**
 * Checks if a Q1 answer is too thin to be a usable idea.
 * Returns a rejection message if invalid, or null if acceptable.
 */
export function validateQ1(input: string): string | null {
  const trimmed = input.trim()

  // Too short to be an idea (less than 4 words)
  const wordCount = trimmed.split(/\s+/).length
  if (wordCount < 4) {
    // Check if it's gibberish (no vowels or all consonants)
    if (isGibberish(trimmed)) {
      return "I don't understand that yet. Try writing the idea as a sentence."
    }
    // It's a bare topic or fragment
    return "That's a topic. What's the point you want people to understand about it?"
  }

  // Even with 4+ words, check for gibberish
  if (isGibberish(trimmed)) {
    return "I don't understand that yet. Try writing the idea as a sentence."
  }

  // Passed basic validation — let the AI make the final judgment
  return null
}

/**
 * Heuristic: text is likely gibberish if it has very low vowel ratio
 * or contains no recognizable word patterns.
 */
function isGibberish(text: string): boolean {
  const lower = text.toLowerCase()

  // Check vowel ratio — English text typically has 35-45% vowels
  const vowels = lower.replace(/[^aeiou]/g, '').length
  const letters = lower.replace(/[^a-z]/g, '').length

  if (letters === 0) return true
  if (letters < 3) return true

  const vowelRatio = vowels / letters
  // Very low vowel ratio suggests random characters
  if (vowelRatio < 0.15) return true

  // Check for repeated consonant clusters (e.g., "fjalsdfjadsl")
  const consonantClusters = lower.match(/[^aeiou\s]{4,}/g)
  if (consonantClusters && consonantClusters.length > 0) {
    const clusterLength = consonantClusters.reduce((sum, c) => sum + c.length, 0)
    if (clusterLength / letters > 0.5) return true
  }

  return false
}
