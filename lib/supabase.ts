import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Singleton pattern để tránh tạo nhiều instance
let supabaseInstance: ReturnType<typeof createClient> | null = null

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export const createSupabaseClient = () => {
  if (!supabaseInstance) {
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey)
  }
  return supabaseInstance
}

export type Database = {
  public: {
    Tables: {
      nguoi_dung: {
        Row: {
          id: string
          ho_ten: string
          email: string
          vai_tro: 'quan_tri' | 'phe_duyet' | 'nguoi_dung'
          ngay_tao: string
        }
        Insert: {
          id: string
          ho_ten: string
          email: string
          vai_tro?: 'quan_tri' | 'phe_duyet' | 'nguoi_dung'
          ngay_tao?: string
        }
        Update: {
          id?: string
          ho_ten?: string
          email?: string
          vai_tro?: 'quan_tri' | 'phe_duyet' | 'nguoi_dung'
          ngay_tao?: string
        }
      }
      loai_tai_lieu: {
        Row: {
          id: string
          ten_loai: string
          mo_ta: string | null
          tinh_trang: 'hieu_luc' | 'cho_duyet' | 'het_hieu_luc'
        }
        Insert: {
          id?: string
          ten_loai: string
          mo_ta?: string | null
          tinh_trang?: 'hieu_luc' | 'cho_duyet' | 'het_hieu_luc'
        }
        Update: {
          id?: string
          ten_loai?: string
          mo_ta?: string | null
          tinh_trang?: 'hieu_luc' | 'cho_duyet' | 'het_hieu_luc'
        }
      }
      tieu_chuan: {
        Row: {
          id: string
          ten_tieu_chuan: string
          mo_ta: string | null
          tinh_trang: 'hieu_luc' | 'cho_duyet' | 'het_hieu_luc'
        }
        Insert: {
          id?: string
          ten_tieu_chuan: string
          mo_ta?: string | null
          tinh_trang?: 'hieu_luc' | 'cho_duyet' | 'het_hieu_luc'
        }
        Update: {
          id?: string
          ten_tieu_chuan?: string
          mo_ta?: string | null
          tinh_trang?: 'hieu_luc' | 'cho_duyet' | 'het_hieu_luc'
        }
      }
      ho_so: {
        Row: {
          id: string
          ma_tai_lieu: string
          ten_tai_lieu: string
          phien_ban: string
          ngay_ban_hanh: string
          ngay_het_hieu_luc: string | null
          nguoi_ban_hanh_id: string
          loai_tai_lieu_id: string
          tinh_trang: 'hieu_luc' | 'cho_duyet' | 'het_hieu_luc'
          ghi_chu: string | null
          link_tai_lieu: string | null
          ngay_tao: string
        }
        Insert: {
          id?: string
          ma_tai_lieu: string
          ten_tai_lieu: string
          phien_ban: string
          ngay_ban_hanh: string
          ngay_het_hieu_luc?: string | null
          nguoi_ban_hanh_id: string
          loai_tai_lieu_id: string
          tinh_trang?: 'hieu_luc' | 'cho_duyet' | 'het_hieu_luc'
          ghi_chu?: string | null
          link_tai_lieu?: string | null
          ngay_tao?: string
        }
        Update: {
          id?: string
          ma_tai_lieu?: string
          ten_tai_lieu?: string
          phien_ban?: string
          ngay_ban_hanh?: string
          ngay_het_hieu_luc?: string | null
          nguoi_ban_hanh_id?: string
          loai_tai_lieu_id?: string
          tinh_trang?: 'hieu_luc' | 'cho_duyet' | 'het_hieu_luc'
          ghi_chu?: string | null
          link_tai_lieu?: string | null
          ngay_tao?: string
        }
      }
      tai_lieu_tieu_chuan: {
        Row: {
          id: string
          ho_so_id: string
          tieu_chuan_id: string
        }
        Insert: {
          id?: string
          ho_so_id: string
          tieu_chuan_id: string
        }
        Update: {
          id?: string
          ho_so_id?: string
          tieu_chuan_id?: string
        }
      }
      lich_su_ho_so: {
        Row: {
          id: string
          ho_so_id: string
          hanh_dong: 'tao_moi' | 'cap_nhat' | 'phe_duyet' | 'huy_bo'
          nguoi_thuc_hien_id: string
          ngay_thuc_hien: string
          ghi_chu: string | null
        }
        Insert: {
          id?: string
          ho_so_id: string
          hanh_dong: 'tao_moi' | 'cap_nhat' | 'phe_duyet' | 'huy_bo'
          nguoi_thuc_hien_id: string
          ngay_thuc_hien?: string
          ghi_chu?: string | null
        }
        Update: {
          id?: string
          ho_so_id?: string
          hanh_dong?: 'tao_moi' | 'cap_nhat' | 'phe_duyet' | 'huy_bo'
          nguoi_thuc_hien_id?: string
          ngay_thuc_hien?: string
          ghi_chu?: string | null
        }
      }
    }
  }
}