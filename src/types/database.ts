export interface Database {
  public: {
    Tables: {
      stories: {
        Row: {
          id: string
          user_id: string
          title: string | null
          topic: string
          status: 'intake' | 'generating' | 'complete' | 'error'
          source_document_url: string | null
          source_document_type: 'pdf' | 'pptx' | 'docx' | null
          intake_transcript: Record<string, unknown>[]
          intake_signals: Record<string, unknown>
          framework_selected: string[] | null
          story_content: Record<string, unknown>[]
          previous_versions: Record<string, unknown>[]
          visual_style: 'watercolor' | 'manga' | 'flat' | 'ink_sketch'
          style_prompt: string | null
          visuals_enabled: boolean
          share_token: string
          share_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title?: string | null
          topic: string
          status?: 'intake' | 'generating' | 'complete' | 'error'
          source_document_url?: string | null
          source_document_type?: 'pdf' | 'pptx' | 'docx' | null
          intake_transcript?: Record<string, unknown>[]
          intake_signals?: Record<string, unknown>
          framework_selected?: string[] | null
          story_content?: Record<string, unknown>[]
          previous_versions?: Record<string, unknown>[]
          visual_style?: 'watercolor' | 'manga' | 'flat' | 'ink_sketch'
          style_prompt?: string | null
          visuals_enabled?: boolean
          share_token?: string
          share_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string | null
          topic?: string
          status?: 'intake' | 'generating' | 'complete' | 'error'
          source_document_url?: string | null
          source_document_type?: 'pdf' | 'pptx' | 'docx' | null
          intake_transcript?: Record<string, unknown>[]
          intake_signals?: Record<string, unknown>
          framework_selected?: string[] | null
          story_content?: Record<string, unknown>[]
          previous_versions?: Record<string, unknown>[]
          visual_style?: 'watercolor' | 'manga' | 'flat' | 'ink_sketch'
          style_prompt?: string | null
          visuals_enabled?: boolean
          share_token?: string
          share_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      user_profiles: {
        Row: {
          id: string
          user_id: string
          display_name: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          display_name?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          display_name?: string | null
          created_at?: string
        }
      }
    }
  }
}
