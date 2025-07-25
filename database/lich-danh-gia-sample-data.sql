-- Thêm dữ liệu mẫu cho lịch đánh giá (đơn giản)
INSERT INTO lich_danh_gia (tieu_chuan_id, ngay_du_kien, ngay_bat_dau_thuc_te, ngay_ket_thuc_thuc_te, auditor, to_chuc_danh_gia, trang_thai, ghi_chu)
SELECT 
  tc.id,
  '2025-02-15'::date,
  '2025-02-15'::date,
  '2025-02-17'::date,
  'Nguyễn Văn A, Trần Thị B',
  'Công ty Chứng nhận ABC',
  'hoan_thanh',
  'Audit định kỳ hàng năm - Kết quả đạt yêu cầu'
FROM tieu_chuan tc
WHERE tc.ten_tieu_chuan = 'ISO 9001:2015'
ON CONFLICT DO NOTHING;

INSERT INTO lich_danh_gia (tieu_chuan_id, ngay_du_kien, ngay_bat_dau_thuc_te, ngay_ket_thuc_thuc_te, auditor, to_chuc_danh_gia, trang_thai, ghi_chu)
SELECT 
  tc.id,
  '2025-01-25'::date,
  '2025-01-25'::date,
  NULL,
  'John Smith, Mary Johnson',
  'BRC Certification Ltd',
  'dang_thuc_hien',
  'Audit BRC v9 - Đang trong quá trình thực hiện'
FROM tieu_chuan tc
WHERE tc.ten_tieu_chuan = 'BRC v9'
ON CONFLICT DO NOTHING;

INSERT INTO lich_danh_gia (tieu_chuan_id, ngay_du_kien, auditor, to_chuc_danh_gia, trang_thai, ghi_chu)
SELECT 
  tc.id,
  '2025-03-10'::date,
  'Lê Văn C',
  'Đội ngũ nội bộ',
  'ke_hoach',
  'Tự đánh giá HACCP trước audit chính thức'
FROM tieu_chuan tc
WHERE tc.ten_tieu_chuan = 'HACCP'
ON CONFLICT DO NOTHING;

INSERT INTO lich_danh_gia (tieu_chuan_id, ngay_du_kien, auditor, to_chuc_danh_gia, trang_thai, ghi_chu)
SELECT 
  tc.id,
  '2025-04-20'::date,
  'ASC Auditor Team',
  'Aquaculture Stewardship Council',
  'ke_hoach',
  'Surveillance audit định kỳ 6 tháng'
FROM tieu_chuan tc
WHERE tc.ten_tieu_chuan = 'ASC'
ON CONFLICT DO NOTHING;

INSERT INTO lich_danh_gia (tieu_chuan_id, ngay_du_kien, ngay_bat_dau_thuc_te, ngay_ket_thuc_thuc_te, auditor, to_chuc_danh_gia, trang_thai, ghi_chu)
SELECT 
  tc.id,
  '2024-12-15'::date,
  '2024-12-20'::date,
  '2024-12-22'::date,
  'Phạm Thị D, Hoàng Văn E',
  'Công ty Kiểm định XYZ',
  'hoan_thanh',
  'Audit BAP - Có một số sai lỗi nhỏ đã được khắc phục'
FROM tieu_chuan tc
WHERE tc.ten_tieu_chuan = 'BAP'
ON CONFLICT DO NOTHING;

