# WebApp Quản lý Hồ sơ Tài liệu Doanh nghiệp

Hệ thống quản lý hồ sơ tài liệu tuân thủ các tiêu chuẩn ISO, BRC, SMETA, ASC, HACCP, BAP.

## Công nghệ sử dụng

- **Frontend**: Next.js 14 + React 18 + TypeScript
- **UI**: Tailwind CSS + shadcn/ui
- **Backend**: Supabase (PostgreSQL + Auth + API + Realtime)
- **Form**: React Hook Form + Zod validation
- **Icons**: Lucide React

## Cài đặt

### 1. Clone repository
```bash
git clone <repository-url>
cd webapp-quan-ly-ho-so
```

### 2. Cài đặt dependencies
```bash
npm install
# hoặc
yarn install
# hoặc
pnpm install
```

### 3. Cấu hình môi trường
Tạo file `.env.local` từ `.env.local.example`:
```bash
cp .env.local.example .env.local
```

Cập nhật các biến môi trường:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Thiết lập Database
1. Tạo project mới trên [Supabase](https://supabase.com)
2. Chạy SQL script trong `database/schema.sql`
3. Cấu hình RLS policies

### 5. Chạy ứng dụng
```bash
npm run dev
# hoặc
yarn dev
# hoặc
pnpm dev
```

Mở [http://localhost:3000](http://localhost:3000) để xem ứng dụng.

## Cấu trúc dự án

```
├── app/                    # Next.js App Router
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   ├── page.tsx          # Homepage
│   └── ho-so/            # Quản lý hồ sơ
│       ├── page.tsx      # Danh sách hồ sơ
│       ├── tao-moi/      # Tạo mới hồ sơ
│       └── [id]/         # Chi tiết & chỉnh sửa
├── components/
│   └── ui/               # shadcn/ui components
├── lib/
│   ├── utils.ts          # Utility functions
│   └── supabase.ts       # Supabase client
├── database/
│   └── schema.sql        # Database schema
└── docs/                 # Documentation
```

## Tính năng

### ✅ Đã hoàn thành
- [x] Quản lý hồ sơ tài liệu (CRUD)
- [x] Tìm kiếm và lọc
- [x] Liên kết tiêu chuẩn áp dụng
- [x] Lịch sử thay đổi
- [x] Responsive UI
- [x] Form validation

### 🚧 Đang phát triển
- [ ] Authentication & Authorization
- [ ] Quản lý người dùng
- [ ] Cấu hình hệ thống
- [ ] Realtime updates
- [ ] PWA support

## Scripts

```bash
npm run dev          # Chạy development server
npm run build        # Build production
npm run start        # Chạy production server
npm run lint         # Lint code
```

## Troubleshooting

### Lỗi TypeScript "Cannot find module 'react'"
```bash
# Xóa node_modules và reinstall
rm -rf node_modules package-lock.json
npm install

# Hoặc clear cache
npm cache clean --force
```

### Lỗi Supabase connection
- Kiểm tra `.env.local` có đúng URL và key
- Verify Supabase project settings
- Check RLS policies

## Đóng góp

1. Fork repository
2. Tạo feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Tạo Pull Request

## License

Distributed under the MIT License. See `LICENSE` for more information.