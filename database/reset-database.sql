-- RESET HOÀN TOÀN DATABASE
-- Chạy script này trên Supabase SQL Editor

-- Bước 1: Xóa tất cả bảng và dependencies
DROP TABLE IF EXISTS lich_su_ho_so CASCADE;
DROP TABLE IF EXISTS tai_lieu_tieu_chuan CASCADE;
DROP TABLE IF EXISTS ho_so CASCADE;
DROP TABLE IF EXISTS tieu_chuan CASCADE;
DROP TABLE IF EXISTS loai_tai_lieu CASCADE;
DROP TABLE IF EXISTS nguoi_dung CASCADE;

-- Bước 2: Xóa enum types nếu có
DROP TYPE IF EXISTS vai_tro_nguoi_dung CASCADE;
DROP TYPE IF EXISTS tinh_trang_ho_so CASCADE;
DROP TYPE IF EXISTS hanh_dong_lich_su CASCADE;

-- Bước 3: Tạo lại tất cả bảng
-- Tạo bảng người dùng
CREATE TABLE nguoi_dung (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ho_ten TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    vai_tro TEXT NOT NULL DEFAULT 'nguoi_dung' CHECK (vai_tro IN ('quan_tri', 'phe_duyet', 'nguoi_dung')),
    ngay_tao TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tạo bảng loại tài liệu
CREATE TABLE loai_tai_lieu (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ten_loai TEXT NOT NULL,
    mo_ta TEXT
);

-- Tạo bảng tiêu chuẩn
CREATE TABLE tieu_chuan (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ten_tieu_chuan TEXT NOT NULL,
    mo_ta TEXT
);

-- Tạo bảng hồ sơ tài liệu
CREATE TABLE ho_so (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ma_tai_lieu TEXT UNIQUE NOT NULL,
    ten_tai_lieu TEXT NOT NULL,
    phien_ban TEXT NOT NULL DEFAULT 'v1.0',
    ngay_ban_hanh DATE NOT NULL,
    ngay_het_hieu_luc DATE,
    nguoi_ban_hanh_id UUID NOT NULL REFERENCES nguoi_dung(id),
    loai_tai_lieu_id UUID NOT NULL REFERENCES loai_tai_lieu(id),
    tinh_trang TEXT NOT NULL DEFAULT 'cho_duyet' CHECK (tinh_trang IN ('hieu_luc', 'cho_duyet', 'het_hieu_luc')),
    ghi_chu TEXT,
    ngay_tao TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tạo bảng liên kết tài liệu - tiêu chuẩn (N-N)
CREATE TABLE tai_lieu_tieu_chuan (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ho_so_id UUID NOT NULL REFERENCES ho_so(id) ON DELETE CASCADE,
    tieu_chuan_id UUID NOT NULL REFERENCES tieu_chuan(id) ON DELETE CASCADE,
    UNIQUE(ho_so_id, tieu_chuan_id)
);

-- Tạo bảng lịch sử hồ sơ
CREATE TABLE lich_su_ho_so (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ho_so_id UUID NOT NULL REFERENCES ho_so(id) ON DELETE CASCADE,
    hanh_dong TEXT NOT NULL CHECK (hanh_dong IN ('tao_moi', 'cap_nhat', 'phe_duyet', 'huy_bo')),
    nguoi_thuc_hien_id UUID NOT NULL REFERENCES nguoi_dung(id),
    ngay_thuc_hien TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ghi_chu TEXT
);

-- Bước 4: Tạo indexes
CREATE INDEX idx_ho_so_ma_tai_lieu ON ho_so(ma_tai_lieu);
CREATE INDEX idx_ho_so_tinh_trang ON ho_so(tinh_trang);
CREATE INDEX idx_ho_so_ngay_ban_hanh ON ho_so(ngay_ban_hanh);
CREATE INDEX idx_lich_su_ho_so_ho_so_id ON lich_su_ho_so(ho_so_id);
CREATE INDEX idx_lich_su_ho_so_ngay_thuc_hien ON lich_su_ho_so(ngay_thuc_hien);

-- Bước 5: Thêm dữ liệu mẫu cho loại tài liệu
INSERT INTO loai_tai_lieu (ten_loai, mo_ta) VALUES
('Quy trình', 'Các quy trình vận hành và quản lý'),
('Hướng dẫn', 'Tài liệu hướng dẫn thực hiện'),
('Biểu mẫu', 'Các biểu mẫu và form cần thiết'),
('Chính sách', 'Các chính sách của công ty'),
('Báo cáo', 'Các loại báo cáo định kỳ');

-- Bước 6: Thêm dữ liệu mẫu cho tiêu chuẩn
INSERT INTO tieu_chuan (ten_tieu_chuan, mo_ta) VALUES
('ISO 9001:2015', 'Hệ thống quản lý chất lượng'),
('BRC v9', 'Tiêu chuẩn an toàn thực phẩm BRC phiên bản 9'),
('BRC v8', 'Tiêu chuẩn an toàn thực phẩm BRC phiên bản 8'),
('SMETA', 'Kiểm toán đạo đức thương mại của thành viên Sedex'),
('ASC', 'Hội đồng nuôi trồng thủy sản'),
('HACCP', 'Phân tích mối nguy và điểm kiểm soát tới hạn'),
('BAP', 'Thực hành nuôi trồng thủy sản tốt nhất');

-- Bước 7: Thêm dữ liệu mẫu cho người dùng
INSERT INTO nguoi_dung (ho_ten, email, vai_tro) VALUES
('Nguyễn Văn Admin', 'admin@company.com', 'quan_tri'),
('Trần Thị Manager', 'manager@company.com', 'phe_duyet'),
('Lê Văn User', 'user@company.com', 'nguoi_dung'),
('Phạm Thị QA', 'qa@company.com', 'phe_duyet'),
('Hoàng Văn Dev', 'dev@company.com', 'nguoi_dung');

-- Bước 8: Thêm dữ liệu mẫu cho hồ sơ
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
WHERE nd.email = 'admin@company.com' AND lt.ten_loai = 'Quy trình';

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
WHERE nd.email = 'manager@company.com' AND lt.ten_loai = 'Hướng dẫn';

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
WHERE nd.email = 'admin@company.com' AND lt.ten_loai = 'Chính sách';

-- Bước 9: Thêm liên kết tiêu chuẩn
INSERT INTO tai_lieu_tieu_chuan (ho_so_id, tieu_chuan_id)
SELECT hs.id, tc.id
FROM ho_so hs, tieu_chuan tc
WHERE hs.ma_tai_lieu = 'QT-001' AND tc.ten_tieu_chuan = 'ISO 9001:2015';

INSERT INTO tai_lieu_tieu_chuan (ho_so_id, tieu_chuan_id)
SELECT hs.id, tc.id
FROM ho_so hs, tieu_chuan tc
WHERE hs.ma_tai_lieu = 'HD-002' AND tc.ten_tieu_chuan = 'BRC v9';

INSERT INTO tai_lieu_tieu_chuan (ho_so_id, tieu_chuan_id)
SELECT hs.id, tc.id
FROM ho_so hs, tieu_chuan tc
WHERE hs.ma_tai_lieu = 'HD-002' AND tc.ten_tieu_chuan = 'HACCP';

-- Bước 10: Tạo function và trigger cho lịch sử
CREATE OR REPLACE FUNCTION tao_lich_su_ho_so()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO lich_su_ho_so (ho_so_id, hanh_dong, nguoi_thuc_hien_id, ghi_chu)
        VALUES (NEW.id, 'tao_moi', NEW.nguoi_ban_hanh_id, 'Tạo mới hồ sơ tài liệu');
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO lich_su_ho_so (ho_so_id, hanh_dong, nguoi_thuc_hien_id, ghi_chu)
        VALUES (NEW.id, 'cap_nhat', NEW.nguoi_ban_hanh_id, 'Cập nhật thông tin hồ sơ');
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Tạo trigger
DROP TRIGGER IF EXISTS trigger_lich_su_ho_so ON ho_so;
CREATE TRIGGER trigger_lich_su_ho_so
    AFTER INSERT OR UPDATE ON ho_so
    FOR EACH ROW EXECUTE FUNCTION tao_lich_su_ho_so();

-- Bước 11: Tạm thời disable RLS để test
ALTER TABLE nguoi_dung DISABLE ROW LEVEL SECURITY;
ALTER TABLE ho_so DISABLE ROW LEVEL SECURITY;
ALTER TABLE loai_tai_lieu DISABLE ROW LEVEL SECURITY;
ALTER TABLE tieu_chuan DISABLE ROW LEVEL SECURITY;
ALTER TABLE tai_lieu_tieu_chuan DISABLE ROW LEVEL SECURITY;
ALTER TABLE lich_su_ho_so DISABLE ROW LEVEL SECURITY;

-- Hoàn thành! Database đã được reset và có dữ liệu mẫu