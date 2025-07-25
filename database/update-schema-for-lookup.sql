-- Script cập nhật database schema để hỗ trợ tính năng tra cứu

-- 1. Thêm cột link_tai_lieu vào bảng ho_so
ALTER TABLE ho_so ADD COLUMN IF NOT EXISTS link_tai_lieu TEXT;
COMMENT ON COLUMN ho_so.link_tai_lieu IS 'Link đến file tài liệu (URL hoặc đường dẫn)';

-- 2. Thêm cột tinh_trang vào bảng loai_tai_lieu
ALTER TABLE loai_tai_lieu ADD COLUMN IF NOT EXISTS tinh_trang TEXT NOT NULL DEFAULT 'hieu_luc' 
CHECK (tinh_trang IN ('hieu_luc', 'cho_duyet', 'het_hieu_luc'));
COMMENT ON COLUMN loai_tai_lieu.tinh_trang IS 'Tình trạng của loại tài liệu';

-- 3. Thêm cột tinh_trang vào bảng tieu_chuan
ALTER TABLE tieu_chuan ADD COLUMN IF NOT EXISTS tinh_trang TEXT NOT NULL DEFAULT 'hieu_luc' 
CHECK (tinh_trang IN ('hieu_luc', 'cho_duyet', 'het_hieu_luc'));
COMMENT ON COLUMN tieu_chuan.tinh_trang IS 'Tình trạng của tiêu chuẩn';

-- 4. Cập nhật dữ liệu mẫu với link tài liệu (30% ngẫu nhiên)
UPDATE ho_so SET link_tai_lieu = 'https://docs.example.com/' || ma_tai_lieu || '.pdf' 
WHERE link_tai_lieu IS NULL AND random() < 0.3;

-- 5. Cập nhật tình trạng cho các loại tài liệu hiện có
UPDATE loai_tai_lieu SET tinh_trang = 'hieu_luc' WHERE tinh_trang IS NULL;

-- 6. Cập nhật tình trạng cho các tiêu chuẩn hiện có
UPDATE tieu_chuan SET tinh_trang = 'hieu_luc' WHERE tinh_trang IS NULL;

-- 7. Thêm index cho các cột mới để tối ưu hiệu suất
CREATE INDEX IF NOT EXISTS idx_loai_tai_lieu_tinh_trang ON loai_tai_lieu(tinh_trang);
CREATE INDEX IF NOT EXISTS idx_tieu_chuan_tinh_trang ON tieu_chuan(tinh_trang);
CREATE INDEX IF NOT EXISTS idx_ho_so_link_tai_lieu ON ho_so(link_tai_lieu) WHERE link_tai_lieu IS NOT NULL;

-- 8. Thêm một số dữ liệu mẫu bổ sung cho testing
INSERT INTO tieu_chuan (ten_tieu_chuan, mo_ta, tinh_trang) VALUES
('ISO 14001:2015', 'Hệ thống quản lý môi trường', 'hieu_luc'),
('ISO 45001:2018', 'Hệ thống quản lý an toàn và sức khỏe nghề nghiệp', 'hieu_luc'),
('FSSC 22000', 'Chứng nhận hệ thống an toàn thực phẩm', 'hieu_luc'),
('GlobalGAP', 'Thực hành nông nghiệp tốt toàn cầu', 'cho_duyet'),
('Organic JAS', 'Tiêu chuẩn hữu cơ Nhật Bản', 'hieu_luc')
ON CONFLICT (ten_tieu_chuan) DO NOTHING;

INSERT INTO loai_tai_lieu (ten_loai, mo_ta, tinh_trang) VALUES
('Thủ tục', 'Các thủ tục vận hành chi tiết', 'hieu_luc'),
('Checklist', 'Danh sách kiểm tra', 'hieu_luc'),
('Record', 'Biểu ghi, hồ sơ lưu trữ', 'hieu_luc'),
('Manual', 'Sổ tay hướng dẫn', 'cho_duyet'),
('SOP', 'Quy trình vận hành tiêu chuẩn', 'hieu_luc')
ON CONFLICT (ten_loai) DO NOTHING;

-- 9. Tạo view để dễ dàng truy vấn thông tin tài liệu với tiêu chuẩn
CREATE OR REPLACE VIEW v_tai_lieu_tieu_chuan AS
SELECT 
    hs.id,
    hs.ma_tai_lieu,
    hs.ten_tai_lieu,
    hs.phien_ban,
    hs.ngay_ban_hanh,
    hs.ngay_het_hieu_luc,
    hs.tinh_trang,
    hs.ghi_chu,
    hs.link_tai_lieu,
    nd.ho_ten as nguoi_ban_hanh,
    ltl.ten_loai as loai_tai_lieu,
    tc.ten_tieu_chuan,
    tc.id as tieu_chuan_id
FROM ho_so hs
JOIN nguoi_dung nd ON hs.nguoi_ban_hanh_id = nd.id
JOIN loai_tai_lieu ltl ON hs.loai_tai_lieu_id = ltl.id
JOIN tai_lieu_tieu_chuan tltc ON hs.id = tltc.ho_so_id
JOIN tieu_chuan tc ON tltc.tieu_chuan_id = tc.id
WHERE tc.tinh_trang = 'hieu_luc';

-- 10. Tạo function để lấy số lượng tài liệu theo tiêu chuẩn
CREATE OR REPLACE FUNCTION get_document_count_by_standard(standard_id UUID)
RETURNS INTEGER AS $$
BEGIN
    RETURN (
        SELECT COUNT(*)
        FROM tai_lieu_tieu_chuan tltc
        JOIN ho_so hs ON tltc.ho_so_id = hs.id
        WHERE tltc.tieu_chuan_id = standard_id
        AND hs.tinh_trang IN ('hieu_luc', 'cho_duyet')
    );
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION get_document_count_by_standard(UUID) IS 'Lấy số lượng tài liệu theo tiêu chuẩn';

-- 11. Tạo function để lấy số lượng tài liệu theo loại
CREATE OR REPLACE FUNCTION get_document_count_by_type(type_id UUID)
RETURNS INTEGER AS $$
BEGIN
    RETURN (
        SELECT COUNT(*)
        FROM ho_so hs
        WHERE hs.loai_tai_lieu_id = type_id
        AND hs.tinh_trang IN ('hieu_luc', 'cho_duyet')
    );
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION get_document_count_by_type(UUID) IS 'Lấy số lượng tài liệu theo loại';

-- 12. Cập nhật RLS policies cho view mới
GRANT SELECT ON v_tai_lieu_tieu_chuan TO authenticated;

-- Thông báo hoàn thành
SELECT 'Database schema updated successfully for lookup features!' as message;