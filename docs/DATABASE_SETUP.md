# Hướng dẫn Setup Database

## Bước 1: Truy cập Supabase Dashboard

1. Mở https://supabase.com/dashboard
2. Chọn project của bạn
3. Vào **SQL Editor** ở sidebar trái

## Bước 2: Reset Database (Nếu cần)

1. Copy toàn bộ nội dung file `database/reset-database.sql`
2. Paste vào SQL Editor
3. Click **Run** để thực thi
4. Đợi script chạy xong (có thể mất 1-2 phút)

## Bước 3: Kiểm tra Database

1. Copy nội dung file `database/check-database.sql`
2. Paste vào SQL Editor và chạy
3. Kiểm tra kết quả:
   - Tất cả 6 bảng phải tồn tại
   - Bảng `nguoi_dung` phải có 5 records
   - Bảng `ho_so` phải có 3 records
   - Các bảng khác phải có dữ liệu

## Bước 4: Test Connection từ App

1. Restart Next.js server:
   ```bash
   # Dừng server (Ctrl+C)
   npm run dev
   ```

2. Truy cập http://localhost:3000

3. Vào trang `/ho-so/tao-moi` để test form

4. Kiểm tra console không có lỗi 500

## Bước 5: Troubleshooting

### Lỗi "table does not exist"
```sql
-- Chạy lại reset-database.sql
```

### Lỗi "enum does not exist"
```sql
-- Xóa enum cũ
DROP TYPE IF EXISTS vai_tro_nguoi_dung CASCADE;
-- Chạy lại reset-database.sql
```

### Lỗi "permission denied"
```sql
-- Disable RLS tạm thời
ALTER TABLE nguoi_dung DISABLE ROW LEVEL SECURITY;
ALTER TABLE ho_so DISABLE ROW LEVEL SECURITY;
ALTER TABLE loai_tai_lieu DISABLE ROW LEVEL SECURITY;
ALTER TABLE tieu_chuan DISABLE ROW LEVEL SECURITY;
```

### Lỗi "foreign key constraint"
```sql
-- Xóa tất cả bảng theo thứ tự
DROP TABLE IF EXISTS lich_su_ho_so CASCADE;
DROP TABLE IF EXISTS tai_lieu_tieu_chuan CASCADE;
DROP TABLE IF EXISTS ho_so CASCADE;
DROP TABLE IF EXISTS tieu_chuan CASCADE;
DROP TABLE IF EXISTS loai_tai_lieu CASCADE;
DROP TABLE IF EXISTS nguoi_dung CASCADE;
-- Chạy lại reset-database.sql
```

## Bước 6: Verify Setup

Sau khi setup xong, bạn có thể:

1. **Tạo hồ sơ mới**: Vào `/ho-so/tao-moi`
2. **Xem danh sách**: Vào `/ho-so`
3. **Kiểm tra dashboard**: Vào `/`

## Cấu trúc Database Final

```
nguoi_dung (5 records)
├── admin@company.com (quan_tri)
├── manager@company.com (phe_duyet)
└── user@company.com (nguoi_dung)

loai_tai_lieu (5 records)
├── Quy trình
├── Hướng dẫn
├── Biểu mẫu
├── Chính sách
└── Báo cáo

tieu_chuan (7 records)
├── ISO 9001:2015
├── BRC v9
├── HACCP
└── ...

ho_so (3 records)
├── QT-001 (Quy trình Kiểm soát Chất lượng)
├── HD-002 (Hướng dẫn An toàn Thực phẩm)
└── CS-003 (Chính sách Bảo mật)
```

## Notes

- RLS đã được disable để dễ test
- Trigger tự động tạo lịch sử đã được setup
- Indexes đã được tạo để tối ưu performance
- Dữ liệu mẫu đã sẵn sàng để test

---

**Quan trọng**: Backup dữ liệu trước khi chạy reset-database.sql!