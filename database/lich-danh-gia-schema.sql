-- Tạo bảng lịch đánh giá (đơn giản)
CREATE TABLE IF NOT EXISTS lich_danh_gia (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tieu_chuan_id UUID NOT NULL REFERENCES tieu_chuan(id),
    ngay_du_kien DATE NOT NULL,
    ngay_bat_dau_thuc_te DATE,
    ngay_ket_thuc_thuc_te DATE,
    auditor TEXT,
    to_chuc_danh_gia TEXT,
    trang_thai TEXT NOT NULL DEFAULT 'ke_hoach' CHECK (trang_thai IN ('ke_hoach', 'dang_thuc_hien', 'hoan_thanh', 'huy_bo')),
    ghi_chu TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tạo các index để tối ưu hiệu suất
CREATE INDEX IF NOT EXISTS idx_lich_danh_gia_ngay_du_kien ON lich_danh_gia(ngay_du_kien);
CREATE INDEX IF NOT EXISTS idx_lich_danh_gia_trang_thai ON lich_danh_gia(trang_thai);
CREATE INDEX IF NOT EXISTS idx_lich_danh_gia_tieu_chuan ON lich_danh_gia(tieu_chuan_id);

-- Tạo function để tự động cập nhật updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Tạo trigger để tự động cập nhật updated_at
CREATE TRIGGER update_lich_danh_gia_updated_at 
    BEFORE UPDATE ON lich_danh_gia 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Tạo RLS (Row Level Security) policies
ALTER TABLE lich_danh_gia ENABLE ROW LEVEL SECURITY;

-- Policies cho người dùng đã đăng nhập
CREATE POLICY "Cho phép đọc tất cả lịch đánh giá" ON lich_danh_gia FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Cho phép tạo lịch đánh giá" ON lich_danh_gia FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Cho phép cập nhật lịch đánh giá" ON lich_danh_gia FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Cho phép xóa lịch đánh giá" ON lich_danh_gia FOR DELETE USING (auth.role() = 'authenticated');