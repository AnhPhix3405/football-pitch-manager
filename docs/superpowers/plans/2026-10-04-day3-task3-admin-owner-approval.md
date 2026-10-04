# [BE] Admin Approve/Reject Owner Registration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans (recommended for consistency across controllers) or superpowers:subagent-driven-development to implement this plan task-by-task. Track progress using checkbox (`- [ ]`) syntax and run verification tests after each step.

**Goal:** Build the backend API for Admins to view, review, approve, and reject owner registration requests with transactional role promotion and status updates.

**Architecture:** A dedicated NestJS feature module `AdminApprovalModule` under `apps/backend/src/components/admin-approval/` with Clean Architecture layers (Controller $\rightarrow$ Service $\rightarrow$ Repository). Multi-table updates (`approval_requests`, `owner_profiles`, `users`) execute within an atomic PostgreSQL transaction managed via TypeORM `DataSource.transaction`.

**Tech Stack:** NestJS, TypeScript, TypeORM, PostgreSQL, Jest, Swagger OpenAPI, class-validator, class-transformer.

**Spec:** [UC-08-admin-approval.md](file:///C:/PROJECTS/football-pitch-manager/task-management/be/uc-list/UC-08-admin-approval.md), [UC-02-owner-field (1).md](file:///C:/PROJECTS/football-pitch-manager/task-management/be/uc-list/UC-02-owner-field%20%281%29.md), and [AGENTS.md](file:///C:/PROJECTS/football-pitch-manager/apps/backend/AGENTS.md).

---

## Global Constraints

- Keep strict TypeScript enabled with explicit return types on public methods.
- Every API endpoint must be guarded by `JwtAuthGuard`, `AccountStatusGuard`, and `RolesGuard` enforcing `@Roles('admin')` and `@AllowedStatuses('active')`.
- All multi-write operations must execute in a single database transaction via `DataSource.transaction`.
- When approving: `approval_requests.status = 'approved'`, `reviewed_by = admin.id`, `reviewed_at = NOW()`, `owner_profiles.verified_at = NOW()`, `users.role = 'owner'`.
- When rejecting: `approval_requests.status = 'rejected'`, `reviewed_by = admin.id`, `reviewed_at = NOW()`, `note = reason`, `users.role` remains `'user'`.
- Request DTOs and Response DTOs must live in separate files with complete `@ApiProperty` decorators.
- All error and success responses must use standard i18n message keys in `src/i18n/{en,vi}/{error,success}.json`.

---

## Review Focus

1. **Already Processed Request:** Attempting to approve or reject a request that is already `approved` or `rejected` must throw `400 Bad Request` with code `APPROVAL_REQUEST_ALREADY_PROCESSED`.
2. **Missing Target Profile or User:** If an approval request has an orphaned `target_id` or `requested_by`, the transaction must abort and return `404 Not Found`.
3. **Admin Self-Review & Permission Integrity:** A non-admin user (e.g. `user` or `owner`) attempting to access any admin approval endpoint must be blocked with `403 Forbidden` (`FORBIDDEN_ROLE`).
4. **Mandatory Rejection Reason:** When rejecting an owner registration, the rejection note/reason must not be empty or whitespace-only (`400 Bad Request` / validation error).
5. **Pagination Invariant:** Listing approval requests with page and limit must return valid metadata (`page`, `limit`, `total`, `totalPages`) and preserve sort order `createdAt DESC`.

---

## File Structure

```text
apps/backend/src/
├── components/
│   └── admin-approval/
│       ├── controllers/
│       │   ├── admin-owner-approval.controller.ts
│       │   └── admin-owner-approval.controller.spec.ts
│       ├── dto/
│       │   ├── admin-owner-approval-query.dto.ts
│       │   ├── admin-approve-owner.dto.ts
│       │   ├── admin-reject-owner.dto.ts
│       │   ├── admin-owner-approval-detail-response.dto.ts
│       │   └── admin-owner-approval-list-response.dto.ts
│       ├── services/
│       │   ├── admin-owner-approval.service.ts
│       │   └── admin-owner-approval.service.spec.ts
│       └── admin-approval.module.ts
├── repositories/
│   └── approval-request.repository.ts (extended with admin queries)
├── i18n/
│   ├── en/
│   │   ├── error.json
│   │   └── success.json
│   └── vi/
│       ├── error.json
│       └── success.json
└── app.module.ts (registers AdminApprovalModule)
```

---

## Task Breakdown

### Task 1: Repository Extensions & i18n Error/Success Codes

**Files:**
- Modify: `apps/backend/src/repositories/approval-request.repository.ts`
- Modify: `apps/backend/src/i18n/en/error.json`
- Modify: `apps/backend/src/i18n/vi/error.json`
- Modify: `apps/backend/src/i18n/en/success.json`
- Modify: `apps/backend/src/i18n/vi/success.json`

**Interfaces:**
- Consumes: `ApprovalRequestEntity`, `UserEntity`, `OwnerProfileEntity`, `UserProfileEntity`
- Produces:
  - `ApprovalRequestRepository.findOwnerRegistrations(options: { status?: string; page?: number; limit?: number }): Promise<{ items: ApprovalRequestEntity[]; total: number; page: number; limit: number }>`
  - `ApprovalRequestRepository.findOwnerRegistrationById(id: string): Promise<ApprovalRequestEntity | null>`

- [ ] **Step 1: Update i18n dictionaries with approval error & success keys**
  Add `approvalRequestNotFound`, `approvalRequestAlreadyProcessed`, `rejectionReasonRequired` to `error.json`.
  Add `ownerApprovalApproved`, `ownerApprovalRejected` to `success.json`.

- [ ] **Step 2: Add query methods to `ApprovalRequestRepository`**
  Implement `findOwnerRegistrations` using QueryBuilder with `type = 'owner_register'`, optional status filter, joined requester and target relations, ordering by `createdAt DESC`, and pagination.
  Implement `findOwnerRegistrationById` to fetch a single request by ID with relations.

- [ ] **Step 3: Verify repository compilation**
  Run: `pnpm --filter backend exec tsc --noEmit`
  Expected: PASS with no type errors.

- [ ] **Step 4: Commit**
  ```bash
  git add apps/backend/src/repositories/approval-request.repository.ts apps/backend/src/i18n/
  git commit -m "feat(backend): add admin approval query methods and i18n keys"
  ```

---

### Task 2: Data Transfer Objects (DTOs) for Admin Owner Approvals

**Files:**
- Create: `apps/backend/src/components/admin-approval/dto/admin-owner-approval-query.dto.ts`
- Create: `apps/backend/src/components/admin-approval/dto/admin-approve-owner.dto.ts`
- Create: `apps/backend/src/components/admin-approval/dto/admin-reject-owner.dto.ts`
- Create: `apps/backend/src/components/admin-approval/dto/admin-owner-approval-detail-response.dto.ts`
- Create: `apps/backend/src/components/admin-approval/dto/admin-owner-approval-list-response.dto.ts`

**Interfaces:**
- Consumes: `class-validator`, `class-transformer`, `@nestjs/swagger`
- Produces:
  - `AdminOwnerApprovalQueryDto`: `status?: string`, `page?: number = 1`, `limit?: number = 10`
  - `AdminApproveOwnerDto`: `note?: string`
  - `AdminRejectOwnerDto`: `reason: string` (required, non-empty)
  - `AdminOwnerApprovalDetailResponseDto`: Full request details + requester info + owner profile info + reviewer info
  - `AdminOwnerApprovalListResponseDto`: Paginated list response wrapper

- [ ] **Step 1: Create Request Query DTO `admin-owner-approval-query.dto.ts`**
  Include `status` (optional enum/string: `pending`, `approved`, `rejected`), `page` (positive int, default 1), `limit` (positive int $\le 100$, default 10) with `@Type(() => Number)` and validation decorators.

- [ ] **Step 2: Create Action DTOs `admin-approve-owner.dto.ts` and `admin-reject-owner.dto.ts`**
  `AdminApproveOwnerDto` with `@IsOptional() @IsString() note?: string`.
  `AdminRejectOwnerDto` with `@IsNotEmpty() @IsString() @MaxLength(500) reason!: string`.

- [ ] **Step 3: Create Response DTOs `admin-owner-approval-detail-response.dto.ts` and `admin-owner-approval-list-response.dto.ts`**
  Declare nested summary DTOs for requester (`id`, `email`, `phone`, `fullName`), target owner profile (`id`, `businessName`, `businessLicense`, `bankAccount`, `verifiedAt`), and reviewer (`id`, `email`).
  Define list wrapper with `items`, `total`, `page`, `limit`, `totalPages`.

- [ ] **Step 4: Verify DTO compilation**
  Run: `pnpm --filter backend exec tsc --noEmit`
  Expected: PASS

- [ ] **Step 5: Commit**
  ```bash
  git add apps/backend/src/components/admin-approval/dto/
  git commit -m "feat(admin-approval): define request and response DTOs"
  ```

---

### Task 3: Admin Owner Approval Service & Unit Tests (TDD)

**Files:**
- Create: `apps/backend/src/components/admin-approval/services/admin-owner-approval.service.ts`
- Create: `apps/backend/src/components/admin-approval/services/admin-owner-approval.service.spec.ts`

**Interfaces:**
- Consumes: `ApprovalRequestRepository`, `OwnerProfileRepository`, `UserRepository`, `DataSource`
- Produces:
  - `AdminOwnerApprovalService.getOwnerApprovals(query: AdminOwnerApprovalQueryDto): Promise<AdminOwnerApprovalListResponseDto>`
  - `AdminOwnerApprovalService.getOwnerApprovalDetail(requestId: string): Promise<AdminOwnerApprovalDetailResponseDto>`
  - `AdminOwnerApprovalService.approveOwnerRegistration(requestId: string, adminUserId: string, dto: AdminApproveOwnerDto): Promise<AdminOwnerApprovalDetailResponseDto>`
  - `AdminOwnerApprovalService.rejectOwnerRegistration(requestId: string, adminUserId: string, dto: AdminRejectOwnerDto): Promise<AdminOwnerApprovalDetailResponseDto>`

- [ ] **Step 1: Write failing unit test suite `admin-owner-approval.service.spec.ts`**
  Test cases to cover:
  1. `getOwnerApprovals`: returns paginated items and total pages.
  2. `getOwnerApprovalDetail`: throws 404 when request not found; returns mapped detail when found.
  3. `approveOwnerRegistration`:
     - Throws 404 when request not found.
     - Throws 400 when request is not in `pending` status (`APPROVAL_REQUEST_ALREADY_PROCESSED`).
     - Executes transaction: updates request to `approved`, updates `owner_profiles.verifiedAt`, updates `users.role = 'owner'`.
     - Returns updated approval detail.
  4. `rejectOwnerRegistration`:
     - Throws 404 when request not found.
     - Throws 400 when request is not `pending`.
     - Executes transaction: updates request to `rejected` with reviewer and note/reason; leaves user role as `user`.
     - Returns updated approval detail.

- [ ] **Step 2: Run test to verify it fails**
  Run: `pnpm --filter backend test admin-owner-approval.service.spec.ts`
  Expected: FAIL with "Cannot find module admin-owner-approval.service".

- [ ] **Step 3: Implement `AdminOwnerApprovalService` in `admin-owner-approval.service.ts`**
  Implement dependency injection of `ApprovalRequestRepository`, `OwnerProfileRepository`, `UserRepository`, and `DataSource`.
  Implement methods using `DataSource.transaction` for atomic multi-entity updates and proper `ApplicationException` mappings.

- [ ] **Step 4: Run test to verify it passes**
  Run: `pnpm --filter backend test admin-owner-approval.service.spec.ts`
  Expected: PASS (all test cases green).

- [ ] **Step 5: Commit**
  ```bash
  git add apps/backend/src/components/admin-approval/services/
  git commit -m "feat(admin-approval): implement AdminOwnerApprovalService with unit tests"
  ```

---

### Task 4: Admin Owner Approval Controller, Module & Integration Tests

**Files:**
- Create: `apps/backend/src/components/admin-approval/controllers/admin-owner-approval.controller.ts`
- Create: `apps/backend/src/components/admin-approval/controllers/admin-owner-approval.controller.spec.ts`
- Create: `apps/backend/src/components/admin-approval/admin-approval.module.ts`
- Modify: `apps/backend/src/app.module.ts`

**Interfaces:**
- Consumes: `AdminOwnerApprovalService`, `JwtAuthGuard`, `AccountStatusGuard`, `RolesGuard`, `@Roles('admin')`, `@AllowedStatuses('active')`, `@CurrentUser()`
- Produces:
  - `GET /admin/owner-approvals`: list requests
  - `GET /admin/owner-approvals/:id`: request detail
  - `POST /admin/owner-approvals/:id/approve`: approve owner
  - `POST /admin/owner-approvals/:id/reject`: reject owner

- [ ] **Step 1: Write failing controller unit test suite `admin-owner-approval.controller.spec.ts`**
  Verify route invocations, parameter extraction (`@Query()`, `@Param('id')`, `@CurrentUser('id')`, `@Body()`), and HTTP response wrapping.

- [ ] **Step 2: Run test to verify it fails**
  Run: `pnpm --filter backend test admin-owner-approval.controller.spec.ts`
  Expected: FAIL with "Cannot find module admin-owner-approval.controller".

- [ ] **Step 3: Implement `AdminOwnerApprovalController`**
  Add Swagger annotations (`@ApiTags('Admin Owner Approvals')`, `@ApiBearerAuth()`, `@ApiOperation()`, `@ApiResponse()`).
  Apply `@UseGuards(JwtAuthGuard, AccountStatusGuard, RolesGuard)`, `@Roles('admin')`, `@AllowedStatuses('active')`.

- [ ] **Step 4: Wire `AdminApprovalModule` into `app.module.ts`**
  Create `admin-approval.module.ts` registering entities (`ApprovalRequestEntity`, `OwnerProfileEntity`, `UserEntity`, `UserProfileEntity`), repositories, service, controller. Import into `app.module.ts`.

- [ ] **Step 5: Run tests and verify all pass**
  Run: `pnpm --filter backend test admin-owner-approval.controller.spec.ts`
  Run: `pnpm --filter backend test`
  Expected: PASS (all unit tests in backend pass).

- [ ] **Step 6: Commit**
  ```bash
  git add apps/backend/src/components/admin-approval/ apps/backend/src/app.module.ts
  git commit -m "feat(admin-approval): add AdminOwnerApprovalController and register module"
  ```

---

### Task 5: Postman Test Suite, Setup Guide & Cleanup Script

**Files:**
- Create: `task-management/be/day3/task3/test/task3-admin-owner-approval.postman_collection.json`
- Create: `task-management/be/day3/task3/test/setup-guide.md`
- Create: `task-management/be/day3/task3/test/cleanup.sql`
- Create: `task-management/be/day3/task3/task3-plan.md`

- [ ] **Step 1: Create Postman test collection with automated assertions**
  Structure folders:
  - `00 - Setup`: Login Admin, Register Normal User, Submit Owner Registration.
  - `01 - List & Filter Approvals`: `GET /admin/owner-approvals` (default, status=pending, status=approved).
  - `02 - Get Detail`: `GET /admin/owner-approvals/:id`.
  - `03 - Approval Flow`: `POST /admin/owner-approvals/:id/approve` (verify status=approved, user promoted to role=owner, profile verifiedAt is set).
  - `04 - Rejection Flow`: Register 2nd user, Submit registration, `POST /admin/owner-approvals/:id/reject` with reason (verify status=rejected, user remains role=user).
  - `05 - Edge Cases & Security`: Non-admin attempt (expect 403), Non-existent ID (expect 404), Already processed request (expect 400), Rejection without reason (expect 400).

- [ ] **Step 2: Create `setup-guide.md` and `cleanup.sql`**
  Document step-by-step verification instructions and SQL cleanup statements for `approval_requests`, `owner_profiles`, and test `users`.

- [ ] **Step 3: Mirror implementation plan to `task-management/be/day3/task3/task3-plan.md`**
  Save the technical plan in the project's task management directory.

- [ ] **Step 4: Run full build and test verification**
  Run: `pnpm --filter backend test`
  Run: `pnpm --filter backend build`
  Expected: PASS (0 errors, clean build).

- [ ] **Step 5: Commit**
  ```bash
  git add task-management/be/day3/task3/
  git commit -m "docs(day3-task3): add test suite, setup guide and task plan"
  ```
