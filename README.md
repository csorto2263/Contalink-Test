# Contalink Playwright Automation Suite

High-quality Playwright + TypeScript automation framework designed for UI and API coverage of the Contalink candidates app.

## ✅ Highlights
- **Playwright + TypeScript** with strict typing and clean architecture.
- **Page Object Model (POM)** for UI tests.
- **Reusable API client** for invoice API coverage.
- **CI-friendly defaults** (headless, retries, trace/video on failure).
- **Environment-driven config** using `.env`.

---

## 🚀 Setup

### 1) Install dependencies
```bash
npm install
```

### 2) Create `.env`
Copy `.env.example` and fill real values:
```bash
cp .env.example .env
```

---

## ▶️ Run Tests

### Run all tests
```bash
npm test
```

### Run UI tests only
```bash
npm run test:ui
```

### Run API tests only
```bash
npm run test:api
```

### Run headed (debug)
```bash
npm run test:headed
```

---

## 📁 Project Structure
```
.
├── playwright.config.ts
├── package.json
├── tsconfig.json
├── .env.example
├── src
│   ├── pages
│   │   ├── access-code-page.ts
│   │   └── dashboard-page.ts
│   ├── fixtures
│   │   └── ui-fixtures.ts
│   └── utils
│       ├── api-client.ts
│       └── env.ts
└── tests
    ├── e2e
    │   ├── access-code.spec.ts
    │   └── smoke.spec.ts
    └── api
        └── invoices.spec.ts
```

---

## 🧠 Design Decisions

### ✅ POM for UI
- `AccessCodePage` handles login and access code flows.
- `DashboardPage` validates entry into the application and basic UI visibility.

### ✅ API Coverage
- `ApiClient` wraps all invoice endpoints.
- Tests cover **POST / GET / PATCH / PUT / DELETE** flows.

### ✅ Stability + Reliability
- **No manual waits** — use Playwright's auto-wait + `expect`.
- **Stable locators** using roles and labels.
- **Maximized browser window** by default for UI reliability.

---

## 🔐 Environment Variables
All secrets/config live in `.env` (never hardcoded):

| Key | Description |
|-----|-------------|
| WEB_BASE_URL | UI base URL |
| WEB_ACCESS_CODE | Access code for login |
| API_BASE_URL | API base URL |
| API_AUTH | Authorization header for API requests |

---

## ✅ Notes
If the UI locators change, update the POM classes inside `src/pages/` only (tests stay stable).
API tests are skipped automatically when `API_AUTH` is not configured.
