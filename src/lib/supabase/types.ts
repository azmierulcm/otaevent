export type AppRole = "customer" | "vendor" | "owner";
export type EventStatus = "draft" | "open" | "matched" | "completed" | "cancelled";
export type EventVisibility = "private" | "shared" | "public";
export type BidStatus = "pending" | "accepted" | "declined" | "withdrawn";
export type RSVPStatus = "yes" | "no" | "maybe";
export type AvailabilityStatus = "available" | "tentative" | "booked" | "blocked";
export type ArticleStatus = "draft" | "published" | "archived";

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

type TableRow<T> = T;
type Insertable<T, K extends keyof T = never> = Omit<T, K> & Partial<Pick<T, K>>;
type Updatable<T> = Partial<T>;

export type Database = {
  public: {
    Enums: {
      app_role: AppRole;
      event_status: EventStatus;
      event_visibility: EventVisibility;
      bid_status: BidStatus;
      rsvp_status: RSVPStatus;
      availability_status: AvailabilityStatus;
      article_status: ArticleStatus;
    };
    Tables: {
      users: {
        Row: TableRow<{
          id: string;
          email: string;
          full_name: string | null;
          avatar_url: string | null;
          role: AppRole;
          phone: string | null;
          created_at: string;
          updated_at: string;
        }>;
        Insert: Insertable<Database["public"]["Tables"]["users"]["Row"], "created_at" | "updated_at" | "role">;
        Update: Updatable<Database["public"]["Tables"]["users"]["Row"]>;
        Relationships: [];
      };
      vendor_profiles: {
        Row: TableRow<{
          id: string;
          user_id: string;
          business_name: string;
          tagline: string | null;
          bio: string | null;
          base_location: string | null;
          service_categories: string[];
          cover_image_path: string | null;
          gallery_image_paths: string[];
          price_floor: number | null;
          is_verified: boolean;
          created_at: string;
          updated_at: string;
        }>;
        Insert: Insertable<Database["public"]["Tables"]["vendor_profiles"]["Row"], "id" | "created_at" | "updated_at" | "is_verified" | "service_categories" | "gallery_image_paths">;
        Update: Updatable<Database["public"]["Tables"]["vendor_profiles"]["Row"]>;
        Relationships: [];
      };
      events: {
        Row: TableRow<{
          id: string;
          customer_id: string;
          name: string;
          budget: number;
          services: string[];
          event_date: string;
          details: string | null;
          capacity: number;
          location: string | null;
          status: EventStatus;
          visibility: EventVisibility;
          share_slug: string | null;
          created_at: string;
          updated_at: string;
        }>;
        Insert: Insertable<Database["public"]["Tables"]["events"]["Row"], "id" | "created_at" | "updated_at" | "status" | "visibility" | "share_slug" | "services">;
        Update: Updatable<Database["public"]["Tables"]["events"]["Row"]>;
        Relationships: [];
      };
      bids: {
        Row: TableRow<{
          id: string;
          event_id: string;
          vendor_id: string;
          amount: number;
          message: string | null;
          status: BidStatus;
          created_at: string;
          updated_at: string;
        }>;
        Insert: Insertable<Database["public"]["Tables"]["bids"]["Row"], "id" | "created_at" | "updated_at" | "status">;
        Update: Updatable<Database["public"]["Tables"]["bids"]["Row"]>;
        Relationships: [];
      };
      bid_messages: {
        Row: TableRow<{
          id: string;
          bid_id: string;
          sender_id: string;
          body: string;
          created_at: string;
        }>;
        Insert: Insertable<Database["public"]["Tables"]["bid_messages"]["Row"], "id" | "created_at">;
        Update: Updatable<Database["public"]["Tables"]["bid_messages"]["Row"]>;
        Relationships: [];
      };
      registry: {
        Row: TableRow<{
          id: string;
          event_id: string;
          title: string;
          note: string | null;
          created_at: string;
          updated_at: string;
        }>;
        Insert: Insertable<Database["public"]["Tables"]["registry"]["Row"], "id" | "created_at" | "updated_at" | "title">;
        Update: Updatable<Database["public"]["Tables"]["registry"]["Row"]>;
        Relationships: [];
      };
      registry_items: {
        Row: TableRow<{
          id: string;
          registry_id: string;
          title: string;
          description: string | null;
          image_path: string | null;
          target_quantity: number;
          claimed_quantity: number;
          claimed_by_name: string | null;
          claimed_by_email: string | null;
          external_url: string | null;
          created_at: string;
          updated_at: string;
        }>;
        Insert: Insertable<Database["public"]["Tables"]["registry_items"]["Row"], "id" | "created_at" | "updated_at" | "target_quantity" | "claimed_quantity">;
        Update: Updatable<Database["public"]["Tables"]["registry_items"]["Row"]>;
        Relationships: [];
      };
      rsvps: {
        Row: TableRow<{
          id: string;
          event_id: string;
          guest_name: string;
          guest_email: string;
          status: RSVPStatus;
          party_size: number;
          note: string | null;
          created_at: string;
          updated_at: string;
        }>;
        Insert: Insertable<Database["public"]["Tables"]["rsvps"]["Row"], "id" | "created_at" | "updated_at" | "status" | "party_size">;
        Update: Updatable<Database["public"]["Tables"]["rsvps"]["Row"]>;
        Relationships: [];
      };
      vendor_availability: {
        Row: TableRow<{
          id: string;
          vendor_id: string;
          available_on: string;
          starts_at: string | null;
          ends_at: string | null;
          status: AvailabilityStatus;
          note: string | null;
          created_at: string;
          updated_at: string;
        }>;
        Insert: Insertable<Database["public"]["Tables"]["vendor_availability"]["Row"], "id" | "created_at" | "updated_at" | "status">;
        Update: Updatable<Database["public"]["Tables"]["vendor_availability"]["Row"]>;
        Relationships: [];
      };
      articles: {
        Row: TableRow<{
          id: string;
          author_id: string | null;
          title: string;
          slug: string;
          excerpt: string | null;
          body_md: string;
          hero_image_path: string | null;
          status: ArticleStatus;
          published_at: string | null;
          created_at: string;
          updated_at: string;
        }>;
        Insert: Insertable<Database["public"]["Tables"]["articles"]["Row"], "id" | "created_at" | "updated_at" | "status" | "published_at">;
        Update: Updatable<Database["public"]["Tables"]["articles"]["Row"]>;
        Relationships: [];
      };
      ad_blocks: {
        Row: TableRow<{
          id: string;
          title: string;
          placement: string;
          image_path: string | null;
          destination_url: string | null;
          is_active: boolean;
          starts_at: string | null;
          ends_at: string | null;
          created_at: string;
          updated_at: string;
        }>;
        Insert: Insertable<Database["public"]["Tables"]["ad_blocks"]["Row"], "id" | "created_at" | "updated_at" | "is_active">;
        Update: Updatable<Database["public"]["Tables"]["ad_blocks"]["Row"]>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      current_app_role: {
        Args: Record<string, never>;
        Returns: AppRole | null;
      };
      is_owner: {
        Args: Record<string, never>;
        Returns: boolean;
      };
      is_vendor: {
        Args: Record<string, never>;
        Returns: boolean;
      };
    };
    CompositeTypes: Record<string, never>;
  };
};
