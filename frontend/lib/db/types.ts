/**
 * TypeScript interfaces matching the DormFix ER diagram.
 * Every table in the database has a corresponding interface here.
 */

// ─── users ───────────────────────────────────────────────────────────
export interface User {
  user_id: string;
  name: string;
  email: string;
  password_hash: string;
  role: UserRole;
  hostel_id: string | null;
  room_number?: string | null;
  tenure_since?: string | null;
}

export type UserRole = "student" | "warden" | "admin" | "maintenance";

/** Safe subset of User returned by public-facing endpoints. */
export type PublicUser = Omit<User, "password_hash">;

// ─── complaints ──────────────────────────────────────────────────────
export interface Complaint {
  complaint_id: string;
  filed_by_id: string;
  hostel_id: string;
  room_number: string;
  title: string;
  description: string;
  urgency_id: string;
  status: ComplaintStatus;
  is_escalated: boolean;
  created_at: string;          // ISO-8601 timestamp
  escalation_deadline: string; // ISO-8601 timestamp
  resolved_at: string | null;  // ISO-8601 timestamp or null
  assigned_dept_id: string | null;
}

export type ComplaintStatus =
  | "filed"
  | "in_progress"
  | "resolved"
  | "escalated"
  | "closed";

// ─── complaint_media ─────────────────────────────────────────────────
export interface ComplaintMedia {
  complaint_id: string;
  media_id: string;
  media_url: string;
  media_type: string;
  upload_stage: string;
  uploaded_by_name?: string;
}

// ─── complaint_history ───────────────────────────────────────────────
export interface ComplaintHistory {
  history_id: string;
  user_id: string;
  action: string;
  remarks: string;
  timestamp: string; // ISO-8601
  complaint_id: string;
}

// ─── hostels ─────────────────────────────────────────────────────────
export interface Hostel {
  hostel_id: string;
  hostel_name: string;
  location: string;
}

// ─── departments ─────────────────────────────────────────────────────
export interface Department {
  dept_id: string;
  dept_name: string;
}

// ─── urgency_levels ──────────────────────────────────────────────────
export interface UrgencyLevel {
  urgency_id: string;
  label: string;
  escalation_hours: number;
}
