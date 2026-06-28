export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      applications: {
        Row: {
          applied_at: string | null
          candidate_id: string
          id: string
          job_id: string
          status: string
        }
        Insert: {
          applied_at?: string | null
          candidate_id: string
          id?: string
          job_id: string
          status: string
        }
        Update: {
          applied_at?: string | null
          candidate_id?: string
          id?: string
          job_id?: string
          status?: string
        }
        Relationships: []
      }
      applied_jobs: {
        Row: {
          application_date: string | null
          cover_letter: string | null
          created_at: string | null
          id: number
          job_id: string
          notes: string | null
          resume_url: string | null
          status: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          application_date?: string | null
          cover_letter?: string | null
          created_at?: string | null
          id: number
          job_id: string
          notes?: string | null
          resume_url?: string | null
          status?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          application_date?: string | null
          cover_letter?: string | null
          created_at?: string | null
          id?: number
          job_id?: string
          notes?: string | null
          resume_url?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      candidate_education: {
        Row: {
          created_at: string | null
          degree: string
          description: string | null
          end_date: string | null
          field_of_study: string | null
          grade: string | null
          id: number
          institution: string
          is_current: boolean | null
          start_date: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          degree: string
          description?: string | null
          end_date?: string | null
          field_of_study?: string | null
          grade?: string | null
          id: number
          institution: string
          is_current?: boolean | null
          start_date: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          degree?: string
          description?: string | null
          end_date?: string | null
          field_of_study?: string | null
          grade?: string | null
          id?: number
          institution?: string
          is_current?: boolean | null
          start_date?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      candidate_experience: {
        Row: {
          created_at: string | null
          department: string | null
          description: string | null
          designation: string
          end_date: string | null
          id: number
          is_current: boolean | null
          organisation: string
          start_date: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          department?: string | null
          description?: string | null
          designation: string
          end_date?: string | null
          id: number
          is_current?: boolean | null
          organisation: string
          start_date: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          department?: string | null
          description?: string | null
          designation?: string
          end_date?: string | null
          id?: number
          is_current?: boolean | null
          organisation?: string
          start_date?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      candidate_profiles: {
        Row: {
          availability: string | null
          biography: string | null
          created_at: string | null
          cv_filename: string | null
          cv_url: string | null
          date_of_birth: string | null
          education_level: string | null
          experience_level: string | null
          gender: string | null
          id: number
          languages: string | null
          marital_status: string | null
          personal_website: string | null
          profession: string | null
          professional_title: string | null
          profile_picture_url: string | null
          skills: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          availability?: string | null
          biography?: string | null
          created_at?: string | null
          cv_filename?: string | null
          cv_url?: string | null
          date_of_birth?: string | null
          education_level?: string | null
          experience_level?: string | null
          gender?: string | null
          id: number
          languages?: string | null
          marital_status?: string | null
          personal_website?: string | null
          profession?: string | null
          professional_title?: string | null
          profile_picture_url?: string | null
          skills?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          availability?: string | null
          biography?: string | null
          created_at?: string | null
          cv_filename?: string | null
          cv_url?: string | null
          date_of_birth?: string | null
          education_level?: string | null
          experience_level?: string | null
          gender?: string | null
          id?: number
          languages?: string | null
          marital_status?: string | null
          personal_website?: string | null
          profession?: string | null
          professional_title?: string | null
          profile_picture_url?: string | null
          skills?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      candidate_profiles_setup: {
        Row: {
          created_at: string
          data: Json
          profile_completed: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          data?: Json
          profile_completed?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          data?: Json
          profile_completed?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      candidate_social_media: {
        Row: {
          created_at: string
          id: string
          platform: string
          updated_at: string
          url: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          platform: string
          updated_at?: string
          url: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          platform?: string
          updated_at?: string
          url?: string
          user_id?: string
        }
        Relationships: []
      }
      employer_profiles: {
        Row: {
          created_at: string
          data: Json
          profile_completed: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          data?: Json
          profile_completed?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          data?: Json
          profile_completed?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      employers: {
        Row: {
          about: string | null
          company_size: string | null
          email: string | null
          founded: string | null
          id: number
          location: string | null
          logo: string | null
          name: string
          open_positions: number | null
          phone: string | null
          social_facebook: string | null
          social_instagram: string | null
          social_linkedin: string | null
          social_twitter: string | null
          tags: string | null
          website: string | null
        }
        Insert: {
          about?: string | null
          company_size?: string | null
          email?: string | null
          founded?: string | null
          id: number
          location?: string | null
          logo?: string | null
          name: string
          open_positions?: number | null
          phone?: string | null
          social_facebook?: string | null
          social_instagram?: string | null
          social_linkedin?: string | null
          social_twitter?: string | null
          tags?: string | null
          website?: string | null
        }
        Update: {
          about?: string | null
          company_size?: string | null
          email?: string | null
          founded?: string | null
          id?: number
          location?: string | null
          logo?: string | null
          name?: string
          open_positions?: number | null
          phone?: string | null
          social_facebook?: string | null
          social_instagram?: string | null
          social_linkedin?: string | null
          social_twitter?: string | null
          tags?: string | null
          website?: string | null
        }
        Relationships: []
      }
      events: {
        Row: {
          created_at: string
          description: string | null
          email: string | null
          end_date: string | null
          end_time: string | null
          id: string
          link: string | null
          location: string | null
          mode: string | null
          organizer: string
          owner_id: string | null
          poster_url: string | null
          start_date: string | null
          start_time: string | null
          tags: string | null
          title: string
          type: string
          updated_at: string
          user_role: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          email?: string | null
          end_date?: string | null
          end_time?: string | null
          id?: string
          link?: string | null
          location?: string | null
          mode?: string | null
          organizer: string
          owner_id?: string | null
          poster_url?: string | null
          start_date?: string | null
          start_time?: string | null
          tags?: string | null
          title: string
          type: string
          updated_at?: string
          user_role?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          email?: string | null
          end_date?: string | null
          end_time?: string | null
          id?: string
          link?: string | null
          location?: string | null
          mode?: string | null
          organizer?: string
          owner_id?: string | null
          poster_url?: string | null
          start_date?: string | null
          start_time?: string | null
          tags?: string | null
          title?: string
          type?: string
          updated_at?: string
          user_role?: string | null
        }
        Relationships: []
      }
      expired_jobs: {
        Row: {
          applylink: string | null
          city: string | null
          country: string | null
          created_at: string | null
          date_posted: string | null
          description: string | null
          employer_id: string | null
          employment_type: string | null
          experience_min: number | null
          featured: boolean | null
          how_to_apply: string | null
          id: string | null
          is_active: boolean | null
          location_id: string | null
          organization: string | null
          organization_type: string | null
          pin_code: string | null
          qualifications: string | null
          role_category: string | null
          salary_currency: string | null
          salary_unit_text: string | null
          salary_value: number | null
          slug: string | null
          state: string | null
          street_address: string | null
          title: string | null
          updated_at: string | null
          user_id: string | null
          valid_through: string | null
        }
        Insert: {
          applylink?: string | null
          city?: string | null
          country?: string | null
          created_at?: string | null
          date_posted?: string | null
          description?: string | null
          employer_id?: string | null
          employment_type?: string | null
          experience_min?: number | null
          featured?: boolean | null
          how_to_apply?: string | null
          id?: string | null
          is_active?: boolean | null
          location_id?: string | null
          organization?: string | null
          organization_type?: string | null
          pin_code?: string | null
          qualifications?: string | null
          role_category?: string | null
          salary_currency?: string | null
          salary_unit_text?: string | null
          salary_value?: number | null
          slug?: string | null
          state?: string | null
          street_address?: string | null
          title?: string | null
          updated_at?: string | null
          user_id?: string | null
          valid_through?: string | null
        }
        Update: {
          applylink?: string | null
          city?: string | null
          country?: string | null
          created_at?: string | null
          date_posted?: string | null
          description?: string | null
          employer_id?: string | null
          employment_type?: string | null
          experience_min?: number | null
          featured?: boolean | null
          how_to_apply?: string | null
          id?: string | null
          is_active?: boolean | null
          location_id?: string | null
          organization?: string | null
          organization_type?: string | null
          pin_code?: string | null
          qualifications?: string | null
          role_category?: string | null
          salary_currency?: string | null
          salary_unit_text?: string | null
          salary_value?: number | null
          slug?: string | null
          state?: string | null
          street_address?: string | null
          title?: string | null
          updated_at?: string | null
          user_id?: string | null
          valid_through?: string | null
        }
        Relationships: []
      }
      fellowships: {
        Row: {
          application_process: string
          city: string | null
          contact_email: string | null
          contact_name: string | null
          country: string | null
          created_at: string | null
          currency: string | null
          deadline: string | null
          description: string
          duration: string
          eligibility: string
          employer_id: string | null
          featured: boolean | null
          fellowship_type: string
          field: string
          id: number
          org_about: string | null
          org_name: string
          org_website: string | null
          phone: string | null
          remote: boolean | null
          slug: string | null
          start_date: string | null
          state: string | null
          status: string | null
          stipend: number | null
          stipend_unit: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          application_process: string
          city?: string | null
          contact_email?: string | null
          contact_name?: string | null
          country?: string | null
          created_at?: string | null
          currency?: string | null
          deadline?: string | null
          description: string
          duration: string
          eligibility: string
          employer_id?: string | null
          featured?: boolean | null
          fellowship_type: string
          field: string
          id: number
          org_about?: string | null
          org_name: string
          org_website?: string | null
          phone?: string | null
          remote?: boolean | null
          slug?: string | null
          start_date?: string | null
          state?: string | null
          status?: string | null
          stipend?: number | null
          stipend_unit?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          application_process?: string
          city?: string | null
          contact_email?: string | null
          contact_name?: string | null
          country?: string | null
          created_at?: string | null
          currency?: string | null
          deadline?: string | null
          description?: string
          duration?: string
          eligibility?: string
          employer_id?: string | null
          featured?: boolean | null
          fellowship_type?: string
          field?: string
          id?: number
          org_about?: string | null
          org_name?: string
          org_website?: string | null
          phone?: string | null
          remote?: boolean | null
          slug?: string | null
          start_date?: string | null
          state?: string | null
          status?: string | null
          stipend?: number | null
          stipend_unit?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      following_employers: {
        Row: {
          created_at: string | null
          employer_id: number
          followed_at: string | null
          id: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          employer_id: number
          followed_at?: string | null
          id: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          employer_id?: number
          followed_at?: string | null
          id?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      grants: {
        Row: {
          amount: string | null
          created_at: string
          deadline: string | null
          description: string | null
          eligible: string | null
          employer_id: string | null
          featured: boolean | null
          id: string
          link: string | null
          organization: string
          rfp_url: string | null
          sector: string | null
          status: string | null
          tags: string | null
          title: string
          type: string
          updated_at: string
        }
        Insert: {
          amount?: string | null
          created_at?: string
          deadline?: string | null
          description?: string | null
          eligible?: string | null
          employer_id?: string | null
          featured?: boolean | null
          id?: string
          link?: string | null
          organization: string
          rfp_url?: string | null
          sector?: string | null
          status?: string | null
          tags?: string | null
          title: string
          type: string
          updated_at?: string
        }
        Update: {
          amount?: string | null
          created_at?: string
          deadline?: string | null
          description?: string | null
          eligible?: string | null
          employer_id?: string | null
          featured?: boolean | null
          id?: string
          link?: string | null
          organization?: string
          rfp_url?: string | null
          sector?: string | null
          status?: string | null
          tags?: string | null
          title?: string
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      internships: {
        Row: {
          application_process: string
          apply_link: string | null
          city: string | null
          contact_email: string | null
          contact_name: string | null
          country: string | null
          created_at: string | null
          currency: string | null
          deadline: string | null
          description: string
          duration: string
          eligibility: string
          employer_id: string | null
          featured: boolean | null
          field: string
          id: number
          internship_type: string
          org_about: string | null
          org_name: string
          org_website: string | null
          phone: string | null
          remote: boolean | null
          slug: string | null
          start_date: string | null
          state: string | null
          status: string | null
          stipend: number | null
          stipend_unit: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          application_process: string
          apply_link?: string | null
          city?: string | null
          contact_email?: string | null
          contact_name?: string | null
          country?: string | null
          created_at?: string | null
          currency?: string | null
          deadline?: string | null
          description: string
          duration: string
          eligibility: string
          employer_id?: string | null
          featured?: boolean | null
          field: string
          id: number
          internship_type: string
          org_about?: string | null
          org_name: string
          org_website?: string | null
          phone?: string | null
          remote?: boolean | null
          slug?: string | null
          start_date?: string | null
          state?: string | null
          status?: string | null
          stipend?: number | null
          stipend_unit?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          application_process?: string
          apply_link?: string | null
          city?: string | null
          contact_email?: string | null
          contact_name?: string | null
          country?: string | null
          created_at?: string | null
          currency?: string | null
          deadline?: string | null
          description?: string
          duration?: string
          eligibility?: string
          employer_id?: string | null
          featured?: boolean | null
          field?: string
          id?: number
          internship_type?: string
          org_about?: string | null
          org_name?: string
          org_website?: string | null
          phone?: string | null
          remote?: boolean | null
          slug?: string | null
          start_date?: string | null
          state?: string | null
          status?: string | null
          stipend?: number | null
          stipend_unit?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      job_alerts: {
        Row: {
          created_at: string | null
          experience_level: string | null
          frequency: string | null
          id: number
          is_active: boolean | null
          job_type: string | null
          keywords: string | null
          location: string | null
          salary_max: number | null
          salary_min: number | null
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          experience_level?: string | null
          frequency?: string | null
          id: number
          is_active?: boolean | null
          job_type?: string | null
          keywords?: string | null
          location?: string | null
          salary_max?: number | null
          salary_min?: number | null
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          experience_level?: string | null
          frequency?: string | null
          id?: number
          is_active?: boolean | null
          job_type?: string | null
          keywords?: string | null
          location?: string | null
          salary_max?: number | null
          salary_min?: number | null
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      jobs: {
        Row: {
          applylink: string | null
          city: string | null
          country: string | null
          created_at: string
          date_posted: string
          description: string
          education_required: string | null
          employer_id: string | null
          employment_type: string
          experience_min: number | null
          featured: boolean | null
          how_to_apply: string | null
          id: string
          is_active: boolean
          location_id: string | null
          organization: string | null
          organization_logo: string | null
          organization_type: string | null
          pin_code: string | null
          qualifications: string
          role_category: string
          salary_currency: string
          salary_unit_text: string
          salary_value: number | null
          slug: string
          state: string | null
          street_address: string | null
          title: string
          updated_at: string
          user_id: string | null
          valid_through: string
        }
        Insert: {
          applylink?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          date_posted: string
          description: string
          education_required?: string | null
          employer_id?: string | null
          employment_type: string
          experience_min?: number | null
          featured?: boolean | null
          how_to_apply?: string | null
          id?: string
          is_active?: boolean
          location_id?: string | null
          organization?: string | null
          organization_logo?: string | null
          organization_type?: string | null
          pin_code?: string | null
          qualifications: string
          role_category: string
          salary_currency: string
          salary_unit_text: string
          salary_value?: number | null
          slug: string
          state?: string | null
          street_address?: string | null
          title: string
          updated_at?: string
          user_id?: string | null
          valid_through: string
        }
        Update: {
          applylink?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          date_posted?: string
          description?: string
          education_required?: string | null
          employer_id?: string | null
          employment_type?: string
          experience_min?: number | null
          featured?: boolean | null
          how_to_apply?: string | null
          id?: string
          is_active?: boolean
          location_id?: string | null
          organization?: string | null
          organization_logo?: string | null
          organization_type?: string | null
          pin_code?: string | null
          qualifications?: string
          role_category?: string
          salary_currency?: string
          salary_unit_text?: string
          salary_value?: number | null
          slug?: string
          state?: string | null
          street_address?: string | null
          title?: string
          updated_at?: string
          user_id?: string | null
          valid_through?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string | null
          details: string | null
          entity_id: string | null
          entity_title: string | null
          id: string
          read: boolean | null
          type: string | null
          user_id: string | null
          user_role: string | null
        }
        Insert: {
          created_at?: string | null
          details?: string | null
          entity_id?: string | null
          entity_title?: string | null
          id?: string
          read?: boolean | null
          type?: string | null
          user_id?: string | null
          user_role?: string | null
        }
        Update: {
          created_at?: string | null
          details?: string | null
          entity_id?: string | null
          entity_title?: string | null
          id?: string
          read?: boolean | null
          type?: string | null
          user_id?: string | null
          user_role?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          display_name: string | null
          email: string
          first_name: string | null
          id: string
          is_active: boolean | null
          last_name: string | null
          location: string | null
          phone: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string | null
          email: string
          first_name?: string | null
          id: string
          is_active?: boolean | null
          last_name?: string | null
          location?: string | null
          phone?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string | null
          email?: string
          first_name?: string | null
          id?: string
          is_active?: boolean | null
          last_name?: string | null
          location?: string | null
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      saved_jobs: {
        Row: {
          created_at: string | null
          id: number
          job_id: string
          notes: string | null
          saved_date: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id: number
          job_id: string
          notes?: string | null
          saved_date?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: number
          job_id?: string
          notes?: string | null
          saved_date?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: { Args: { _role: string; _user_id: string }; Returns: boolean }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
