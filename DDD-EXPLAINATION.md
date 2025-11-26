# Giải Thích Kiến Trúc DDD (Domain-Driven Design)

## Tổng Quan

Dự án này được xây dựng theo kiến trúc **Domain-Driven Design (DDD)** kết hợp với **CQRS (Command Query Responsibility Segregation)**. Kiến trúc này giúp tách biệt rõ ràng các tầng logic, dễ bảo trì và mở rộng.

---

## 1. Domain Layer (Tầng Nghiệp Vụ)

📁 **Đường dẫn:** `src/<module>/domain`

Đây là **tầng trung tâm** chứa toàn bộ logic nghiệp vụ cốt lõi của ứng dụng. Tầng này **không phụ thuộc** vào bất kỳ tầng nào khác.

### Các thành phần:

| Thư mục | Mô tả |
|---------|-------|
| `dtos/` | Định nghĩa các đối tượng truyền dữ liệu (Data Transfer Objects) cho domain |
| `entities/` | Các thực thể nghiệp vụ - đại diện cho các đối tượng trong domain |
| `enums/` | Các hằng số và enum định nghĩa trạng thái, loại dữ liệu |
| `exceptions/` | Các ngoại lệ nghiệp vụ cụ thể (VD: `UserNotFoundException`) |
| `services/` | Các dịch vụ domain như tính toán, chuyển đổi trạng thái |
| `helpers/` | Các hàm tiện ích hỗ trợ logic nghiệp vụ |
| `valueobjects/` | Các Value Objects - đối tượng bất biến đại diện cho giá trị |

---

## 2. Application Layer (Tầng Ứng Dụng)

📁 **Đường dẫn:** `src/<module>/application`

Tầng này **điều phối** các use case và logic ứng dụng. Đóng vai trò như một **orchestrator** giữa Presentation và Domain.

### Các thành phần:

### Commands (Lệnh ghi)
- Xử lý các thao tác **thay đổi dữ liệu** (Create, Update, Delete)
- Cấu trúc file:
  - Command: `{Entity}{Action}.command.ts`
  - Handler: `{Entity}{Action}.command.handler.ts`
- **Ví dụ:** `CreateUser.command.ts` → `CreateUser.command.handler.ts`

### Queries (Truy vấn đọc)
- Xử lý các thao tác **đọc dữ liệu** (Read, List, Search)
- Cấu trúc tương tự commands nhưng cho việc truy vấn
- **Ví dụ:** `GetUserById.query.ts` → `GetUserById.query.handler.ts`

### Event Handlers (Xử lý sự kiện)
- Xử lý các **sự kiện domain** được phát ra
- Tự động xử lý **side effects** khi events được trigger
- **Ví dụ:** `UserCreated.event.handler.ts`

---

## 3. Infrastructure Layer (Tầng Hạ Tầng)

📁 **Đường dẫn:** `src/<module>/infrastructure`

Tầng này cung cấp các **implementation cụ thể** cho các interface được định nghĩa ở Domain layer.

### Các thành phần:

| Thư mục | Mô tả |
|---------|-------|
| `repository/` | Implementation của Repository Pattern - tương tác với database |
| `entity/` | Các entity cho persistence (MongoDB schemas, TypeORM entities) |
| `query/` | Các query implementation cho việc đọc dữ liệu |
| `adaptor/` | Các adapter để tích hợp với hệ thống bên ngoài (API, Services) |

---

## 4. Presentation Layer (Tầng Giao Diện)

📁 **Đường dẫn:** `src/<module>/presentation`

Tầng giao diện với bên ngoài - nơi tiếp nhận và trả về response cho client.

### Các thành phần:

| Thư mục | Mô tả |
|---------|-------|
| `http/` | Các REST API endpoints (Controllers) |
| `dto/` | DTOs cho HTTP requests/responses |
| `decorators/` | Custom decorators cho presentation |

### Quy tắc:
- ❌ **Không chứa** logic nghiệp vụ
- ✅ Chỉ **delegate** cho commands/queries
- ✅ Xử lý validation input và format output

---

## Mối Tương Quan Giữa Các Tầng

### 1. Luồng Xử Lý Request

```
┌─────────────┐    ┌────────────┐    ┌─────────────────┐    ┌─────────┐    ┌────────────┐    ┌──────────┐
│ HTTP Request│───▶│ Controller │───▶│ Command/Query   │───▶│ Handler │───▶│ Repository │───▶│ Database │
└─────────────┘    └────────────┘    └─────────────────┘    └─────────┘    └────────────┘    └──────────┘
```

### 3. Hướng Phụ Thuộc (Dependency Direction)

```
┌──────────────┐
│ Presentation │ ──────┐
└──────────────┘       │
                       ▼
┌──────────────┐    ┌─────────────┐
│Infrastructure│───▶│ Application │
└──────────────┘    └─────────────┘
       │                   │
       │                   ▼
       │            ┌────────────┐
       └───────────▶│   Domain   │ ◀── Không phụ thuộc vào tầng nào
                    └────────────┘
```

**Nguyên tắc Dependency Inversion:**
- Presentation phụ thuộc vào Application
- Application phụ thuộc vào Domain
- Infrastructure **implement interfaces** từ Domain
- Domain **không phụ thuộc** vào tầng nào khác

---

## Các Pattern Được Sử Dụng

### CQRS Pattern (Command Query Responsibility Segregation)

| Đặc điểm | Mô tả |
|----------|-------|
| Tách biệt | Rõ ràng giữa Commands (ghi) và Queries (đọc) |
| Events | Commands có thể phát Events, Queries chỉ đọc dữ liệu |
| Handler riêng | Mỗi use case có handler riêng biệt |

### Repository Pattern

| Đặc điểm | Mô tả |
|----------|-------|
| Abstraction | Trừu tượng hóa việc truy cập dữ liệu |
| Interface | Domain định nghĩa interface, Infrastructure implement |
| Testable | Dễ dàng mock cho unit testing |

---

## Giao Tiếp Giữa Các Domain

### Quy Tắc Giao Tiếp

1. **gRPC cho đồng bộ (Synchronous)**
   - Các Domain Layers giao tiếp với nhau qua **gRPC**
   - ❌ Không inject trực tiếp Domain hoặc Repository của Domain khác
   - ✅ Sử dụng gRPC client để gọi service của Domain khác

2. **RabbitMQ cho bất đồng bộ (Asynchronous)**
   - Các Event không yêu cầu phản hồi ngay lập tức
   - Sử dụng **RabbitMQ** để đảm bảo message không bị mất
   - Phù hợp cho các tác vụ background, notifications

3. **Shadow-Model Pattern**
   - Có thể khai báo **Model B** trong **Domain A** chỉ để sử dụng cho việc **hiển thị**
   - ❌ Không có thao tác quản lý (CRUD) trên Shadow-Model
   - ✅ Chỉ dùng cho việc đọc và hiển thị dữ liệu liên quan

```
┌──────────────┐         gRPC          ┌──────────────┐
│   Domain A   │◀─────────────────────▶│   Domain B   │
└──────────────┘                       └──────────────┘
       │                                      │
       │           RabbitMQ (Events)          │
       └──────────────────────────────────────┘
```

---

## Ưu Điểm Của Kiến Trúc

| Ưu điểm | Giải thích |
|---------|------------|
| 🎯 **Tách biệt rõ ràng** | Mỗi tầng có trách nhiệm cụ thể, dễ hiểu và maintain |
| 🧪 **Dễ test** | Logic nghiệp vụ tách biệt khỏi infrastructure, dễ viết unit test |
| 📈 **Dễ mở rộng** | Event-driven cho phép thêm tính năng mà không ảnh hưởng code cũ |
| 🔧 **Maintainable** | CQRS giúp tối ưu hóa riêng cho read/write operations |
| 💼 **Domain-centric** | Logic nghiệp vụ được bảo vệ và tập trung ở Domain layer |
| 🔌 **Loose Coupling** | Các module độc lập, giao tiếp qua interface và events |

---

## Cấu Trúc Thư Mục Mẫu

```
src/
├── user/                          # User Module
│   ├── domain/                    # Tầng nghiệp vụ
│   │   ├── User.ts               # Entity chính
│   │   ├── UserFactory.ts        # Factory pattern
│   │   ├── UserRepository.ts     # Repository interface
│   │   ├── dtos/                 # DTOs
│   │   ├── enums/                # Enums
│   │   ├── exceptions/           # Business exceptions
│   │   ├── services/             # Domain services
│   │   └── valueobjects/         # Value objects
│   │
│   ├── application/               # Tầng ứng dụng
│   │   ├── command/              # Commands & Handlers
│   │   ├── query/                # Queries & Handlers
│   │   └── InjectionToken.ts     # DI tokens
│   │
│   ├── infrastructure/            # Tầng hạ tầng
│   │   ├── repository/           # Repository implementations
│   │   ├── entity/               # Persistence entities
│   │   └── query/                # Query implementations
│   │
│   ├── presentation/              # Tầng giao diện
│   │   └── http/                 # HTTP controllers & DTOs
│   │
│   └── UserModule.ts              # Module configuration
│
├── shared/                        # Shared resources
│   ├── domain/                   # Base entities, interfaces
│   ├── infrastructure/           # Shared infrastructure (Redis, gRPC)
│   ├── persistence/              # Base repository implementations
│   └── presentation/             # Shared DTOs, decorators
│
└── main.ts                        # Application entry point
```

---

## Quy Ước Đặt Tên File

| Loại file | Pattern | Ví dụ |
|-----------|---------|-------|
| Entity | `{Name}.ts` | `User.ts` |
| Factory | `{Name}Factory.ts` | `UserFactory.ts` |
| Repository Interface | `{Name}Repository.ts` | `UserRepository.ts` |
| Repository Impl | `{Name}RepositoryImpl.persistence.ts` | `UserRepositoryImpl.persistence.ts` |
| Command | `{Entity}{Action}.command.ts` | `CreateUser.command.ts` |
| Command Handler | `{Entity}{Action}.command.handler.ts` | `CreateUser.command.handler.ts` |
| Query | `{Entity}{Action}.query.ts` | `GetUserById.query.ts` |
| Query Handler | `{Entity}{Action}.query.handler.ts` | `GetUserById.query.handler.ts` |
| Controller | `{Name}.controller.ts` | `User.controller.ts` |
| DTO | `{Name}.dto.ts` | `CreateUser.dto.ts` |

---

## Kết Luận

Kiến trúc DDD + CQRS này mang lại sự **rõ ràng**, **linh hoạt** và **khả năng mở rộng** cao cho dự án. Bằng cách tuân thủ các nguyên tắc và quy ước đã được định nghĩa, team có thể:

- ✅ Phát triển các tính năng mới một cách độc lập
- ✅ Dễ dàng viết và maintain unit tests
- ✅ Giảm thiểu rủi ro khi thay đổi code
- ✅ Tái sử dụng logic nghiệp vụ across các channels khác nhau
