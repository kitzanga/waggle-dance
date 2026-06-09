# Requirements Document

## Introduction

Waggle Dance is a web application that helps leaders communicate complex, unfamiliar, or resistance-prone ideas through original short-form stories told in the spirit of a children's parable. The application has two primary modes: a creator mode where users shape and generate stories through a conversational AI intake process, and a reader mode that delivers a paced, immersive visual reading experience. The storytelling engine draws from established narrative science frameworks (Campbell, Yamada, Heath, Aesop, Pixar, Cialdini, Kahneman) and selects/blends them invisibly based on intake signals. Stories are designed to move the reader emotionally first, then rationally — planting a seed rather than closing an argument.

## Glossary

- **Waggle_Dance**: The web application described in this document
- **Creator**: An authenticated user who initiates, shapes, and manages stories
- **Reader**: Any person consuming a story through the in-app reading experience or shared link
- **Intake_Engine**: The conversational AI system that conducts the intake interview with the Creator
- **Story_Engine**: The AI system that generates and refines stories based on intake signals
- **Intake_Signals**: Structured data extracted from the intake conversation including topic, tension, audience portrait, resistance pattern, stakes, and desired shift
- **Intake_Transcript**: The full conversational record of the intake interview
- **Framework_Selection**: The storytelling frameworks chosen by the Story_Engine based on Intake_Signals, invisible to the Creator
- **Chapter**: A discrete unit of a story; stories contain 3-5 chapters
- **Visual_Style**: The illustration aesthetic chosen by the Creator for a story (watercolor, manga, flat, ink sketch)
- **Image_Prompt**: A text description generated alongside each chapter for future image generation
- **Share_Token**: A unique identifier enabling public access to a story's reader view
- **Reader_View**: The paced, immersive reading interface presented to Readers via share link
- **PDF_Export**: A print-optimized designed artifact version of a story
- **Source_Document**: An optional uploaded file (PDF, PPTX, DOCX) that compresses the intake interview

## Requirements

### Requirement 1: Creator Authentication

**User Story:** As a creator, I want to sign in securely, so that I can own, manage, and reshare the stories I create.

#### Acceptance Criteria

1. THE Waggle_Dance SHALL require authentication before granting access to creator functionality including story creation, refinement, sharing management, and export
2. WHEN a Creator signs in successfully, THE Waggle_Dance SHALL associate all stories created in that session with the Creator's user profile
3. WHEN an unauthenticated user attempts to access creator functionality, THE Waggle_Dance SHALL redirect the user to the sign-in flow
4. THE Waggle_Dance SHALL persist Creator sessions across browser refreshes until explicit sign-out or session expiry of 7 days of inactivity
5. IF a Creator's authentication attempt fails, THEN THE Waggle_Dance SHALL display an error message indicating the reason for failure and allow the Creator to retry without losing any previously entered credentials
6. WHEN a Creator signs out, THE Waggle_Dance SHALL terminate the session, clear locally stored session data, and redirect the Creator to the public landing page

### Requirement 2: Conversational Intake Interview

**User Story:** As a creator, I want to describe my communication challenge through a natural conversation, so that the engine understands my intent without requiring me to fill out a form.

#### Acceptance Criteria

1. WHEN a Creator starts a new story, THE Intake_Engine SHALL initiate a conversational AI interview by presenting an open-ended question about the Creator's communication challenge within 2 seconds of session start
2. THE Intake_Engine SHALL gather the following Intake_Signals through conversation: topic, tension, audience portrait, resistance pattern, stakes, and desired shift, asking no more than 20 questions total across the interview
3. WHEN a Creator has provided at minimum a topic and desired shift, THE Intake_Engine SHALL present an option to proceed to story generation, regardless of whether the remaining signals (tension, audience portrait, resistance pattern, stakes) are complete
4. WHILE one or more Intake_Signals remain incomplete, THE Intake_Engine SHALL infer values for missing signals from the Creator's prior responses within the same session, present each inference to the Creator as an explicit statement, and wait for the Creator to confirm or correct before treating that signal as gathered
5. THE Intake_Engine SHALL select interview mode per question as follows: conversational mode (open-ended questions) for topic and tension signals, continuum mode (disambiguation between two poles) for resistance pattern and stakes signals, structured choice mode (presenting exactly 3 options) when the Creator's prior response is ambiguous or off-topic for 2 consecutive turns, and inference-and-confirm mode (presenting a guess for confirmation) for audience portrait and any signal where prior responses provide sufficient context
6. WHEN the Creator confirms or skips all remaining signals, or WHEN the Creator explicitly chooses to proceed to generation, THE Intake_Engine SHALL produce a structured set of Intake_Signals containing a value or "not provided" for each of the 6 signal types, and store the full Intake_Transcript including all questions, responses, and inferences
7. THE Intake_Engine SHALL, after each Creator response, reflect back or reframe the Creator's stated challenge before asking the next question, so that the Creator can see their own thinking articulated
8. IF a Creator abandons the interview (session inactive for more than 10 minutes or Creator explicitly exits), THEN THE Intake_Engine SHALL persist any signals gathered so far and the partial Intake_Transcript, allowing the Creator to resume from the last gathered signal on return
9. IF a Creator provides responses that contradict a previously confirmed signal, THEN THE Intake_Engine SHALL surface the contradiction to the Creator and ask which value to retain before proceeding

### Requirement 3: Document Upload During Intake

**User Story:** As a creator, I want to upload a document that contains context about my topic, so that the intake interview is shorter and more focused.

#### Acceptance Criteria

1. WHEN a Creator uploads a Source_Document during intake, THE Intake_Engine SHALL accept files in PDF, PPTX, and DOCX formats up to 20 MB in size
2. WHEN a Source_Document is successfully uploaded, THE Intake_Engine SHALL extract topic, tension, audience, resistance, stakes, and desired shift signals present in the document and use them to reduce the number of remaining intake questions
3. WHEN a Source_Document is uploaded, THE Intake_Engine SHALL skip intake questions whose corresponding Intake_Signals can be derived from the document content, focusing remaining questions on audience, resistance, and desired shift
4. WHEN a Source_Document is successfully processed, THE Waggle_Dance SHALL display an acknowledgment message to the Creator confirming receipt before continuing the interview
5. IF a Source_Document upload fails, the file format is not PDF, PPTX, or DOCX, or the file exceeds 20 MB, THEN THE Waggle_Dance SHALL display an error message indicating the specific reason for failure and allow the Creator to continue the interview without the document
6. IF text extraction from a Source_Document fails after upload, THEN THE Waggle_Dance SHALL notify the Creator that the document could not be processed and allow the Creator to continue the interview without document context
7. WHEN a Source_Document is successfully uploaded, THE Waggle_Dance SHALL store the Source_Document URL and file type alongside the story record

### Requirement 4: Story Generation

**User Story:** As a creator, I want the engine to generate an original short-form story based on my intake, so that I have a compelling narrative to communicate my idea.

#### Acceptance Criteria

1. WHEN the intake interview concludes, THE Story_Engine SHALL generate a story consisting of 3 to 5 chapters, where each chapter contains at least 150 words and the total word count is between 800 and 1200 words
2. THE Story_Engine SHALL select and blend at least 2 storytelling frameworks based on Intake_Signals and SHALL NOT include framework names, methodology labels, or attribution to any named framework in the generated story text
3. THE Story_Engine SHALL structure each story so that the first half of the narrative arc (by word count) establishes character desire, emotional stakes, or felt tension before the second half introduces explanation, resolution logic, or explicit insight
4. THE Story_Engine SHALL select a protagonist type (person, animal, object, concept) based on the Intake_Signals without input from the Creator
5. THE Story_Engine SHALL represent the Creator's topic through a metaphor drawn from an unrelated domain, and SHALL NOT name, define, or directly explain the topic within the story text
6. THE Story_Engine SHALL end each story with an open question, an unresolved possibility, or an invitation to reflect, rather than a conclusion that restates or summarizes the Creator's argument
7. WHEN generating each chapter, THE Story_Engine SHALL produce an Image_Prompt of 20 to 200 words describing a visual scene suitable as an illustration for that chapter
8. WHILE the Story_Engine is generating story content, THE Story_Engine SHALL stream tokens to the Creator with no more than 500 milliseconds delay between token generation and token delivery to the client
9. IF the Story_Engine fails to complete story generation after streaming has begun, THEN THE Story_Engine SHALL notify the Creator with an error indication and SHALL preserve any chapters already fully generated
10. IF the Intake_Signals are insufficient to determine a protagonist type or framework selection, THEN THE Story_Engine SHALL apply default selections and proceed with generation rather than blocking or requesting additional input

### Requirement 5: Story Refinement

**User Story:** As a creator, I want to refine individual chapters or regenerate the full story, so that the final narrative matches my vision.

#### Acceptance Criteria

1. WHEN a Creator requests a chapter-level refinement with natural language direction, THE Story_Engine SHALL revise only the specified chapter while preserving character names, established plot points, and timeline references present in the other chapters
2. WHEN a Creator requests a full story regeneration, THE Story_Engine SHALL generate a new story using the same Intake_Signals and preserve the previous story version so the Creator can revert to it
3. WHILE refining a chapter, THE Story_Engine SHALL accept natural language direction of up to 500 characters from the Creator and apply the direction to the revised chapter output
4. IF the Story_Engine cannot apply a refinement direction to the specified chapter, THEN THE Story_Engine SHALL inform the Creator that the refinement could not be applied and retain the chapter in its pre-refinement state
5. WHEN revising any single chapter, THE Story_Engine SHALL reference all other chapters in the current story to ensure revised character arcs, plot references, and chronological events remain consistent across the full narrative
6. WHEN a chapter refinement is complete, THE Story_Engine SHALL present the revised chapter to the Creator and allow the Creator to request additional refinements or accept the result

### Requirement 6: Visual Style Selection

**User Story:** As a creator, I want to choose a visual style for my story, so that illustrations match the tone I envision.

#### Acceptance Criteria

1. THE Waggle_Dance SHALL present the Creator with exactly four Visual_Style options: watercolor, manga, flat, and ink sketch
2. IF a Creator has not selected a Visual_Style when story generation begins, THEN THE Waggle_Dance SHALL apply watercolor as the default Visual_Style
3. WHEN a Visual_Style is selected, THE Waggle_Dance SHALL incorporate that style into every Image_Prompt generated for the story to maintain visual consistency across all chapters
4. WHEN a Creator requests story regeneration or chapter refinement, THE Waggle_Dance SHALL preserve the selected Visual_Style and apply it to any newly generated Image_Prompts
5. THE Waggle_Dance SHALL allow the Creator to enable or disable visuals for a story at any time before or after sharing, and the Reader_View SHALL reflect the current visibility setting
6. WHEN the Story_Engine generates a chapter, THE Waggle_Dance SHALL produce an Image_Prompt for that chapter regardless of whether visuals are currently enabled
7. IF a Creator wishes to change the Visual_Style after generation, THEN THE Waggle_Dance SHALL allow the change and regenerate all Image_Prompts for existing chapters using the newly selected style

### Requirement 7: In-App Reading Experience

**User Story:** As a reader, I want to experience the story in a paced, immersive environment, so that I am emotionally moved by the narrative.

#### Acceptance Criteria

1. THE Waggle_Dance SHALL present each story as a sequence of 3 to 5 chapters, revealing one chapter at a time rather than displaying the full story at once
2. THE Waggle_Dance SHALL use Framer Motion animations for chapter transitions, with each transition animation lasting between 600 milliseconds and 1200 milliseconds
3. WHEN the reader reaches the end of a chapter, THE Waggle_Dance SHALL provide a visible prompt or interaction to advance to the next chapter
4. THE Waggle_Dance SHALL render the reading experience with a dark background, warm color palette, and serif or editorial typeface, consistent across all chapters
5. THE Waggle_Dance SHALL deliver a mobile-first reading layout optimized for viewports 320px and wider, scaling to a maximum content width of 720px on desktop viewports
6. THE Waggle_Dance SHALL present story content totaling 800 to 1200 words across all chapters, targeting approximately 5 minutes of total reading time including transitions
7. IF a chapter contains an associated visual, THEN THE Waggle_Dance SHALL reveal the visual within the chapter body during the reading flow rather than displaying it before the chapter text loads

### Requirement 8: Story Sharing via Link

**User Story:** As a creator, I want to share my story via a link, so that readers can experience it without needing an account.

#### Acceptance Criteria

1. WHEN a Creator shares a story, THE Waggle_Dance SHALL generate a unique Share_Token in UUID format and produce a shareable URL containing that token
2. WHEN a Reader opens a valid share link for a story with sharing active, THE Waggle_Dance SHALL server-side render and display the Reader_View without requiring authentication
3. THE Reader_View SHALL present the story in the full paced reading experience (as defined in Requirement 7) without any creator controls visible
4. WHEN a Creator deactivates sharing for a story, THE Waggle_Dance SHALL display a non-specific unavailable message to any Reader accessing the deactivated share link, without revealing whether the story exists
5. IF a Reader accesses a share link with an invalid or non-existent Share_Token, THEN THE Waggle_Dance SHALL display a non-specific unavailable message without revealing whether the story exists
6. THE Reader_View SHALL include Open Graph metadata (title, description, and preview image when visuals are enabled) so that social platforms and messaging apps render a rich link preview
7. THE Reader_View SHALL render with the same dark, warm, editorial aesthetic and typographic hierarchy defined in Requirement 7, with no navigation chrome, account prompts, or application branding beyond the story content

### Requirement 9: PDF Export

**User Story:** As a creator, I want to export my story as a PDF, so that I can distribute it as a printable designed artifact.

#### Acceptance Criteria

1. WHEN a Creator requests a PDF export, THE Waggle_Dance SHALL generate a print-optimized PDF using A4 page dimensions with margins of at least 20mm on all sides
2. THE PDF_Export SHALL preserve chapter structure with each chapter beginning on a new page, maintain a serif or editorial typeface consistent with the in-app reading experience, and include the story title on the first page
3. THE PDF_Export SHALL use a light background with dark text optimized for print readability, independent of the dark in-app aesthetic
4. WHEN visuals are enabled and image files are available for a story, THE PDF_Export SHALL include one image per chapter positioned above or below the chapter text
5. WHEN visuals are disabled for a story, THE PDF_Export SHALL omit image placeholders and present text-only layout with no blank image regions
6. IF PDF generation fails, THEN THE Waggle_Dance SHALL notify the Creator with an error message and allow retry

### Requirement 10: Story Management

**User Story:** As a creator, I want to view, manage, and access my stories, so that I can revisit, reshare, or continue refining them.

#### Acceptance Criteria

1. THE Waggle_Dance SHALL display a list of all stories owned by the authenticated Creator, sorted by last updated date in descending order
2. WHEN a Creator selects a story from the list, THE Waggle_Dance SHALL display the full story content and provide access to refinement, sharing, and export actions
3. THE Waggle_Dance SHALL display the creation date and last updated date for each story in the list view
4. THE Waggle_Dance SHALL allow a Creator to activate or deactivate share links for any owned story
5. WHEN a Creator has no stories, THE Waggle_Dance SHALL display an empty state with a prompt to create their first story
6. THE Waggle_Dance SHALL allow a Creator to delete a story, with a confirmation step before permanent removal

### Requirement 11: Intake to Generation Transition

**User Story:** As a creator, I want a clear moment between finishing my intake and seeing my story, so that I feel the shift from preparation to creation.

#### Acceptance Criteria

1. WHEN the intake interview concludes, THE Waggle_Dance SHALL present a visually distinct transition state within 2 seconds that is differentiated from both the intake conversation UI and the story output UI, and SHALL maintain this transition state for at least 2 seconds before story streaming begins
2. WHILE the story is being generated, THE Waggle_Dance SHALL display an indication that the story is being crafted, visible to the Creator throughout the entire generation phase until streaming completes
3. WHEN story generation begins, THE Waggle_Dance SHALL stream story content to the Creator incrementally, with no visible pause between content increments exceeding 3 seconds, over a total duration of 20 to 40 seconds
4. IF story generation fails or no content is received within 60 seconds of the transition starting, THEN THE Waggle_Dance SHALL inform the Creator that generation was unsuccessful and provide an option to retry

### Requirement 12: Responsive and Accessible Design

**User Story:** As a user on any device, I want the application to be fully functional and visually refined, so that I can create or read stories regardless of my device or abilities.

#### Acceptance Criteria

1. THE Waggle_Dance SHALL render all creator and reader interfaces as responsive layouts that adapt across three breakpoints: mobile (320px to 767px), tablet (768px to 1023px), and desktop (1024px and above), with no horizontal scrolling required at any supported width
2. THE Waggle_Dance SHALL maintain consistent color palette, typography scale, and layout density across all viewport sizes such that the visual presentation passes WCAG 2.1 Level AA contrast requirements at every breakpoint
3. THE Waggle_Dance SHALL meet WCAG 2.1 Level AA contrast requirements for all text content, providing a minimum contrast ratio of 4.5:1 for normal text (below 18pt) and 3:1 for large text (18pt and above)
4. THE Waggle_Dance SHALL support keyboard navigation for all interactive elements in both the creator and reader flows, ensuring each interactive element is reachable via Tab in logical reading order, activatable via Enter or Space, and displays a visible focus indicator when focused
5. THE Waggle_Dance SHALL provide ARIA labels on all interactive elements that lack visible text labels, use semantic HTML elements for document structure (headings, landmarks, lists), and ensure all form inputs have programmatically associated labels
6. WHILE the viewport width is 767px or below, THE Waggle_Dance SHALL render all touch targets for interactive elements at a minimum size of 44×44 CSS pixels
