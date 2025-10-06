# Claude's Project Memory - DD Property

## Project Overview
DD Property เป็นระบบจัดการอสังหาริมทรัพย์ที่ใช้สถาปัตยกรรมแบบ Client-Server แยกส่วนกันอย่างชัดเจน

### Architecture
- **Backend:** `backendDD_property` (Express.js + Prisma + MySQL)
- **Frontend:** `ddproperty_project` (Next.js + React + i18n)
- **Communication:** RESTful API

## Backend Structure (backendDD_property)
```
src/
├── controllers/    # จัดการ HTTP Request/Response
├── services/       # Business Logic
├── repositories/   # Data Access Layer (Prisma)
├── routes/         # API Endpoints
├── middlewares/    # Authentication, Error Handling
├── utils/          # Helper Functions
└── validations/    # Data Validation
```

### Key Features
- Property management (CRUD)
- User authentication
- Blog system
- Message system
- Currency management
- Multi-language support
- File upload handling

## Frontend Structure (ddproperty_project)
```
src/
├── app/[locale]/   # Next.js App Router + i18n (EN, TH, CN, RU)
├── components/     # Reusable UI Components
├── services/       # API Calls to Backend
├── stores/         # State Management (Zustand)
├── translations/   # Multi-language Files
└── utils/          # Helper Functions
```

### Features
- Property listing and search
- Property detail pages
- User dashboard
- Blog system
- Multi-language support (4 languages)
- Responsive design

## Database Schema
- Uses Prisma ORM
- Schema file: `prisma/schema.prisma`
- MySQL database
- Main entities: Property, User, Blog, Message, Currency

## Issues Completed (16 รายการ) ✅
1. การแปลภาษาอัตโนมัติ (Auto Translation)
2. ราคาเช่า (Rental Price)
3. ลำดับการแสดงผล Edit Page UI
4. ส่วนลดราคา (Reduce Price)
5. หน่วยค่าส่วนกลาง (Community Fee)
6. ปีที่สร้าง (Construction Year)
7. หัวข้อ (Title) แสดงผล
8. การเรียงลำดับรูปภาพ (Photo Gallery)
9. URL SEO-Friendly
10. ค่าส่วนกลางตามประเภทอสังหาฯ
11. เพิ่มหน่วย Sqm ให้ Land size
12. หน้า Settings ภาษาอังกฤษ
13. Backoffice รองรับ 4 ภาษา
14. ราคาเช่าระยะสั้น (Short-term Rental)
15. ใส่ Comma คั่นตัวเลข
16. Usable Area แสดงผล

## Data Flow
1. User Interaction (Frontend)
2. API Service Call (Frontend)
3. HTTP Request to Backend
4. Route Handler
5. Controller Processing
6. Service Layer (Business Logic)
7. Repository Layer (Database)
8. Response back to Frontend
9. UI Update

## Key Files to Remember
- `/Users/ize/freelance/README_STRUCTURE.md` - Detailed architecture
- `/Users/ize/freelance/readme/ISSUES.md` - Complete issues list
- `prisma/schema.prisma` - Database schema
- `src/controllers/` - API controllers
- `src/services/` - Business logic

## Development Notes
- All issues from ISSUES.md have been resolved
- Project follows layered architecture pattern
- Multi-language support implemented
- SEO-friendly URLs implemented
- Image upload and management system in place

## Status: Production Ready
All major issues resolved and system is stable for production use.

---
*Last updated: 2025-07-14*
*Claude's working memory for DD Property project*