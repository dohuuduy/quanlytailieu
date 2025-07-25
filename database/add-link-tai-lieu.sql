-- Thêm cột link_tai_lieu vào bảng ho_so
ALTER TABLE ho_so ADD COLUMN IF NOT EXISTS link_tai_lieu TEXT;

-- Thêm comment cho cột mới
COMMENT ON COLUMN ho_so.link_tai_lieu IS 'Link đến file tài liệu (URL hoặc đường dẫn)';

-- Cập nhật một số dữ liệu mẫu với link (tùy chọn)
UPDATE ho_so SET link_tai_lieu = 'https://example.com/documents/' || ma_tai_lieu || '.pdf' 
WHERE link_tai_lieu IS NULL AND random() < 0.3; -- Chỉ cập nhật 30% ngẫu nhiên để test