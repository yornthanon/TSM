# Phase 0 — Tenant Isolation Test Plan

## គោលបំណង

បញ្ជាក់ថា User ម្នាក់មិនអាចអាន បង្កើត កែប្រែ ឬលុបទិន្នន័យក្នុង workspace របស់ User ម្នាក់ទៀតបានទេ។ ការការពារត្រូវធ្វើនៅ **backend/database query layer** មិនមែនពឹងតែ frontend route guard ឬការលាក់ menu ទេ។

## គោលការណ៍សុវត្ថិភាព

- `USER` និង `TENANT_ADMIN` ត្រូវបានកំណត់ទៅ `tenant_id` ពី JWT ដែល backend បាន sign។
- `X-Tenant-Id` ពី client មិនអាចប្តូរ tenant របស់ regular user បានទេ។
- Hibernate `tenantFilter` ត្រូវបានបើករាល់ request មុន controller/query រត់។
- `ADMIN` អាចមើល global data បាន នៅពេលមិនជ្រើស workspace។
- `ADMIN` អាចជ្រើស workspace ជាក់លាក់សម្រាប់ audited act-as/scoped operation។
- Internal service call ត្រូវមាន `X-Internal-Token` និង `X-Tenant-Id` ត្រឹមត្រូវ។
- Request ទៅ protected API ដែលគ្មាន credentials ត្រូវទទួល `401`។
- User ដែលគ្មាន workspace ត្រូវទទួល `403`។

## Layer ដែលត្រូវ test

### 1. Unit/security filter test

Test ដោយ mock `EntityManager` និង Hibernate `Session` ដើម្បីបញ្ជាក់ថា៖

- JWT tenant របស់ user ត្រូវបានប្រើជំនួស header ដែលបន្លំ។
- filter parameter ត្រូវបាន set ទៅ tenant ត្រឹមត្រូវ។
- context ត្រូវបាន clear បន្ទាប់ពី request ដើម្បីមិនឱ្យ tenant មួយ leak ទៅ request បន្ទាប់។

### 2. Service authorization test

បញ្ជាក់ថា៖

- Admin endpoint ត្រូវការ `ADMIN`។
- Mutation របស់ event/order ត្រូវការ `TENANT_ADMIN` ឬ `ADMIN`។
- Internal endpoint ត្រូវការ internal token។

### 3. QA database/API test

ប្រើ database/workspace ដាច់ដោយឡែកពី production ហើយបង្កើត៖

| Account | Role | Workspace |
|---|---|---:|
| User A | `TENANT_ADMIN` | 101 |
| User B | `TENANT_ADMIN` | 202 |
| Platform Admin | `ADMIN` | global |

បង្កើត event/ticket/order សម្រាប់ A និង B ដោយដាក់ឈ្មោះងាយស្គាល់ ដូចជា `QA-A-event` និង `QA-B-event`។

## Test matrix

### A. Positive isolation tests

| Test | Request | Expected |
|---|---|---|
| A reads own events | User A → `GET /api/v1/events` | ឃើញតែ `tenant_id=101` |
| B reads own events | User B → `GET /api/v1/events` | ឃើញតែ `tenant_id=202` |
| A reads own ticket | User A → `GET /api/v1/tickets/{A_TICKET_ID}` | `200` |
| B reads A ticket | User B → `GET /api/v1/tickets/{A_TICKET_ID}` | `404`/empty result, មិនបង្ហាញ row |
| A reads B order | User A → `GET /api/v1/orders/{B_ORDER_ID}` | `404`/not found |
| A dashboard stats | User A → `GET /api/v1/events/stats` | រាប់តែ workspace 101 |

### B. Header tampering tests

| Test | Request | Expected |
|---|---|---|
| User A spoofs B | JWT tenant 101 + `X-Tenant-Id: 202` | នៅតែ query tenant 101 |
| User B spoofs A | JWT tenant 202 + `X-Tenant-Id: 101` | នៅតែ query tenant 202 |
| Invalid header | User JWT + `X-Tenant-Id: abc` | header ត្រូវ ignore សម្រាប់ regular user ឬ request មិនអាចប្តូរ scope បាន |
| Admin selects workspace | Admin JWT + `X-Tenant-Id: 202` | scoped view ទៅ workspace 202 តែតាម admin permission |

### C. Write and mutation tests

| Test | Expected |
|---|---|
| A creates event | row ត្រូវបានរក្សាទុកជា `tenant_id=101` ទោះ client មិនផ្ញើ tenant id |
| A tries to update B event | `404`/`403`; B event មិនប្រែប្រួល |
| A tries to delete B event | `404`/`403`; B event នៅដដែល |
| A tries to update B ticket | `404`/`403`; B ticket នៅដដែល |
| Regular user calls admin users API | `403` |
| Regular user deletes another user | `403`; no user is deleted |

### D. Authentication and direct-service tests

| Test | Expected |
|---|---|
| No Authorization header → protected API | `401` |
| Invalid JWT signature | `401` |
| Valid JWT without `tenant_id` for regular user | `403` |
| Direct request to event/ticket/order service | ត្រូវបាន tenant filter និង auth ដូច gateway route |
| Internal request without `X-Tenant-Id` | `403` |
| Internal request with invalid token | `401` |

### E. Admin visibility tests

| Test | Expected |
|---|---|
| Admin global events | អាចមើល A និង B data នៅ global view |
| Admin global users | អាចមើល user/workspace directory |
| Admin scoped to A | ឃើញតែ A data ក្នុង scoped operation |
| Admin act-as B | ប្តូរទៅ B scope មាន audit record និង expiry |
| User attempts act-as | `403` |

## Automated test command

នៅក្នុង repository root:

```bash
export JAVA_HOME=/usr/lib/jvm/java-21-openjdk-amd64
export PATH="$JAVA_HOME/bin:$PATH"
./mvnw -pl common \
  -Dtest=TenantScopeSecurityFilterTest,ServiceRoleAuthorizationFilterTest \
  test
```

លទ្ធផលដែលបាន verify នៅថ្ងៃទី 2026-10-06៖

```text
TenantScopeSecurityFilterTest: 8 tests passed
ServiceRoleAuthorizationFilterTest: 9 tests passed
Total: 17 tests, 0 failures
```

## Implementation coverage ដែលបាន verify

`TenantScopeSecurityFilterTest` បញ្ជាក់៖

1. User token tenant 42 នៅតែ query tenant 42 ទោះ client ផ្ញើ `X-Tenant-Id: 99`។
2. User គ្មាន tenant ត្រូវបាន reject ជា `403`។
3. Admin គ្មាន selected workspace អាច global view បាន។
4. Admin អាចជ្រើស workspace ជាក់លាក់តាម `X-Tenant-Id`។
5. Internal request គ្មាន tenant ត្រូវបាន reject។
6. Internal request មាន trusted token និង tenant header អាច run ក្នុង tenant ត្រឹមត្រូវ។
7. Protected API គ្មាន credentials ត្រូវបាន reject ជា `401`។
8. Health/public endpoint មិនត្រូវការ tenant context។

## QA API execution order

1. បង្កើត QA database snapshot/branch ឬ QA workspace ដាច់ដោយឡែក។
2. Login User A, User B និង Admin ដើម្បីទទួល access token។
3. បង្កើត test data ក្នុង workspace A និង B។
4. រត់ read tests មុន write tests។
5. រត់ header tampering tests។
6. រត់ cross-tenant update/delete tests។
7. រត់ direct-service tests ប្រសិនបើ services បើក port ដាច់ដោយឡែក។
8. ពិនិត្យ database read-only ដោយ admin/DB operator ថា row `tenant_id` មិនត្រូវបានប្តូរ។
9. Clear tokens និងរក្សាទុកតែ status code, tenant IDs សម្រាប់ QA report; កុំរក្សាទុក bearer token។

## Acceptance criteria

Phase 0 ចាត់ទុកថា pass នៅពេល៖

- Regular user មិនអាចឃើញ row ឬ aggregate របស់ tenant ផ្សេង។
- Cross-tenant `GET` មិនបង្ហាញថា row របស់អ្នកផ្សេងមានទេ។
- Cross-tenant update/delete មិនអាច mutate data បាន។
- Header tampering មិនអាចប្តូរ tenant scope។
- Direct service request មានការការពារដូច gateway។
- Admin global access មានតែ role `ADMIN` និងត្រូវបាន audit នៅពេល act-as។
- Request context ត្រូវបាន clear រាល់ request។
- Automated tests និង QA API tests pass មុនទៅ Phase 1 checkout safety។

## អ្វីដែលនៅត្រូវធ្វើបន្ថែម

Automated filter tests បាន pass ហើយ ប៉ុន្តែត្រូវរត់ QA API/database matrix ខាងលើជាមួយ real PostgreSQL data មុន deploy shared tenant filter ទៅ production។ កុំប្រើ production write data សម្រាប់ test ហើយកុំ run checkout/payment test រហូត Phase 1 compensation និង cancellation policy ត្រូវបានបញ្ចប់។
