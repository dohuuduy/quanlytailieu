-- Tạo bảng người dùng
CREATE TABLE IF NOT EXISTS nguoi_dung (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ho_ten TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    vai_tro TEXT NOT NULL DEFAULT 'nguoi_dung' CHECK (vai_tro IN ('quan_tri', 'phe_duyet', 'nguoi_dung')),
    ngay_tao TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tạo bảng loại tài liệu
CREATE TABLE IF NOT EXISTS loai_tai_lieu (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ten_loai TEXT NOT NULL,
    mo_ta TEXT
);

-- Tạo bảng tiêu chuẩn
CREATE TABLE IF NOT EXISTS tieu_chuan (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ten_tieu_chuan TEXT NOT NULL,
    mo_ta TEXT
);

-- Tạo bảng hồ sơ tài liệu
CREATE TABLE IF NOT EXISTS ho_so (
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
CREATE TABLE IF NOT EXISTS tai_lieu_tieu_chuan (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ho_so_id UUID NOT NULL REFERENCES ho_so(id) ON DELETE CASCADE,
    tieu_chuan_id UUID NOT NULL REFERENCES tieu_chuan(id) ON DELETE CASCADE,
    UNIQUE(ho_so_id, tieu_chuan_id)
);

-- Tạo bảng lịch sử hồ sơ
CREATE TABLE IF NOT EXISTS lich_su_ho_so (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ho_so_id UUID NOT NULL REFERENCES ho_so(id) ON DELETE CASCADE,
    hanh_dong TEXT NOT NULL CHECK (hanh_dong IN ('tao_moi', 'cap_nhat', 'phe_duyet', 'huy_bo')),
    nguoi_thuc_hien_id UUID NOT NULL REFERENCES nguoi_dung(id),
    ngay_thuc_hien TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ghi_chu TEXT
);

-- Tạo các index để tối ưu hiệu suất
CREATE INDEX IF NOT EXISTS idx_ho_so_ma_tai_lieu ON ho_so(ma_tai_lieu);
CREATE INDEX IF NOT EXISTS idx_ho_so_tinh_trang ON ho_so(tinh_trang);
CREATE INDEX IF NOT EXISTS idx_ho_so_ngay_ban_hanh ON ho_so(ngay_ban_hanh);
CREATE INDEX IF NOT EXISTS idx_lich_su_ho_so_ho_so_id ON lich_su_ho_so(ho_so_id);
CREATE INDEX IF NOT EXISTS idx_lich_su_ho_so_ngay_thuc_hien ON lich_su_ho_so(ngay_thuc_hien);

-- Thêm dữ liệu mẫu cho loại tài liệu
INSERT INTO loai_tai_lieu (ten_loai, mo_ta) VALUES
('Quy trình', 'Các quy trình vận hành và quản lý'),
('Hướng dẫn', 'Tài liệu hướng dẫn thực hiện'),
('Biểu mẫu', 'Các biểu mẫu và form cần thiết'),
('Chính sách', 'Các chính sách của công ty'),
('Báo cáo', 'Các loại báo cáo định kỳ')
ON CONFLICT DO NOTHING;

-- Thêm dữ liệu mẫu cho tiêu chuẩn
INSERT INTO tieu_chuan (ten_tieu_chuan, mo_ta) VALUES
('ISO 9001:2015', 'Hệ thống quản lý chất lượng'),
('BRC v9', 'Tiêu chuẩn an toàn thực phẩm BRC phiên bản 9'),
('BRC v8', 'Tiêu chuẩn an toàn thực phẩm BRC phiên bản 8'),
('SMETA', 'Kiểm toán đạo đức thương mại của thành viên Sedex'),
('ASC', 'Hội đồng nuôi trồng thủy sản'),
('HACCP', 'Phân tích mối nguy và điểm kiểm soát tới hạn'),
('BAP', 'Thực hành nuôi trồng thủy sản tốt nhất')
ON CONFLICT DO NOTHING;

-- Tạo RLS (Row Level Security) policies
ALTER TABLE nguoi_dung ENABLE ROW LEVEL SECURITY;
ALTER TABLE ho_so ENABLE ROW LEVEL SECURITY;
ALTER TABLE loai_tai_lieu ENABLE ROW LEVEL SECURITY;
ALTER TABLE tieu_chuan ENABLE ROW LEVEL SECURITY;
ALTER TABLE tai_lieu_tieu_chuan ENABLE ROW LEVEL SECURITY;
ALTER TABLE lich_su_ho_so ENABLE ROW LEVEL SECURITY;

-- Policies cho người dùng đã đăng nhập
CREATE POLICY "Cho phép đọc tất cả người dùng" ON nguoi_dung FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Cho phép đọc tất cả hồ sơ" ON ho_so FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Cho phép đọc loại tài liệu" ON loai_tai_lieu FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Cho phép đọc tiêu chuẩn" ON tieu_chuan FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Cho phép đọc liên kết tài liệu-tiêu chuẩn" ON tai_lieu_tieu_chuan FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Cho phép đọc lịch sử" ON lich_su_ho_so FOR SELECT USING (auth.role() = 'authenticated');

-- Policies cho việc tạo/sửa/xóa (cần kiểm tra vai trò)
CREATE POLICY "Cho phép tạo hồ sơ" ON ho_so FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Cho phép cập nhật hồ sơ" ON ho_so FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Cho phép xóa hồ sơ" ON ho_so FOR DELETE USING (auth.role() = 'authenticated');

-- Function để tự động tạo lịch sử khi có thay đổi hồ sơ
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

-- Tạo trigger để tự động ghi lịch sử
CREATE TRIGGER trigger_lich_su_ho_so
    AFTER INSERT OR UPDATE ON ho_so
    FOR EACH ROW EXECUTE FUNCTION tao_lich_su_ho_so();