# Module Quản lý Hồ sơ Tài liệu

## 1. Tổng quan Module

### Mục đích
Module Quản lý Hồ sơ Tài liệu cho phép người dùng tạo, xem, chỉnh sửa và quản lý các tài liệu tuân thủ tiêu chuẩn doanh nghiệp như ISO, BRC, SMETA, ASC, HACCP, BAP.

### Phạm vi chức năng
- ✅ Danh sách hồ sơ tài liệu với tìm kiếm và lọc
- ✅ Tạo mới hồ sơ tài liệu
- ✅ Xem chi tiết hồ sơ tài liệu
- ✅ Chỉnh sửa hồ sơ tài liệu
- ✅ Xóa hồ sơ tài liệu
- ✅ Liên kết với tiêu chuẩn áp dụng
- ✅ Theo dõi lịch sử thay đổi

## 2. Cấu trúc Database

### Bảng `ho_so`
```sql
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
```

### Bảng liên quan
- `nguoi_dung`: Thông tin người ban hành
- `loai_tai_lieu`: Phân loại tài liệu
- `tieu_chuan`: Các tiêu chuẩn áp dụng
- `tai_lieu_tieu_chuan`: Liên kết N-N giữa tài liệu và tiêu chuẩn
- `lich_su_ho_so`: Lịch sử thay đổi

## 3. API Endpoints

### GET /ho-so
**Mục đích**: Lấy danh sách hồ sơ tài liệu
**Query Parameters**:
- `search`: Tìm kiếm theo mã hoặc tên tài liệu
- `status`: Lọc theo tình trạng
- `page`: Phân trang
- `limit`: Số lượng bản ghi

### POST /ho-so
**Mục đích**: Tạo mới hồ sơ tài liệu
**Body**:
```json
{
  "ma_tai_lieu": "QT-001",
  "ten_tai_lieu": "Quy trình Kiểm soát Chất lượng",
  "phien_ban": "v1.0",
  "ngay_ban_hanh": "2024-01-15",
  "ngay_het_hieu_luc": null,
  "loai_tai_lieu_id": "uuid",
  "nguoi_ban_hanh_id": "uuid",
  "tinh_trang": "cho_duyet",
  "ghi_chu": "Ghi chú",
  "tieu_chuan_ids": ["uuid1", "uuid2"]
}
```

### GET /ho-so/:id
**Mục đích**: Lấy chi tiết hồ sơ tài liệu

### PUT /ho-so/:id
**Mục đích**: Cập nhật hồ sơ tài liệu

### DELETE /ho-so/:id
**Mục đích**: Xóa hồ sơ tài liệu

## 4. Cấu trúc Frontend

### Pages
```
app/ho-so/
├── page.tsx                    # Danh sách hồ sơ
├── tao-moi/
│   └── page.tsx               # Form tạo mới
└── [id]/
    ├── page.tsx               # Chi tiết hồ sơ
    └── chinh-sua/
        └── page.tsx           # Form chỉnh sửa
```

### Components
```
components/
├── ui/                        # shadcn/ui components
│   ├── button.tsx
│   ├── input.tsx
│   ├── select.tsx
│   ├── textarea.tsx
│   ├── form.tsx
│   ├── card.tsx
│   ├── label.tsx
│   └── toast.tsx
└── ho-so/                     # Specific components (future)
```

## 5. Validation Schema

### Form Validation (Zod)
```typescript
const formSchema = z.object({
  ma_tai_lieu: z.string().min(1, 'Mã tài liệu là bắt buộc'),
  ten_tai_lieu: z.string().min(1, 'Tên tài liệu là bắt buộc'),
  phien_ban: z.string().min(1, 'Phiên bản là bắt buộc'),
  ngay_ban_hanh: z.string().min(1, 'Ngày ban hành là bắt buộc'),
  ngay_het_hieu_luc: z.string().optional(),
  loai_tai_lieu_id: z.string().min(1, 'Loại tài liệu là bắt buộc'),
  nguoi_ban_hanh_id: z.string().min(1, 'Người ban hành là bắt buộc'),
  tinh_trang: z.enum(['hieu_luc', 'cho_duyet', 'het_hieu_luc']),
  ghi_chu: z.string().optional(),
})
```

## 6. Features Đã Triển khai

### ✅ Danh sách Hồ sơ (`/ho-so`)
- Hiển thị danh sách tài liệu với thông tin cơ bản
- Tìm kiếm theo mã và tên tài liệu
- Lọc theo tình trạng (hiệu lực, chờ duyệt, hết hiệu lực)
- Actions: Xem, Sửa, Xóa
- Responsive design

### ✅ Tạo mới Hồ sơ (`/ho-so/tao-moi`)
- Form validation với Zod + React Hook Form
- Select dropdown cho loại tài liệu và người ban hành
- Multi-select cho tiêu chuẩn áp dụng
- Date picker cho ngày ban hành và hết hiệu lực
- Toast notifications

### ✅ Chi tiết Hồ sơ (`/ho-so/[id]`)
- Hiển thị đầy đủ thông tin tài liệu
- Danh sách tiêu chuẩn áp dụng
- Lịch sử thay đổi (toggle)
- Actions: Chỉnh sửa, Xóa

### ✅ Chỉnh sửa Hồ sơ (`/ho-so/[id]/chinh-sua`)
- Pre-populate form với dữ liệu hiện tại
- Cập nhật liên kết tiêu chuẩn
- Validation và error handling

## 7. Tính năng Nâng cao

### Audit Trail
- Tự động ghi lịch sử khi tạo/sửa hồ sơ
- Trigger database tự động tạo log
- Hiển thị timeline thay đổi

### Status Management
- 3 trạng thái: Chờ duyệt, Hiệu lực, Hết hiệu lực
- Color coding cho từng trạng thái
- Workflow approval (future enhancement)

### Search & Filter
- Full-text search trên mã và tên tài liệu
- Filter theo tình trạng
- Responsive filter UI

## 8. Security & Performance

### Row Level Security (RLS)
```sql
-- Cho phép đọc tất cả hồ sơ cho user đã đăng nhập
CREATE POLICY "Cho phép đọc tất cả hồ sơ" ON ho_so 
FOR SELECT USING (auth.role() = 'authenticated');

-- Policies cho CRUD operations
CREATE POLICY "Cho phép tạo hồ sơ" ON ho_so 
FOR INSERT WITH CHECK (auth.role() = 'authenticated');
```

### Database Indexes
```sql
CREATE INDEX idx_ho_so_ma_tai_lieu ON ho_so(ma_tai_lieu);
CREATE INDEX idx_ho_so_tinh_trang ON ho_so(tinh_trang);
CREATE INDEX idx_ho_so_ngay_ban_hanh ON ho_so(ngay_ban_hanh);
```

## 9. Testing Strategy

### Unit Tests (Future)
- Form validation logic
- Utility functions
- Component rendering

### Integration Tests (Future)
- API endpoints
- Database operations
- User workflows

## 10. Deployment Notes

### Environment Variables
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Database Migration
1. Chạy `database/schema.sql` trên Supabase
2. Verify RLS policies
3. Test với sample data

## 11. Future Enhancements

### Phase 2 Features
- [ ] File upload/attachment
- [ ] Document versioning
- [ ] Approval workflow
- [ ] Email notifications
- [ ] Advanced reporting
- [ ] Bulk operations
- [ ] Export to PDF/Excel

### Performance Optimizations
- [ ] Pagination cho danh sách lớn
- [ ] Caching với React Query
- [ ] Lazy loading components
- [ ] Image optimization

## 12. Troubleshooting

### Common Issues
1. **Form validation errors**: Kiểm tra Zod schema
2. **Supabase connection**: Verify environment variables
3. **RLS policies**: Ensure user authentication
4. **Foreign key constraints**: Check related data exists

### Debug Commands
```bash
# Check database connection
npm run dev

# Verify Supabase setup
# Check browser console for errors
```

---

**Tác giả**: AI Assistant  
**Ngày tạo**: 2025-01-23  
**Phiên bản**: 1.0  
**Trạng thái**: Hoàn thành Module 1