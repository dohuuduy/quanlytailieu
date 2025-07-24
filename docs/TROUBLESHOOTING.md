# Hướng dẫn Khắc phục Lỗi

## 1. Lỗi Database (500 Error)

### Nguyên nhân:
- Bảng `nguoi_dung` chưa có dữ liệu
- RLS policies chưa được cấu hình đúng
- Supabase connection issues

### Giải pháp:

#### Bước 1: Chạy SQL Schema
```sql
-- Chạy file database/schema.sql trên Supabase SQL Editor
-- Sau đó chạy file database/sample-data.sql
```

#### Bước 2: Kiểm tra RLS Policies
```sql
-- Tạm thời disable RLS để test
ALTER TABLE nguoi_dung DISABLE ROW LEVEL SECURITY;
ALTER TABLE ho_so DISABLE ROW LEVEL SECURITY;
ALTER TABLE loai_tai_lieu DISABLE ROW LEVEL SECURITY;
ALTER TABLE tieu_chuan DISABLE ROW LEVEL SECURITY;
```

#### Bước 3: Tạo policies đơn giản
```sql
-- Cho phép tất cả operations cho testing
CREATE POLICY "Allow all" ON nguoi_dung FOR ALL USING (true);
CREATE POLICY "Allow all" ON ho_so FOR ALL USING (true);
CREATE POLICY "Allow all" ON loai_tai_lieu FOR ALL USING (true);
CREATE POLICY "Allow all" ON tieu_chuan FOR ALL USING (true);
```

## 2. Lỗi UI Bị Lệch

### Nguyên nhân:
- CSS conflicts
- Responsive breakpoints
- Flexbox alignment issues

### Giải pháp:

#### Bước 1: Kiểm tra Tailwind CSS
```bash
# Rebuild CSS
npm run dev
```

#### Bước 2: Sử dụng proper spacing
```css
/* Thay vì gap-4 trên mobile, dùng gap-2 */
.grid {
  @apply grid-cols-2 md:grid-cols-3 gap-2 lg:gap-4;
}
```

#### Bước 3: Fix button alignment
```tsx
// Sử dụng consistent sizing
<Button size="sm" className="h-8 px-3">
  Text
</Button>
```

## 3. Lỗi MetaMask (Có thể bỏ qua)

### Nguyên nhân:
- Browser extension conflicts
- Không liên quan đến ứng dụng

### Giải pháp:
```javascript
// Thêm vào next.config.js để ignore
const nextConfig = {
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
    };
    return config;
  },
}
```

## 4. Lỗi Toast Notifications

### Nguyên nhân:
- Toast context chưa được setup
- Import sai toast hook

### Giải pháp:

#### Bước 1: Kiểm tra import
```tsx
// Đúng
import { useToast } from '@/lib/toast'

// Sai
import { useToast } from '@/components/ui/use-toast'
```

#### Bước 2: Sử dụng toast đúng cách
```tsx
const { toast } = useToast()

toast({
  title: "Thành công",
  description: "Thao tác hoàn thành",
  variant: "default" // hoặc "destructive"
})
```

## 5. Lỗi Responsive Design

### Nguyên nhân:
- Breakpoints không consistent
- Container sizing issues

### Giải pháp:

#### Bước 1: Sử dụng consistent breakpoints
```tsx
// Mobile first approach
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
```

#### Bước 2: Container max-width
```tsx
<main className="flex-1 overflow-auto p-4 lg:p-6">
  <div className="mx-auto max-w-7xl">
    {children}
  </div>
</main>
```

## 6. Lỗi Form Validation

### Nguyên nhân:
- Zod schema conflicts
- React Hook Form setup

### Giải pháp:

#### Bước 1: Kiểm tra schema
```tsx
const formSchema = z.object({
  ma_tai_lieu: z.string().min(1, 'Bắt buộc'),
  // ...
})
```

#### Bước 2: Form setup
```tsx
const form = useForm<FormData>({
  resolver: zodResolver(formSchema),
  defaultValues: {
    ma_tai_lieu: '',
    // ...
  }
})
```

## 7. Commands để Debug

### Kiểm tra logs
```bash
# Browser console
F12 -> Console

# Server logs
npm run dev
# Check terminal output
```

### Kiểm tra network
```bash
# Browser DevTools
F12 -> Network tab
# Check failed requests
```

### Kiểm tra database
```sql
-- Test connection
SELECT * FROM nguoi_dung LIMIT 1;

-- Check table structure
\d nguoi_dung
```

## 8. Quick Fixes

### Reset CSS
```bash
# Clear browser cache
Ctrl+Shift+R (Windows)
Cmd+Shift+R (Mac)
```

### Reset Database
```sql
-- Drop and recreate tables
DROP TABLE IF EXISTS lich_su_ho_so CASCADE;
DROP TABLE IF EXISTS tai_lieu_tieu_chuan CASCADE;
DROP TABLE IF EXISTS ho_so CASCADE;
DROP TABLE IF EXISTS tieu_chuan CASCADE;
DROP TABLE IF EXISTS loai_tai_lieu CASCADE;
DROP TABLE IF EXISTS nguoi_dung CASCADE;

-- Then run schema.sql again
```

### Reset Node Modules
```bash
rm -rf node_modules package-lock.json
npm install
```

---

**Lưu ý**: Luôn backup dữ liệu trước khi thực hiện các thao tác reset!