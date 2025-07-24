-- Sửa lỗi enum vai_tro
-- Bước 1: Xóa constraint cũ nếu có
ALTER TABLE nguoi_dung DROP CONSTRAINT IF EXISTS nguoi_dung_vai_tro_check;

-- Bước 2: Xóa enum type nếu có
DROP TYPE IF EXISTS vai_tro_nguoi_dung CASCADE;

-- Bước 3: Tạo lại enum type
CREATE TYPE vai_tro_nguoi_dung AS ENUM ('quan_tri', 'phe_duyet', 'nguoi_dung');

-- Bước 4: Cập nhật cột vai_tro để sử dụng enum
ALTER TABLE nguoi_dung 
ALTER COLUMN vai_tro TYPE vai_tro_nguoi_dung 
USING vai_tro::vai_tro_nguoi_dung;

-- Hoặc nếu muốn giữ TEXT với constraint
-- ALTER TABLE nguoi_dung 
-- ADD CONSTRAINT nguoi_dung_vai_tro_check 
-- CHECK (vai_tro IN ('quan_tri', 'phe_duyet', 'nguoi_dung'));