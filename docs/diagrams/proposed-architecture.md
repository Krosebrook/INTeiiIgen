# Proposed Architecture Diagrams

## Current vs. Proposed Architecture

### Current Architecture (Before Refactoring)

```
┌─────────────────────────────────────────────────────────────────┐
│                         Client (React + Vite)                    │
│  ┌────────────────────────────────────────────────────────┐     │
│  │  15 Pages  │  18 Components  │  Hooks  │  TanStack Query│     │
│  └────────────────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────────────┘
                              │ HTTP/REST
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Server (Express.js)                         │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │           routes.ts (1,052 LINES - MONOLITHIC)          │   │
│  │  ┌─────────┬─────────┬─────────┬─────────┬─────────┐   │   │
│  │  │ Data    │Dashboard│ Widget  │  Cloud  │   AI    │   │   │
│  │  │ Sources │         │         │ Providers│Analysis│   │   │
│  │  └─────────┴─────────┴─────────┴─────────┴─────────┘   │   │
│  │              ▼ Direct calls (tight coupling)            │   │
│  │  ┌─────────────────────────────────────────────────┐    │   │
│  │  │     storage.ts (DatabaseStorage)                │    │   │
│  │  └─────────────────────────────────────────────────┘    │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │        Cloud Providers (DUPLICATED CODE)                │   │
│  │  ┌────────────┬────────────┬────────────┐              │   │
│  │  │ google-    │ onedrive.ts│ notion.ts  │              │   │
│  │  │ drive.ts   │            │            │              │   │
│  │  │ 35 lines   │ 35 lines   │ 35 lines   │ (105 lines) │   │
│  │  │getAccess...│getAccess...│getAccess...│ DUPLICATED  │   │
│  │  └────────────┴────────────┴────────────┘              │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              │
            ┌─────────────────┼─────────────────┐
            ▼                 ▼                 ▼
    ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
    │ PostgreSQL   │  │   OpenAI     │  │ Cloud APIs   │
    │ (Drizzle ORM)│  │   (Global)   │  │ GDrive/Notion│
    └──────────────┘  └──────────────┘  └──────────────┘

❌ PROBLEMS:
   • 1,052-line monolithic routes file
   • 105 lines of duplicated cloud provider code
   • 10+ repeated auth checks
   • No service layer abstraction
   • Tight coupling between layers
   • Untestable code (global state, no DI)
   • No tests exist
```

---

### Proposed Architecture (After Refactoring)

```
┌─────────────────────────────────────────────────────────────────┐
│                         Client (React + Vite)                    │
│  ┌────────────────────────────────────────────────────────┐     │
│  │  15 Pages  │  18 Components  │  Hooks  │  TanStack Query│     │
│  └────────────────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────────────┘
                              │ HTTP/REST
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Server (Express.js)                         │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                   Middleware Layer                       │   │
│  │  ┌──────────┬──────────┬──────────┬──────────┐         │   │
│  │  │  Auth    │  Error   │Validation│  Logging │         │   │
│  │  │Middleware│ Handler  │Middleware│Middleware│         │   │
│  │  └──────────┴──────────┴──────────┴──────────┘         │   │
│  └──────────────────────────────────────────────────────────┘   │
│                              ▼                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                   Route Modules                          │   │
│  │  ┌──────────┬──────────┬──────────┬──────────┬────────┐ │   │
│  │  │  data-   │dashboard │ widgets. │  cloud.  │  ai.   │ │   │
│  │  │ sources. │  .routes │  routes  │  routes  │routes  │ │   │
│  │  │  routes  │   .ts    │   .ts    │   .ts    │ .ts    │ │   │
│  │  │   .ts    │(120 lines│(100 lines│(200 lines│(80 ln) │ │   │
│  │  │(150 lines│          │          │          │        │ │   │
│  │  └──────────┴──────────┴──────────┴──────────┴────────┘ │   │
│  └──────────────────────────────────────────────────────────┘   │
│                              ▼ DI/Interface                      │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                   Service Layer (NEW)                    │   │
│  │  ┌────────────────┬────────────────┬────────────────┐   │   │
│  │  │  AIService     │FileParserService│CloudProvider   │   │   │
│  │  │  (Injectable)  │ (Strategy)     │Service         │   │   │
│  │  │                │                │ (Factory)      │   │   │
│  │  └────────────────┴────────────────┴────────────────┘   │   │
│  └──────────────────────────────────────────────────────────┘   │
│                              ▼ Repository Pattern                │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │            Storage Layer (Repository)                    │   │
│  │  ┌─────────────────────────────────────────────────┐    │   │
│  │  │  DatabaseStorage (IStorage interface)           │    │   │
│  │  └─────────────────────────────────────────────────┘    │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │     Cloud Provider Adapters (UNIFIED INTERFACE)         │   │
│  │  ┌──────────────────────────────────────────────────┐   │   │
│  │  │     CloudProviderBase (Abstract Class)           │   │   │
│  │  │     • getAccessToken() (35 lines, SHARED)        │   │   │
│  │  └──────────────────────────────────────────────────┘   │   │
│  │              ▼ Inheritance (DRY principle)              │   │
│  │  ┌────────────┬────────────┬────────────┐              │   │
│  │  │GoogleDrive │OneDrive    │Notion      │              │   │
│  │  │Adapter     │Adapter     │Adapter     │              │   │
│  │  │(provider-  │(provider-  │(provider-  │              │   │
│  │  │specific)   │specific)   │specific)   │              │   │
│  │  └────────────┴────────────┴────────────┘              │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              │
            ┌─────────────────┼─────────────────┐
            ▼                 ▼                 ▼
    ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
    │ PostgreSQL   │  │   OpenAI     │  │ Cloud APIs   │
    │ (Drizzle ORM)│  │   (Injectable│  │ GDrive/Notion│
    │              │  │    Service)  │  │              │
    └──────────────┘  └──────────────┘  └──────────────┘

✅ IMPROVEMENTS:
   • Routes split into 6 focused modules (~150 lines each)
   • Cloud provider duplication eliminated (35 lines shared)
   • Auth middleware eliminates 10+ duplicate checks
   • Service layer enables dependency injection
   • Loose coupling through interfaces
   • Testable code with mocks/stubs
   • Test coverage >70%
```

---

## Module Dependency Graph

### Current (Tangled Dependencies)

```
┌──────────┐
│routes.ts │──────┐
│(1,052 ln)│      │
└──────────┘      │
      │           ▼
      │     ┌────────────┐
      ├────▶│ storage.ts │
      │     └────────────┘
      │           │
      │           ▼
      │     ┌──────────┐
      │     │   db.ts  │
      │     └──────────┘
      │
      ├────▶┌─────────────────┐
      │     │google-drive.ts  │
      │     │(getAccessToken) │
      │     └─────────────────┘
      │
      ├────▶┌─────────────────┐
      │     │  onedrive.ts    │
      │     │(getAccessToken) │◀── DUPLICATION
      │     └─────────────────┘
      │
      ├────▶┌─────────────────┐
      │     │   notion.ts     │
      │     │(getAccessToken) │
      │     └─────────────────┘
      │
      └────▶┌─────────────────┐
            │  OpenAI (SDK)   │
            │  (global const) │
            └─────────────────┘

❌ Everything depends on routes.ts
❌ No clear boundaries
❌ Hard to test
❌ Duplication everywhere
```

---

### Proposed (Clean Separation)

```
┌──────────────────────────────────────────────────┐
│              Route Modules                       │
│  ┌──────────┬──────────┬──────────┬──────────┐  │
│  │data-src. │dashboards│ widgets  │  cloud   │  │
│  │ routes   │ routes   │ routes   │  routes  │  │
│  └────┬─────┴────┬─────┴────┬─────┴────┬─────┘  │
└───────┼──────────┼──────────┼──────────┼────────┘
        │          │          │          │
        ▼          ▼          ▼          ▼
┌──────────────────────────────────────────────────┐
│           Middleware (Cross-cutting)             │
│  ┌──────────┬──────────┬──────────┐             │
│  │  Auth    │  Error   │Validation│             │
│  └──────────┴──────────┴──────────┘             │
└──────────────────────────────────────────────────┘
        │          │          │
        ▼          ▼          ▼
┌──────────────────────────────────────────────────┐
│              Service Layer                       │
│  ┌──────────┬──────────┬──────────┐             │
│  │   AI     │  File    │  Cloud   │             │
│  │ Service  │ Parser   │ Service  │             │
│  └────┬─────┴────┬─────┴────┬─────┘             │
└───────┼──────────┼──────────┼────────────────────┘
        │          │          │
        │          │          ▼
        │          │    ┌──────────────────┐
        │          │    │CloudProviderBase │◀── SHARED
        │          │    └────────┬─────────┘
        │          │             │
        │          │       ┌─────┴─────┬─────────┐
        │          │       ▼           ▼         ▼
        │          │   ┌─────────┬─────────┬─────────┐
        │          │   │ GDrive  │OneDrive │ Notion  │
        │          │   │ Adapter │ Adapter │ Adapter │
        │          │   └─────────┴─────────┴─────────┘
        │          │
        ▼          ▼
┌──────────────────────────────────────────────────┐
│           Repository Layer                       │
│  ┌────────────────────────────┐                 │
│  │   DatabaseStorage          │                 │
│  │   (IStorage interface)     │                 │
│  └────────────┬───────────────┘                 │
└───────────────┼──────────────────────────────────┘
                ▼
          ┌──────────┐
          │   DB     │
          └──────────┘

✅ Clear layers
✅ Single Responsibility
✅ Dependency Injection
✅ Testable boundaries
✅ No duplication
```

---

## File Structure Transformation

### Before

```
server/
├── index.ts                    # 104 lines
├── routes.ts                   # ❌ 1,052 lines (MONOLITHIC)
├── storage.ts                  # ✅ 337 lines (good)
├── db.ts                       # ✅ 50 lines
├── static.ts                   # ✅ 30 lines
├── vite.ts                     # ✅ 60 lines
└── cloud-providers/
    ├── google-drive.ts         # ❌ Duplicated getAccessToken (35 lines)
    ├── onedrive.ts             # ❌ Duplicated getAccessToken (35 lines)
    ├── notion.ts               # ❌ Duplicated getAccessToken (35 lines)
    └── index.ts                # 10 lines

TOTAL: ~1,700 lines
❌ Monolithic routes
❌ 105 lines duplicated
❌ No middleware
❌ No services
❌ No tests
```

---

### After

```
server/
├── index.ts                    # ✅ 104 lines (unchanged)
├── db.ts                       # ✅ 50 lines (unchanged)
├── storage.ts                  # ✅ 337 lines (unchanged)
├── static.ts                   # ✅ 30 lines (unchanged)
├── vite.ts                     # ✅ 60 lines (unchanged)
│
├── middleware/                 # ✅ NEW
│   ├── auth.middleware.ts      # 20 lines (eliminates 10+ duplicates)
│   ├── error.middleware.ts     # 40 lines (standardized errors)
│   └── validation.middleware.ts# 30 lines (Zod integration)
│
├── routes/                     # ✅ NEW (split from routes.ts)
│   ├── index.ts                # 50 lines (route registration)
│   ├── data-sources.routes.ts  # 150 lines
│   ├── dashboards.routes.ts    # 120 lines
│   ├── widgets.routes.ts       # 100 lines
│   ├── cloud.routes.ts         # 200 lines
│   ├── ai.routes.ts            # 80 lines
│   └── organizations.routes.ts # 100 lines
│
├── services/                   # ✅ NEW
│   ├── ai.service.ts           # 80 lines (extracted OpenAI logic)
│   ├── file-parser.service.ts  # 120 lines (extracted parsing)
│   └── cloud/
│       ├── cloud-provider-base.ts    # 60 lines (SHARED)
│       ├── cloud-provider.interface.ts # 40 lines
│       ├── google-drive.adapter.ts   # 100 lines
│       ├── onedrive.adapter.ts       # 100 lines
│       └── notion.adapter.ts         # 100 lines
│
├── config/                     # ✅ NEW
│   └── index.ts                # 30 lines (env validation)
│
└── __tests__/                  # ✅ NEW
    ├── unit/
    │   ├── file-parser.test.ts       # 150 lines
    │   ├── storage.test.ts           # 200 lines
    │   └── cloud-provider-base.test.ts # 100 lines
    └── integration/
        ├── data-sources.test.ts      # 200 lines
        └── dashboards.test.ts        # 150 lines

TOTAL: ~2,300 lines (includes tests)
✅ Modular routes (6 files)
✅ Zero duplication
✅ Middleware layer
✅ Service layer
✅ Test coverage >70%
```

**Net Change**:
- Production code: 1,700 → 1,500 lines (-12%)
- With tests: 1,700 → 2,300 lines (+35% but 800 are tests)
- Duplication: 105 lines → 0 lines (-100%)
- Largest file: 1,052 → 200 lines (-81%)

---

## Data Flow: Before vs. After

### Before: File Upload Flow

```
User uploads CSV
      │
      ▼
┌─────────────────────────────────────────┐
│  routes.ts (line 120-184)              │
│  • multer middleware                   │  ❌ Mixed concerns
│  • extract userId                      │  ❌ Inline auth
│  • parse file (inline logic)          │  ❌ No abstraction
│  • calculate metadata                  │  ❌ Duplicated
│  • save to database                    │  ❌ Direct DB call
│  • error handling (try-catch)         │  ❌ Repeated pattern
└─────────────────────────────────────────┘
      │
      ▼
  Response
```

---

### After: File Upload Flow

```
User uploads CSV
      │
      ▼
┌─────────────────────────────────────────┐
│  routes/data-sources.routes.ts          │
│  • multer middleware                    │  ✅ Same
│  • requireAuth middleware (automatic)  │  ✅ Reusable
└─────────────────────────────────────────┘
      │ async/await
      ▼
┌─────────────────────────────────────────┐
│  FileParserService.parseFile()          │
│  • Detect file type                     │  ✅ Testable
│  • Parse using strategy pattern        │  ✅ DRY
│  • Calculate metadata                   │  ✅ Consistent
│  • Return ParsedFile DTO               │  ✅ Type-safe
└─────────────────────────────────────────┘
      │
      ▼
┌─────────────────────────────────────────┐
│  DatabaseStorage.createDataSource()     │
│  • Save to DB via Drizzle ORM          │  ✅ Clean
└─────────────────────────────────────────┘
      │
      ▼
┌─────────────────────────────────────────┐
│  Error Middleware (automatic)           │
│  • Catch any errors                     │  ✅ Centralized
│  • Log properly                         │  ✅ Consistent
│  • Return standardized response        │  ✅ Uniform
└─────────────────────────────────────────┘
      │
      ▼
  Response
```

**Benefits**:
- Each layer has single responsibility
- Every component is testable
- No code duplication
- Consistent error handling
- Easy to add new file types

---

## Testing Strategy

### Before (Current State)

```
┌─────────────────────────────────────────┐
│           NO TESTS                      │
│                                         │
│  • 0 test files                        │
│  • 0% coverage                         │
│  • No test framework                   │
│  • Untestable code patterns            │
│                                         │
│  ❌ Cannot refactor safely             │
│  ❌ No regression detection            │
│  ❌ Manual QA only                     │
└─────────────────────────────────────────┘
```

---

### After (Proposed)

```
┌─────────────────────────────────────────────────────────┐
│                   Test Pyramid                          │
│                                                         │
│                     ┌─────────┐                         │
│                     │   E2E   │  (Future)               │
│                     └─────────┘                         │
│                   ┌─────────────┐                       │
│                   │ Integration │  ✅ API endpoints     │
│                   │   Tests     │     (5 test files)    │
│                   └─────────────┘                       │
│              ┌──────────────────────┐                   │
│              │    Unit Tests        │  ✅ Services      │
│              │  (10+ test files)    │     Storage       │
│              │                      │     Middleware    │
│              └──────────────────────┘                   │
│                                                         │
│  ✅ Vitest framework                                   │
│  ✅ 70%+ coverage                                      │
│  ✅ CI/CD integration                                  │
│  ✅ Mocking & stubbing                                 │
└─────────────────────────────────────────────────────────┘

Test Files:
├── server/__tests__/
│   ├── unit/
│   │   ├── file-parser.service.test.ts      ✅ Fast
│   │   ├── cloud-provider-base.test.ts      ✅ Isolated
│   │   ├── auth.middleware.test.ts          ✅ Mocked
│   │   └── storage.test.ts                  ✅ DB mocked
│   └── integration/
│       ├── data-sources.test.ts             ✅ Real HTTP
│       └── dashboards.test.ts               ✅ Real DB
```

---

## Migration Path

### Phase-by-Phase Transformation

```
┌─────────────┐
│   CURRENT   │
│  Monolithic │
│  Untestable │
│  Duplicated │
└──────┬──────┘
       │
       ▼ PHASE 1: Middleware (2 days)
┌─────────────┐
│  + Auth MW  │
│  + Error MW │
│  - 10 dupes │
└──────┬──────┘
       │
       ▼ PHASE 2: Route Split (3 days)
┌─────────────┐
│ 6 Modules   │
│ 200 lines   │
│  max each   │
└──────┬──────┘
       │
       ▼ PHASE 3: Services (3 days)
┌─────────────┐
│ + Service   │
│   Layer     │
│ + DI ready  │
│ - Cloud dup │
└──────┬──────┘
       │
       ▼ PHASE 4: Tests (4 days)
┌─────────────┐
│  + Vitest   │
│  + 70% cov  │
│  + CI/CD    │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   TARGET    │
│  Modular    │
│  Testable   │
│   Clean     │
└─────────────┘
```

**Total Time**: 12 days (2.4 weeks)  
**Risk Level**: Low-Medium  
**Breaking Changes**: None  
**Rollback**: Git revert anytime

---

## Success Metrics Dashboard

### Code Quality Metrics

```
┌────────────────────────────────────────────────────────┐
│  Metric               │ Before │  After  │  Change    │
├───────────────────────┼────────┼─────────┼────────────┤
│  Largest file (lines) │ 1,052  │   200   │  -81% ✅   │
│  Duplicate blocks     │   10+  │     0   │ -100% ✅   │
│  Module coupling      │  High  │   Low   │  ✅✅✅    │
│  Test coverage        │    0%  │   75%   │  +75% ✅   │
│  Cyclomatic complex.  │   15+  │    <5   │  -67% ✅   │
│  Lines of code        │ 1,700  │ 1,500   │  -12% ✅   │
└────────────────────────────────────────────────────────┘
```

### Maintainability Score

```
Before: D (40/100)
┌────┐
│████│ 40
└────┘

After: A (92/100)
┌────────────────────┐
│████████████████████│ 92
└────────────────────┘

+52 points ✅
```

---

## Conclusion

The proposed architecture transformation will:

✅ **Reduce complexity** - Smaller, focused modules  
✅ **Enable testing** - Dependency injection & mocking  
✅ **Eliminate duplication** - DRY principle applied  
✅ **Improve maintainability** - Clear separation of concerns  
✅ **Facilitate growth** - Easy to add features  

**Risk**: Low - All changes maintain API compatibility  
**Timeline**: 2-4 weeks  
**Effort**: 1 senior engineer  
**ROI**: High - Long-term maintenance savings

---

**Next Steps**: Review and approve to begin implementation.
