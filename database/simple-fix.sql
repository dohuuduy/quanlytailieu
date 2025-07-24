-- Giải pháp đơn giản: Xóa và tạo lại bảng nguoi_dung
DROP TABLE IF EXISTS nguoi_dung CASCADE;

-- Tạo lại bảng với TEXT constraint thay vì enum
CREATE TABLE nguoi_dung (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ho_ten TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    vai_tro TEXT NOT NULL DEFAULT 'nguoi_dung' CHECK (vai_tro IN ('quan_tri', 'phe_duyet', 'nguoi_dung')),
    ngay_tao TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Thêm dữ liệu mẫu
INSERT INTO nguoi_dung (ho_ten, email, vai_tro) VALUES
('Nguyễn Văn Admin', 'admin@company.com', 'quan_tri'),
('Trần Thị Manager', 'manager@company.com', 'phe_duyet'),
('Lê Văn User', 'user@company.com', 'nguoi_dung'),
('Phạm Thị QA', 'qa@company.com', 'phe_duyet'),
('Hoàng Văn Dev', 'dev@company.com', 'nguoi_dung');

-- Tạo lại các bảng khác nếu cần (do CASCADE)
-- Chạy lại schema.sql sau khi chạy script này