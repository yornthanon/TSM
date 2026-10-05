# TSM៖ សិទ្ធិ CEO, workspace និងរូប Event

## អ្វីបានរៀបចំ

- **CEO/global admin:** នៅតែផ្អែកលើ exact allowlist `yornthanon.dev@gmail.com` ប៉ុណ្ណោះ។ មិនបន្ថែម alias ឬអ៊ីមែលប្រហាក់ប្រហែលទៅជា CEO ទេ។ Google identity ប្រើ verified `email` និង stable `sub` ដើម្បីរក្សាគណនីដដែលនៅពេល email claim ផ្លាស់ប្តូរ។
- **ទិន្នន័យ CEO:** Dashboard មាន aggregate តាម workspace និងអាចមើល Events, Orders, Payments និង Users ទូទាំង system។ អ្នកប្រើធម្មតានៅតែស្ថិតក្នុង workspace របស់ខ្លួន។
- **ចូលធ្វើការក្នុង workspace:** ក្នុង Users របស់ CEO ប្រើ right-click/ចុចម្រាមពីរលើ user → `Act as user`។ Session មានសុពលភាព 15 នាទី, មាន banner និងប៊ូតុងចេញ, ហើយកត់ត្រា CEO, user គោលដៅ និង request ក្នុង audit log។ មិនទទួលយក password ឬ Google session របស់ user ទេ។
- **ដែនកំណត់ Act-as:** មិនអនុញ្ញាតកែ role/សិទ្ធិ, លុបគណនីតាម act-as, ឬ refund payment ក្នុង act-as។ ការមើល payment ទូទាំង platform ជា read-only; ការកែ event/inventory/order ត្រូវធ្វើក្រោម workspace ដែលបានជ្រើស ហើយ audit បាន។
- **រូប Event:** Form មាន photo picker, preview និង validation ខាង browser និង server (JPEG/PNG/WebP, អតិបរមា 5 MiB, ពិនិត្យ file signature)។ រូបត្រូវផ្ទុកទៅ Cloudinary ក្នុង folder ដែលបានបង្កើតពី tenant របស់ session ហើយ Event រក្សាទុកតែ secure URL។

## ត្រូវកំណត់នៅ Render មុន upload រូបអាចដំណើរការ

ក្នុង Render → TSM API Web Service → Environment បន្ថែម secret:

```text
CLOUDINARY_URL=cloudinary://<API_KEY>:<API_SECRET>@<CLOUD_NAME>
```

យកតម្លៃពី Cloudinary Console។ កុំដាក់វាក្នុង frontend, Git ឬ chat។ បន្ទាប់ពីរក្សាទុក Render នឹង restart/deploy service។ បើមិនទាន់មាន variable នេះ API នឹងបដិសេធ upload ដោយ error ច្បាស់លាស់; មិនរក្សាទុកលើ disk បណ្ដោះអាសន្នរបស់ Render ទេ។

## វិធីប្រើ

1. ចូលដោយ Google account ដែលបានបញ្ជាក់ថាជា `yornthanon.dev@gmail.com`។
2. CEO បើក Users ហើយចុច right-click/ចុចម្រាមពីរលើ user ដែលមានស្ថានភាព Active ដើម្បីចាប់ផ្ដើម act-as។
3. បង្កើត/គ្រប់គ្រង event និង inventory នៅក្នុង workspace នោះ; banner បង្ហាញថាកំពុងធ្វើជា user។ ចេញពី session ដោយប៊ូតុង Stop/Exit។
4. បើក Events → New event → ជ្រើសរូប។ រូបមិនមែនជាកាតព្វកិច្ចទេ។

## ស្ថានភាពតេស្ត និង deployment

- Frontend production build: **ជោគជ័យ**។
- Backend tests សម្រាប់ OAuth, tenant-scope, act-as allowlist និង Cloudinary validation: **ជោគជ័យ**។
- ការផ្ទៀងផ្ទាត់ live Google session និង Render deploy សម្រាប់ commit នេះ៖ **រង់ចាំ deploy/health check**។ កុំចាត់ទុកថា live រហូតដល់ Render build, Flyway migration និង API health បានជោគជ័យ។

## Migration និងសុវត្ថិភាព

Flyway V12 បន្ថែម act-as session និង append-only audit tables ដោយមិន reset user, workspace ឬ business data។ កំណត់ role/mutation នៅ backend ផងដែរ—ការលាក់ប៊ូតុងតែប៉ុណ្ណោះមិនមែនជា authorization ទេ។
