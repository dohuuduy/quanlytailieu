-- SCRIPT KIỂM TRA DATABASE
-- Chạy script này để kiểm tra database đã được setup đúng chưa

-- Kiểm tra các bảng đã tồn tại
SELECT 
    schemaname,
    tablename,
    tableowner
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('nguoi_dung', 'ho_so', 'loai_tai_lieu', 'tieu_chuan', 'tai_lieu_tieu_chuan', 'lich_su_ho_so')
ORDER BY tablename;

-- Kiểm tra cấu trúc bảng nguoi_dung
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'nguoi_dung' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Kiểm tra dữ liệu mẫu
SELECT 'nguoi_dung' as table_name, COUNT(*) as record_count FROM nguoi_dung
UNION ALL
SELECT 'loai_tai_lieu', COUNT(*) FROM loai_tai_lieu
UNION ALL
SELECT 'tieu_chuan', COUNT(*) FROM tieu_chuan
UNION ALL
SELECT 'ho_so', COUNT(*) FROM ho_so
UNION ALL
SELECT 'tai_lieu_tieu_chuan', COUNT(*) FROM tai_lieu_tieu_chuan
UNION ALL
SELECT 'lich_su_ho_so', COUNT(*) FROM lich_su_ho_so;

-- Kiểm tra dữ liệu người dùng
SELECT id, ho_ten, email, vai_tro, ngay_tao FROM nguoi_dung ORDER BY ngay_tao;

-- Kiểm tra dữ liệu hồ sơ
SELECT 
    hs.ma_tai_lieu,
    hs.ten_tai_lieu,
    hs.phien_ban,
    hs.tinh_trang,
    nd.ho_ten as nguoi_ban_hanh,
    lt.ten_loai
FROM ho_so hs
JOIN nguoi_dung nd ON hs.nguoi_ban_hanh_id = nd.id
JOIN loai_tai_lieu lt ON hs.loai_tai_lieu_id = lt.id
ORDER BY hs.ngay_tao;

-- Kiểm tra liên kết tiêu chuẩn
SELECT 
    hs.ma_tai_lieu,
    tc.ten_tieu_chuan
FROM tai_lieu_tieu_chuan ttc
JOIN ho_so hs ON ttc.ho_so_id = hs.id
JOIN tieu_chuan tc ON ttc.tieu_chuan_id = tc.id
ORDER BY hs.ma_tai_lieu;