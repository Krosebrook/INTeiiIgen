# Implementation Checklist

This checklist provides a step-by-step guide for implementing the architecture improvements proposed in [ARCHITECTURE_IMPROVEMENT_PLAN.md](../ARCHITECTURE_IMPROVEMENT_PLAN.md).

**Status**: Awaiting approval to begin  
**Last Updated**: 2026-02-06

---

## Pre-Implementation

### Review & Approval
- [ ] Review [ARCHITECTURE_IMPROVEMENT_PLAN.md](../ARCHITECTURE_IMPROVEMENT_PLAN.md)
- [ ] Review [proposed-architecture.md](proposed-architecture.md)
- [ ] Review [ANALYSIS_SUMMARY.md](ANALYSIS_SUMMARY.md)
- [ ] Approve implementation phases (all or subset)
- [ ] Confirm timeline and resources
- [ ] Assign engineer(s) to project

### Setup
- [ ] Create feature branch: `feature/architecture-refactoring`
- [ ] Ensure development environment is working
- [ ] Run baseline checks (build, current functionality)
- [ ] Document current API behavior for validation
- [ ] Setup staging environment for testing

---

## Phase 1: Middleware & Utilities (Days 1-2)

### Estimated Time: 1-2 days

### 1.1 Auth Middleware
- [ ] Create `server/middleware/auth.middleware.ts`
- [ ] Implement `requireAuth()` function
- [ ] Add TypeScript types for `req.userId`
- [ ] Write unit tests for auth middleware
- [ ] Replace 10+ duplicate auth checks in routes.ts
- [ ] Test all authenticated endpoints
- [ ] Verify no regressions

**Files to modify**:
- `server/routes.ts` (10+ locations)

**Files to create**:
- `server/middleware/auth.middleware.ts`
- `server/middleware/__tests__/auth.middleware.test.ts`

### 1.2 Error Handling Middleware
- [ ] Create `server/middleware/error.middleware.ts`
- [ ] Implement `errorHandler()` function
- [ ] Implement `asyncHandler()` wrapper
- [ ] Write unit tests for error middleware
- [ ] Register error middleware in `server/index.ts`
- [ ] Update 5-10 routes to use `asyncHandler`
- [ ] Test error responses are consistent
- [ ] Verify error logging works

**Files to modify**:
- `server/index.ts`
- `server/routes.ts` (34+ try-catch blocks)

**Files to create**:
- `server/middleware/error.middleware.ts`
- `server/middleware/__tests__/error.middleware.test.ts`

### 1.3 Cloud Provider Base Class
- [ ] Create `server/services/cloud/cloud-provider-base.ts`
- [ ] Implement abstract `CloudProviderBase` class
- [ ] Move shared `getAccessToken()` logic to base class
- [ ] Update `google-drive.ts` to extend base class
- [ ] Update `onedrive.ts` to extend base class
- [ ] Update `notion.ts` to extend base class
- [ ] Write unit tests for base class
- [ ] Test all cloud provider operations
- [ ] Verify connection and file operations work

**Files to modify**:
- `server/cloud-providers/google-drive.ts`
- `server/cloud-providers/onedrive.ts`
- `server/cloud-providers/notion.ts`

**Files to create**:
- `server/services/cloud/cloud-provider-base.ts`
- `server/services/cloud/__tests__/cloud-provider-base.test.ts`

### 1.4 File Parser Service
- [ ] Create `server/services/file-parser.service.ts`
- [ ] Implement `FileParserService` class
- [ ] Move `parseCsv()` to service
- [ ] Move `parseExcel()` to service
- [ ] Add JSON parsing to service
- [ ] Create `ParsedFile` interface/type
- [ ] Write unit tests for each parser
- [ ] Update routes to use `FileParserService`
- [ ] Test file uploads with all formats (CSV, JSON, XLSX)
- [ ] Verify metadata generation works

**Files to modify**:
- `server/routes.ts` (6+ locations)

**Files to create**:
- `server/services/file-parser.service.ts`
- `server/services/__tests__/file-parser.service.test.ts`

### 1.5 Phase 1 Validation
- [ ] Run all manual tests
- [ ] Check API responses unchanged
- [ ] Verify error messages consistent
- [ ] Confirm no performance regression
- [ ] Review code with team
- [ ] Commit and push changes
- [ ] Deploy to staging
- [ ] Monitor for issues

---

## Phase 2: Route Modularization (Days 3-5)

### Estimated Time: 2-3 days

### 2.1 Setup Route Structure
- [ ] Create `server/routes/` directory
- [ ] Create `server/routes/index.ts` (main router)
- [ ] Setup route registration pattern
- [ ] Update `server/index.ts` to use new route structure

**Files to create**:
- `server/routes/index.ts`

**Files to modify**:
- `server/index.ts`

### 2.2 Data Sources Routes
- [ ] Create `server/routes/data-sources.routes.ts`
- [ ] Move 8 data source endpoints from routes.ts
- [ ] Apply `requireAuth` middleware
- [ ] Apply `asyncHandler` wrapper
- [ ] Test all data source endpoints
- [ ] Write integration tests

**Files to create**:
- `server/routes/data-sources.routes.ts`
- `server/routes/__tests__/data-sources.routes.test.ts`

### 2.3 Dashboards Routes
- [ ] Create `server/routes/dashboards.routes.ts`
- [ ] Move 6 dashboard endpoints from routes.ts
- [ ] Apply middleware
- [ ] Test all dashboard endpoints
- [ ] Write integration tests

**Files to create**:
- `server/routes/dashboards.routes.ts`
- `server/routes/__tests__/dashboards.routes.test.ts`

### 2.4 Widgets Routes
- [ ] Create `server/routes/widgets.routes.ts`
- [ ] Move 5 widget endpoints from routes.ts
- [ ] Apply middleware
- [ ] Test all widget endpoints
- [ ] Write integration tests

**Files to create**:
- `server/routes/widgets.routes.ts`
- `server/routes/__tests__/widgets.routes.test.ts`

### 2.5 Cloud Provider Routes
- [ ] Create `server/routes/cloud.routes.ts`
- [ ] Move 8 cloud provider endpoints from routes.ts
- [ ] Apply middleware
- [ ] Test all cloud endpoints
- [ ] Write integration tests

**Files to create**:
- `server/routes/cloud.routes.ts`
- `server/routes/__tests__/cloud.routes.test.ts`

### 2.6 AI Analysis Routes
- [ ] Create `server/routes/ai.routes.ts`
- [ ] Move 4 AI endpoints from routes.ts
- [ ] Apply middleware
- [ ] Test all AI endpoints
- [ ] Write integration tests

**Files to create**:
- `server/routes/ai.routes.ts`
- `server/routes/__tests__/ai.routes.test.ts`

### 2.7 Organizations Routes
- [ ] Create `server/routes/organizations.routes.ts`
- [ ] Move 4 organization endpoints from routes.ts
- [ ] Apply middleware
- [ ] Test all organization endpoints
- [ ] Write integration tests

**Files to create**:
- `server/routes/organizations.routes.ts`
- `server/routes/__tests__/organizations.routes.test.ts`

### 2.8 Cleanup
- [ ] Delete or archive old `server/routes.ts`
- [ ] Update all imports across codebase
- [ ] Verify no references to old routes.ts remain
- [ ] Update documentation

**Files to delete**:
- `server/routes.ts` (archived or deleted)

### 2.9 Phase 2 Validation
- [ ] Test all 35+ API endpoints
- [ ] Run integration tests
- [ ] Check response times unchanged
- [ ] Verify error handling consistent
- [ ] Review code structure with team
- [ ] Commit and push changes
- [ ] Deploy to staging
- [ ] Monitor for issues

---

## Phase 3: Service Layer (Days 6-8)

### Estimated Time: 2-3 days

### 3.1 Cloud Provider Interface
- [ ] Create `server/services/cloud/cloud-provider.interface.ts`
- [ ] Define `CloudProviderAdapter` interface
- [ ] Define `CloudFile` interface
- [ ] Define `CloudFileContent` interface
- [ ] Create `CloudProviderFactory` class

**Files to create**:
- `server/services/cloud/cloud-provider.interface.ts`
- `server/services/cloud/cloud-provider.factory.ts`

### 3.2 Cloud Provider Adapters
- [ ] Create `server/services/cloud/google-drive.adapter.ts`
- [ ] Implement `GoogleDriveAdapter` class
- [ ] Create `server/services/cloud/onedrive.adapter.ts`
- [ ] Implement `OneDriveAdapter` class
- [ ] Create `server/services/cloud/notion.adapter.ts`
- [ ] Implement `NotionAdapter` class
- [ ] Write unit tests for each adapter
- [ ] Update routes to use factory pattern

**Files to create**:
- `server/services/cloud/google-drive.adapter.ts`
- `server/services/cloud/onedrive.adapter.ts`
- `server/services/cloud/notion.adapter.ts`
- `server/services/cloud/__tests__/adapters.test.ts`

**Files to modify**:
- `server/routes/cloud.routes.ts`

### 3.3 AI Service
- [ ] Create `server/services/ai.service.ts`
- [ ] Implement `AIService` class
- [ ] Move OpenAI client to service
- [ ] Add `analyzeDataSource()` method
- [ ] Add `generateSuggestions()` method
- [ ] Make service injectable
- [ ] Write unit tests with mocked OpenAI
- [ ] Update AI routes to use service

**Files to create**:
- `server/services/ai.service.ts`
- `server/services/__tests__/ai.service.test.ts`

**Files to modify**:
- `server/routes/ai.routes.ts`

### 3.4 Service Integration
- [ ] Update routes to use dependency injection
- [ ] Create service instances in route modules
- [ ] Test all service integrations
- [ ] Verify services can be mocked for testing

### 3.5 Phase 3 Validation
- [ ] Run all tests (unit + integration)
- [ ] Verify services are testable
- [ ] Check cloud operations work
- [ ] Verify AI analysis works
- [ ] Review code quality
- [ ] Commit and push changes
- [ ] Deploy to staging
- [ ] Monitor for issues

---

## Phase 4: Testing Infrastructure (Days 9-12)

### Estimated Time: 3-4 days

### 4.1 Setup Vitest
- [ ] Install Vitest: `npm install -D vitest @vitest/coverage-v8`
- [ ] Create `vitest.config.ts`
- [ ] Add test scripts to `package.json`
- [ ] Configure path aliases for tests
- [ ] Create test utilities directory
- [ ] Setup test database (if needed)

**Files to create**:
- `vitest.config.ts`

**Files to modify**:
- `package.json`

### 4.2 Unit Tests - Services
- [ ] Test `FileParserService` (all formats)
- [ ] Test `AIService` (mocked OpenAI)
- [ ] Test `CloudProviderBase` (auth logic)
- [ ] Test each cloud provider adapter
- [ ] Aim for 80%+ coverage on services

**Tests to create**:
- `server/services/__tests__/file-parser.service.test.ts`
- `server/services/__tests__/ai.service.test.ts`
- `server/services/cloud/__tests__/cloud-provider-base.test.ts`
- `server/services/cloud/__tests__/adapters.test.ts`

### 4.3 Unit Tests - Middleware
- [ ] Test `requireAuth` middleware
- [ ] Test `errorHandler` middleware
- [ ] Test `asyncHandler` wrapper
- [ ] Aim for 90%+ coverage on middleware

**Tests to create**:
- `server/middleware/__tests__/auth.middleware.test.ts`
- `server/middleware/__tests__/error.middleware.test.ts`

### 4.4 Unit Tests - Storage
- [ ] Test `DatabaseStorage` class (mocked DB)
- [ ] Test data source operations
- [ ] Test dashboard operations
- [ ] Test widget operations
- [ ] Test organization operations
- [ ] Aim for 70%+ coverage on storage

**Tests to create**:
- `server/__tests__/storage.test.ts`

### 4.5 Integration Tests - API Endpoints
- [ ] Test data source endpoints (auth + no auth)
- [ ] Test dashboard endpoints
- [ ] Test widget endpoints
- [ ] Test cloud provider endpoints
- [ ] Test AI analysis endpoints
- [ ] Test organization endpoints
- [ ] Aim for 70%+ coverage on routes

**Tests to create**:
- `server/__tests__/integration/data-sources.test.ts`
- `server/__tests__/integration/dashboards.test.ts`
- `server/__tests__/integration/widgets.test.ts`
- `server/__tests__/integration/cloud.test.ts`
- `server/__tests__/integration/ai.test.ts`
- `server/__tests__/integration/organizations.test.ts`

### 4.6 CI/CD Integration
- [ ] Create `.github/workflows/test.yml` (if not exists)
- [ ] Configure test workflow
- [ ] Add coverage reporting
- [ ] Add badge to README
- [ ] Test CI/CD pipeline

**Files to create/modify**:
- `.github/workflows/test.yml`

### 4.7 Phase 4 Validation
- [ ] Run full test suite: `npm test`
- [ ] Check coverage: `npm run test:coverage`
- [ ] Verify 70%+ overall coverage
- [ ] All tests passing
- [ ] CI/CD pipeline working
- [ ] Coverage report generated
- [ ] Commit and push changes
- [ ] Deploy to staging
- [ ] Monitor for issues

---

## Post-Implementation

### Final Validation
- [ ] Run full test suite (all tests passing)
- [ ] Check test coverage (70%+ achieved)
- [ ] Run build: `npm run build`
- [ ] Test all API endpoints manually
- [ ] Verify no performance regression
- [ ] Check error handling works
- [ ] Test file uploads (CSV, JSON, XLSX)
- [ ] Test cloud provider integrations
- [ ] Test AI analysis features
- [ ] Test dashboard creation and widgets

### Code Quality Checks
- [ ] Run TypeScript check: `npm run check`
- [ ] Verify no linting errors
- [ ] Check code formatting
- [ ] Review all new files
- [ ] Verify no commented-out code
- [ ] Check for TODO comments

### Documentation
- [ ] Update README with test instructions
- [ ] Document new service layer
- [ ] Update API documentation
- [ ] Add architecture diagrams to docs
- [ ] Document testing strategy
- [ ] Update contribution guidelines

### Deployment
- [ ] Merge feature branch to main
- [ ] Tag release version
- [ ] Deploy to production
- [ ] Monitor application logs
- [ ] Monitor error rates
- [ ] Monitor performance metrics
- [ ] Verify all features working

### Post-Deployment
- [ ] Monitor for 24-48 hours
- [ ] Check for any issues
- [ ] Gather feedback
- [ ] Address any bugs
- [ ] Document lessons learned
- [ ] Celebrate success! 🎉

---

## Success Metrics

### Code Quality ✅
- [ ] Largest file < 300 lines (target: 200)
- [ ] Duplicate code blocks < 5 (target: 0)
- [ ] Cyclomatic complexity < 10
- [ ] Total lines reduced by 12%

### Testing ✅
- [ ] Test coverage > 70% (target: 75%)
- [ ] All unit tests passing
- [ ] All integration tests passing
- [ ] CI/CD pipeline working

### Modularity ✅
- [ ] Routes split into 6 modules
- [ ] Service layer implemented
- [ ] Clear separation of concerns
- [ ] Dependency injection enabled

### Performance ✅
- [ ] No response time regression
- [ ] Memory usage stable
- [ ] Error rates unchanged or lower
- [ ] All features working

---

## Rollback Plan

If issues arise during implementation:

1. **Immediate Issues**: Revert last commit(s)
2. **Phase Issues**: Rollback to previous phase
3. **Critical Issues**: Rollback entire feature branch
4. **Process**: 
   ```bash
   git revert <commit-hash>
   git push origin <branch>
   ```

**Safety Net**: All changes are incremental and reversible

---

## Notes & Observations

### During Implementation
- Document any challenges encountered
- Note any deviation from plan
- Track actual time vs. estimated time
- Record any additional improvements discovered

### Post-Implementation
- What went well?
- What could be improved?
- Any unexpected issues?
- Recommendations for next time?

---

**Last Updated**: 2026-02-06  
**Status**: Ready to begin (awaiting approval)  
**Estimated Timeline**: 2-4 weeks (12 working days)
