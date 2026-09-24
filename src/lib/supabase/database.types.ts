export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          auth_id: string | null;
          name: string;
          email: string;
          role: "student" | "admin";
          country: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          auth_id?: string | null;
          name: string;
          email: string;
          role?: "student" | "admin";
          country?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Insert"]>;
      };
      countries: {
        Row: { id: string; name: string; code: string; flag: string };
        Insert: { id: string; name: string; code: string; flag: string };
        Update: Partial<Database["public"]["Tables"]["countries"]["Insert"]>;
      };
      categories: {
        Row: {
          id: string;
          name: string;
          description: string;
          icon: string;
          color: string;
        };
        Insert: {
          id: string;
          name: string;
          description?: string;
          icon?: string;
          color?: string;
        };
        Update: Partial<Database["public"]["Tables"]["categories"]["Insert"]>;
      };
      universities: {
        Row: {
          id: string;
          name: string;
          country_id: string;
          description: string;
          tuition: string;
          ranking: number;
          programs: Json;
          deadline: string;
          published: boolean;
        };
        Insert: {
          id: string;
          name: string;
          country_id: string;
          description?: string;
          tuition?: string;
          ranking?: number;
          programs?: Json;
          deadline?: string;
          published?: boolean;
        };
        Update: Partial<Database["public"]["Tables"]["universities"]["Insert"]>;
      };
      university_categories: {
        Row: { university_id: string; category_id: string };
        Insert: { university_id: string; category_id: string };
        Update: Partial<Database["public"]["Tables"]["university_categories"]["Insert"]>;
      };
      applications: {
        Row: {
          id: string;
          student_id: string | null;
          university_id: string;
          status: string;
          steps: Json;
          personal_info: Json;
          academic_info: Json;
          documents: Json;
          notes: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          student_id?: string | null;
          university_id: string;
          status?: string;
          steps?: Json;
          personal_info?: Json;
          academic_info?: Json;
          documents?: Json;
          notes?: string;
        };
        Update: Partial<Database["public"]["Tables"]["applications"]["Insert"]>;
      };
      promotions: {
        Row: {
          id: string;
          title: string;
          description: string;
          discount: string;
          active: boolean;
          start_date: string;
          end_date: string;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string;
          discount?: string;
          active?: boolean;
          start_date: string;
          end_date: string;
        };
        Update: Partial<Database["public"]["Tables"]["promotions"]["Insert"]>;
      };
      email_campaigns: {
        Row: {
          id: string;
          subject: string;
          body: string;
          status: string;
          recipients: number;
          sent_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          subject: string;
          body?: string;
          status?: string;
          recipients?: number;
          sent_at?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["email_campaigns"]["Insert"]>;
      };
    };
  };
}
