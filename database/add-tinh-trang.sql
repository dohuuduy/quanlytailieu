-- Thêm trường tinh_trang vào bảng loại tài liệu
ALTER TABLE loai_tai_lieu ADD COLUMN IF NOT EXISTS tinh_trang TEXT NOT NULL DEFAULT 'hieu_luc' CHECK (tinh_trang IN ('hieu_luc', 'cho_duyet', 'het_hieu_luc'));

-- Thêm trường tinh_trang vào bảng tiêu chuẩn
ALTER TABLE tieu_chuan ADD COLUMN IF NOT EXISTS tinh_trang TEXT NOT NULL DEFAULT 'hieu_luc' CHECK (tinh_trang IN ('hieu_luc', 'cho_duyet', 'het_hieu_luc'));

-- Cập nhật dữ liệu mẫu để đặt một số tiêu chuẩn và loại tài liệu ở các trạng thái khác nhau
UPDATE loai_tai_lieu SET tinh_trang = 'cho_duyet' WHERE id IN (
    SELECT id FROM loai_tai_lieu ORDER BY RANDOM() LIMIT 1
);

UPDATE loai_tai_lieu SET tinh_trang = 'het_hieu_luc' WHERE id IN (
    SELECT id FROM loai_tai_lieu WHERE tinh_trang = 'hieu_luc' ORDER BY RANDOM() LIMIT 1
);

UPDATE tieu_chuan SET tinh_trang = 'cho_duyet' WHERE id IN (
    SELECT id FROM tieu_chuan ORDER BY RANDOM() LIMIT 1
);

UPDATE tieu_chuan SET tinh_trang = 'het_hieu_luc' WHERE id IN (
    SELECT id FROM tieu_chuan WHERE tinh_trang = 'hieu_luc' ORDER BY RANDOM() LIMIT 1
);