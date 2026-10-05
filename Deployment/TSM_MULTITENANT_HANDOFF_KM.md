# TicketDesk — របាយការណ៍បន្តការកែ Multi-tenant

**កាលបរិច្ឆេទ៖** 2026-10-05
**សាខា៖** `feat/multi-tenant-workspaces`
**ស្ថានភាព៖** commit `19dcc61` បានបង្កើត local; មិនទាន់ push។ Render `PLATFORM_ADMIN_EMAILS` បាន update ហើយ env-only redeploy លើ commit ចាស់កំពុងដំណើរការ; V10 ត្រូវបានសាកល្បងលើ temporary branch ប៉ុណ្ណោះ, production មិនទាន់ migrate។

## អ្វីបានបញ្ចប់ក្នុងសាខា local

- បញ្ចប់ផ្នែកសំខាន់នៃ shared-database tenancy៖ workspace entity/repository/service, tenant context, Hibernate filters លើ user និង business entities, filter ក្នុង security chain និង `X-Tenant-Id` propagation សម្រាប់ internal service calls។
- បើក open enrollment តាម Google verified email។ គណនីធម្មតាទទួល `USER` និង `TENANT_ADMIN` ហើយមាន workspace ផ្ទាល់ខ្លួន។ Global `ADMIN` មានតែ email ដែលកំណត់ក្នុង `PLATFORM_ADMIN_EMAILS` ប៉ុណ្ណោះ។
- អ្នកប្រើចាស់ដែលមិនទាន់មាន `tenant_id` នឹងបាន workspace ថ្មីផ្ទាល់ខ្លួននៅ Google login លើកដំបូង (លើកលែង platform-admin email)។
- បន្ថែម platform-admin workspace console, route protection, profile endpoint, Google-only frontend sign-in និង TOTP MFA integration។ Legacy username/password login និង registration routes ត្រូវបានបិទ។
- កែ local setup ឲ្យមិនមាន database/JWT/admin-password defaults ដែលស្គាល់ជាសាធារណៈ។ `.env` មិន tracked និងត្រូវបាន `.gitignore`។ README ដែលមានមុនបានប្រកាស MIT រួចហើយ; ឯកសារ `LICENSE` ស្តង់ដារ MIT ត្រូវបានបន្ថែម local ប៉ុណ្ណោះ។

## សំខាន់៖ អ្វីកើតឡើងចំពោះទិន្នន័យចាស់

Migration V10 បង្កើត workspace `Legacy TicketDesk Workspace` ជា ID 1 ហើយដាក់ event, ticket, order, payment និង notification rows ដែលមានស្រាប់ទៅក្នុង workspace នោះ។ User rows ចាស់ត្រូវទុក `tenant_id` ជា NULL ដើម្បីឲ្យ token/session ចាស់ fail-closed មិនអាចចូល Legacy បាន។ នៅ Google login លើកដំបូង OAuth បង្កើត workspace ថ្មី ហើយកំណត់ user ទៅ workspace នោះ។ Migration មិនលុប ឬ reset ទិន្នន័យទេ ហើយក៏កែ sequence របស់ workspace ដើម្បីឲ្យ ID ថ្មីមិនប៉ះទង្គិច។

នៅពេល rollout អ្នកប្រើចាស់ដែលមិនមែន platform admin នឹងទទួល workspace ថ្មីទទេនៅ Google login លើកដំបូង; session ចាស់មិនអាចអានទិន្នន័យ Legacy បានទេ។ Business records ចាស់មិនត្រូវបានបែងចែកតាម username ទេ ព្រោះប្រភពទិន្នន័យមិនបញ្ជាក់ម្ចាស់តែម្នាក់បានដោយសុវត្ថិភាព។ ដូច្នេះ record ចាស់នឹងនៅក្នុង Legacy ហើយ platform admin អាចមើលឃើញទាំងអស់; អ្នកប្រើ workspace ថ្មីមិនឃើញ records ទាំងនោះទេ រហូតមានការផ្ទេរ/បែងចែកទិន្នន័យដោយ admin។ **ត្រូវទទួលយកអាកប្បកិរិយានេះ ឬផ្លាស់ប្តូរផែនការមុន migration production។**

## Validation

| ផ្នែក | លទ្ធផល |
|---|---|
| Frontend lint | `npm run lint` — passed, 0 warnings / 0 errors |
| Frontend build | `npm run build` — passed |
| User-service tests | `./mvnw -pl user-service -am test` — 7 passed, 0 failed |
| Maven package | `./mvnw -q -DskipTests package` — passed |
| Full Maven tests | មិនអាចបញ្ចប់៖ `EventServiceApplicationTests.contextLoads` ត្រូវការ JDBC metadata; sandbox មិនមាន database connection ដូច្នេះ Hibernate មិនអាចកំណត់ dialect បាន |
| Compose config | Docker CLI មិនមាន; YAML parse បានដោយ PyYAML។ Full `docker compose config` មិនបានរត់ |
| Credential scan | មិនរកឃើញ known development password ឬ Google credential literal ក្នុង source/docs ដែលបានស្កេន; មិនបង្ហាញតម្លៃ secret ក្នុង report |
| Diff hygiene | `git diff --check` — passed |

## Render — status បច្ចុប្បន្ន

API នៅ [tsm-7hu8.onrender.com](https://tsm-7hu8.onrender.com) និង frontend នៅ [tsm-frontend-1pxf.onrender.com](https://tsm-frontend-1pxf.onrender.com)។ Metadata បង្ហាញថាសេវាទាំងពីរ auto-deploy ពី `main`; API នៅ Free plan ហើយអាច sleep ក្រោយ 15 នាទីគ្មាន traffic។ នៅ 2026-10-05 `PLATFORM_ADMIN_EMAILS` ត្រូវបាន merge ទៅ TSM API; deploy `dep-db1km8navr4c73cd8570` លើ commit ចាស់ `c41d0b0` ត្រូវបានឃើញកំពុង `update_in_progress`។ មិនទាន់ push source commit ឬរត់ V10 លើ production ទេ។

សូមមើល [កំណត់ត្រា Render read-only](/home/ubuntu/TSM/Deployment/TSM_RENDER_READONLY_CHECK_2026-10-04.md) និង [deployment notes](/home/ubuntu/TSM/Deployment/TSM_RENDER_DEPLOYMENT.md) សម្រាប់ព័ត៌មានបច្ចេកទេស និងតម្លៃ Free/paid alternatives។

## Release preflight និងអ្វីនៅសល់

1. អ្នកបានជ្រើស platform-admin Gmail ហើយ `PLATFORM_ADMIN_EMAILS` ត្រូវបានកំណត់លើ Render; env-only deploy ចាស់ត្រូវបានឃើញកំពុងដំណើរការនៅពេលចុងក្រោយពិនិត្យ។
2. អ្នកបានទទួលយក data policy៖ records ចាស់នៅ Legacy ហើយ user ចាស់ទទួល workspace ថ្មីនៅ Google login ដំបូង។
3. បានបង្កើត Neon snapshot `before-tenant-v10-2026-10-05` (ផុតកំណត់ 2026-11-04); V10 បានដំណើរការលើ Neon temporary branch ហើយ branch នោះត្រូវបានលុបដោយមិនអនុវត្តទៅ production។ Production Flyway នៅ version 9; V10 នឹងដំណើរការតាម app deployment។
4. Commit `19dcc61` មាន local នៅលើ `feat/multi-tenant-workspaces`; push ទៅ `main` និង auto-deploy backend/frontend មិនទាន់បានធ្វើ។ អ្នកបានស្នើ push/deploy ហើយ; ត្រូវផ្ទៀងផ្ទាត់ចុងក្រោយក្រោយ push។

GitHub repository ជាសាធារណៈ; source, README និង `LICENSE` ស្ថិតក្នុង commit local `19dcc61` ហើយមិនទាន់ទៅដល់ GitHub/Render។

## ចំណាំសុវត្ថិភាពអំពី Git history

ឯកសារប្រភពលើ `main` សាធារណៈធ្លាប់មាន development credential defaults ក្នុង Compose/docs។ Commit `19dcc61` ដក defaults ចេញពី current tree ប៉ុន្តែមិនលុប commit history ចាស់ទេ។ Credential scan ពិនិត្យ current tree មិនមែន Git history។ ខ្ញុំមិនបានអាន Render secrets ផ្សេងទៀតទេ។ ប្រសិនបើ default ដែលធ្លាប់ public ណាមួយត្រូវបានប្រើជាសម្ងាត់ពិត សូម rotate នៅ environment ដែលពាក់ព័ន្ធ; កុំផ្ញើ secret តាម chat។

## Platform-admin allowlist

អ្នកបានផ្តល់ Gmail សម្រាប់ global platform admin។ តម្លៃត្រូវបានដាក់ក្នុង root `.env` ដែល Git ignore និង mode `0600`; មិនបានចម្លង Gmail ទៅឯកសារដែល track ដោយ Git ឡើយ។ Render `PLATFORM_ADMIN_EMAILS` ត្រូវបានកែដោយ merge តែមួយ variable; env-only deploy លើ code ចាស់កំពុងដំណើរការ។
