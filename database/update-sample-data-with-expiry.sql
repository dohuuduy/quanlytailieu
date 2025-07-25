-- Cập nhật dữ liệu mẫu với ngày hết hiệu lực
-- Thêm ngày hết hiệu lực cho các tài liệu hiện có
UPDATE ho_so 
SET ngay_het_hieu_luc = CASE 
  WHEN ma_tai_lieu = 'QT-001' THEN '2024-08-15'::date  -- Sắp hết hạn (trong 30 ngày)
  WHEN ma_tai_lieu = 'CS-003' THEN '2024-12-31'::date  -- Còn lâu mới hết hạn
  ELSE NULL
END
WHERE ma_tai_lieu IN ('QT-001', 'CS-003');

-- Thêm thêm một số tài liệu mẫu với các trạng thái khác nhau
INSERT INTO ho_so (ma_tai_lieu, ten_tai_lieu, phien_ban, ngay_ban_hanh, ngay_het_hieu_luc, nguoi_ban_hanh_id, loai_tai_lieu_id, tinh_trang, ghi_chu)
SELECT 
  'BRC-004',
  'Quy trình Kiểm tra BRC',
  'v1.2',
  '2024-01-10',
  '2024-08-10'::date,  -- Sắp hết hạn
  nd.id,
  lt.id,
  'hieu_luc',
  'Quy trình kiểm tra theo tiêu chuẩn BRC'
FROM nguoi_dung nd, loai_tai_lieu lt
WHERE nd.email = 'qa@company.com' AND lt.ten_loai = 'Quy trình'
ON CONFLICT (ma_tai_lieu) DO NOTHING;

INSERT INTO ho_so (ma_tai_lieu, ten_tai_lieu, phien_ban, ngay_ban_hanh, ngay_het_hieu_luc, nguoi_ban_hanh_id, loai_tai_lieu_id, tinh_trang, ghi_chu)
SELECT 
  'HACCP-005',
  'Hướng dẫn HACCP',
  'v2.0',
  '2024-01-12',
  '2024-08-20'::date,  -- Sắp hết hạn
  nd.id,
  lt.id,
  'hieu_luc',
  'Hướng dẫn thực hiện HACCP'
FROM nguoi_dung nd, loai_tai_lieu lt
WHERE nd.email = 'manager@company.com' AND lt.ten_loai = 'Hướng dẫn'
ON CONFLICT (ma_tai_lieu) DO NOTHING;

INSERT INTO ho_so (ma_tai_lieu, ten_tai_lieu, phien_ban, ngay_ban_hanh, nguoi_ban_hanh_id, loai_tai_lieu_id, tinh_trang, ghi_chu)
SELECT 
  'DRAFT-006',
  'Bản thảo Quy trình mới',
  'v0.1',
  '2024-01-16',
  nd.id,
  lt.id,
  'cho_duyet',
  'Bản thảo đang chờ phê duyệt'
FROM nguoi_dung nd, loai_tai_lieu lt
WHERE nd.email = 'dev@company.com' AND lt.ten_loai = 'Quy trình'
ON CONFLICT (ma_tai_lieu) DO NOTHING;

-- Thêm liên kết với các tiêu chuẩn
INSERT INTO tai_lieu_tieu_chuan (ho_so_id, tieu_chuan_id)
SELECT hs.id, tc.id
FROM ho_so hs, tieu_chuan tc
WHERE hs.ma_tai_lieu = 'BRC-004' AND tc.ten_tieu_chuan = 'BRC v9'
ON CONFLICT (ho_so_id, tieu_chuan_id) DO NOTHING;

INSERT INTO tai_lieu_tieu_chuan (ho_so_id, tieu_chuan_id)
SELECT hs.id, tc.id
FROM ho_so hs, tieu_chuan tc
WHERE hs.ma_tai_lieu = 'HACCP-005' AND tc.ten_tieu_chuan = 'HACCP'
ON CONFLICT (ho_so_id, tieu_chuan_id) DO NOTHING;

INSERT INTO tai_lieu_tieu_chuan (ho_so_id, tieu_chuan_id)
SELECT hs.id, tc.id
FROM ho_so hs, tieu_chuan tc
WHERE hs.ma_tai_lieu = 'DRAFT-006' AND tc.ten_tieu_chuan = 'ISO 9001:2015'
ON CONFLICT (ho_so_id, tieu_chuan_id) DO NOTHING;

-- Thêm liên kết cho tài liệu CS-003 với ISO 9001
INSERT INTO tai_lieu_tieu_chuan (ho_so_id, tieu_chuan_id)
SELECT hs.id, tc.id
FROM ho_so hs, tieu_chuan tc
WHERE hs.ma_tai_lieu = 'CS-003' AND tc.ten_tieu_chuan = 'ISO 9001:2015'
ON CONFLICT (ho_so_id, tieu_chuan_id) DO NOTHING;