import { createClient } from '@/lib/supabase/server'
import { extractText } from '@/lib/documents/extract'

const MAX_FILE_SIZE = 20 * 1024 * 1024 // 20MB
const ALLOWED_TYPES = ['pdf', 'pptx', 'docx'] as const
type AllowedType = (typeof ALLOWED_TYPES)[number]

const MIME_MAP: Record<string, AllowedType> = {
  'application/pdf': 'pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'pptx',
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return Response.json({ error: 'Unauthorized', code: 'AUTH_REQUIRED' }, { status: 401 })
  }

  const formData = await request.formData()
  const file = formData.get('file') as File | null
  const storyId = formData.get('storyId') as string | null

  if (!file || !storyId) {
    return Response.json(
      { error: 'Missing file or storyId', code: 'VALIDATION_ERROR' },
      { status: 400 }
    )
  }

  // Validate file size
  if (file.size > MAX_FILE_SIZE) {
    return Response.json(
      { error: 'File exceeds 20MB limit', code: 'UPLOAD_FAILED' },
      { status: 413 }
    )
  }

  // Validate file type
  const fileType = MIME_MAP[file.type]
  if (!fileType) {
    return Response.json(
      {
        error: 'Unsupported file format. Accepted: PDF, DOCX, PPTX',
        code: 'UPLOAD_FAILED',
      },
      { status: 415 }
    )
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer())

    // Upload to Supabase Storage
    const filePath = `${user.id}/${storyId}/${file.name}`
    const { error: uploadError } = await supabase.storage
      .from('documents')
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: true,
      })

    if (uploadError) {
      return Response.json(
        { error: 'Failed to upload file', code: 'UPLOAD_FAILED' },
        { status: 500 }
      )
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('documents')
      .getPublicUrl(filePath)

    // Extract text
    let extractedText: string | null = null
    try {
      extractedText = await extractText(buffer, fileType)
    } catch {
      // Text extraction failed — continue without document context
      return Response.json({
        success: true,
        documentUrl: urlData.publicUrl,
        extractedText: null,
        inferredSignals: {},
        warning: 'Document uploaded but text extraction failed. Continuing without document context.',
      })
    }

    // Update story record with document info
    await supabase
      .from('stories')
      .update({
        source_document_url: urlData.publicUrl,
        source_document_type: fileType,
      })
      .eq('id', storyId)
      .eq('user_id', user.id)

    return Response.json({
      success: true,
      documentUrl: urlData.publicUrl,
      extractedText: extractedText?.slice(0, 10000) || null, // Limit for API response
      inferredSignals: {}, // Signal inference happens in the intake conversation
    })
  } catch (error) {
    return Response.json(
      {
        error: error instanceof Error ? error.message : 'Upload processing failed',
        code: 'UPLOAD_FAILED',
      },
      { status: 500 }
    )
  }
}
