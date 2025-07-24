-- Thêm dữ liệu mẫu cho bảng nguoi_dung
INSERT INTO nguoi_dung (ho_ten, email, vai_tro) VALUES
('Nguyễn Văn Admin', 'admin@company.com', 'quan_tri'::vai_tro_nguoi_dung),
('Trần Thị Manager', 'manager@company.com', 'phe_duyet'::vai_tro_nguoi_dung),
('Lê Văn User', 'user@company.com', 'nguoi_dung'::vai_tro_nguoi_dung),
('Phạm Thị QA', 'qa@company.com', 'phe_duyet'::vai_tro_nguoi_dung),
('Hoàng Văn Dev', 'dev@company.com', 'nguoi_dung'::vai_tro_nguoi_dung)
ON CONFLICT (email) DO NOTHING;

-- Thêm dữ liệu mẫu cho hồ sơ tài liệu
INSERT INTO ho_so (ma_tai_lieu, ten_tai_lieu, phien_ban, ngay_ban_hanh, nguoi_ban_hanh_id, loai_tai_lieu_id, tinh_trang, ghi_chu)
SELECT 
  'QT-001',
  'Quy trình Kiểm soát Chất lượng',
  'v2.1',
  '2024-01-15',
  nd.id,
  lt.id,
  'hieu_luc',
  'Quy trình chính cho kiểm soát chất lượng sản phẩm'
FROM nguoi_dung nd, loai_tai_lieu lt
WHERE nd.email = 'admin@company.com' AND lt.ten_loai = 'Quy trình'
ON CONFLICT (ma_tai_lieu) DO NOTHING;

INSERT INTO ho_so (ma_tai_lieu, ten_tai_lieu, phien_ban, ngay_ban_hanh, nguoi_ban_hanh_id, loai_tai_lieu_id, tinh_trang, ghi_chu)
SELECT 
  'HD-002',
  'Hướng dẫn An toàn Thực phẩm',
  'v1.3',
  '2024-01-14',
  nd.id,
  lt.id,
  'cho_duyet',
  'Hướng dẫn chi tiết về an toàn thực phẩm'
FROM nguoi_dung nd, loai_tai_lieu lt
WHERE nd.email = 'manager@company.com' AND lt.ten_loai = 'Hướng dẫn'
ON CONFLICT (ma_tai_lieu) DO NOTHING;

INSERT INTO ho_so (ma_tai_lieu, ten_tai_lieu, phien_ban, ngay_ban_hanh, nguoi_ban_hanh_id, loai_tai_lieu_id, tinh_trang, ghi_chu)
SELECT 
  'CS-003',
  'Chính sách Bảo mật Thông tin',
  'v1.0',
  '2024-01-13',
  nd.id,
  lt.id,
  'hieu_luc',
  'Chính sách bảo mật dữ liệu công ty'
FROM nguoi_dung nd, loai_tai_lieu lt
WHERE nd.email = 'admin@company.com' AND lt.ten_loai = 'Chính sách'
ON CONFLICT (ma_tai_lieu) DO NOTHING;

-- Thêm liên kết tiêu chuẩn
INSERT INTO tai_lieu_tieu_chuan (ho_so_id, tieu_chuan_id)
SELECT hs.id, tc.id
FROM ho_so hs, tieu_chuan tc
WHERE hs.ma_tai_lieu = 'QT-001' AND tc.ten_tieu_chuan = 'ISO 9001:2015'
ON CONFLICT (ho_so_id, tieu_chuan_id) DO NOTHING;

INSERT INTO tai_lieu_tieu_chuan (ho_so_id, tieu_chuan_id)
SELECT hs.id, tc.id
FROM ho_so hs, tieu_chuan tc
WHERE hs.ma_tai_lieu = 'HD-002' AND tc.ten_tieu_chuan = 'BRC v9'
ON CONFLICT (ho_so_id, tieu_chuan_id) DO NOTHING;

INSERT INTO tai_lieu_tieu_chuan (ho_so_id, tieu_chuan_id)
SELECT hs.id, tc.id
FROM ho_so hs, tieu_chuan tc
WHERE hs.ma_tai_lieu = 'HD-002' AND tc.ten_tieu_chuan = 'HACCP'
ON CONFLICT (ho_so_id, tieu_chuan_id) DO NOTHING;