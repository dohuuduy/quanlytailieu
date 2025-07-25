-- Thêm dữ liệu mẫu cho lịch đánh giá đơn giản

-- ISO 9001:2015 - Hoàn thành
INSERT INTO lich_danh_gia (tieu_chuan_id, ngay_du_kien, ngay_bat_dau_thuc_te, ngay_ket_thuc_thuc_te, auditor, to_chuc_danh_gia, trang_thai, ghi_chu)
SELECT 
  tc.id,
  '2025-01-15'::date,
  '2025-01-15'::date,
  '2025-01-16'::date,
  'Nguyễn Văn A',
  'TÜV SÜD',
  'hoan_thanh',
  'Đánh giá định kỳ hàng năm theo ISO 9001:2015. Kết quả: Đạt yêu cầu'
FROM tieu_chuan tc
WHERE tc.ten_tieu_chuan = 'ISO 9001:2015'
ON CONFLICT DO NOTHING;

-- BRC v9 - Đang thực hiện
INSERT INTO lich_danh_gia (tieu_chuan_id, ngay_du_kien, ngay_bat_dau_thuc_te, auditor, to_chuc_danh_gia, trang_thai, ghi_chu)
SELECT 
  tc.id,
  '2025-01-25'::date,
  '2025-01-25'::date,
  'Trần Thị B',
  'SGS Vietnam',
  'dang_thuc_hien',
  'Audit BRC v9 - Đánh giá chứng nhận lần đầu'
FROM tieu_chuan tc
WHERE tc.ten_tieu_chuan = 'BRC v9'
ON CONFLICT DO NOTHING;

-- HACCP - Kế hoạch
INSERT INTO lich_danh_gia (tieu_chuan_id, ngay_du_kien, auditor, to_chuc_danh_gia, trang_thai, ghi_chu)
SELECT 
  tc.id,
  '2025-02-10'::date,
  'Lê Văn C',
  'Bureau Veritas',
  'ke_hoach',
  'Đánh giá giám sát HACCP 6 tháng'
FROM tieu_chuan tc
WHERE tc.ten_tieu_chuan = 'HACCP'
ON CONFLICT DO NOTHING;

-- ASC - Kế hoạch
INSERT INTO lich_danh_gia (tieu_chuan_id, ngay_du_kien, auditor, to_chuc_danh_gia, trang_thai, ghi_chu)
SELECT 
  tc.id,
  '2025-03-01'::date,
  'Phạm Thị D',
  'Control Union',
  'ke_hoach',
  'Surveillance Audit ASC - Đánh giá giám sát định kỳ'
FROM tieu_chuan tc
WHERE tc.ten_tieu_chuan = 'ASC'
ON CONFLICT DO NOTHING;

-- BAP - Kế hoạch
INSERT INTO lich_danh_gia (tieu_chuan_id, ngay_du_kien, auditor, to_chuc_danh_gia, trang_thai, ghi_chu)
SELECT 
  tc.id,
  '2025-04-15'::date,
  'Hoàng Văn E',
  'SCS Global Services',
  'ke_hoach',
  'Đánh giá BAP - Best Aquaculture Practices'
FROM tieu_chuan tc
WHERE tc.ten_tieu_chuan = 'BAP'
ON CONFLICT DO NOTHING;