# Tests - RRA Project

This directory contains end-to-end and API tests for the RRA project using Playwright and TypeScript.

## Structure

```
tests/
├── specs/
│   ├── api/                 # API/REST endpoint tests
│   │   ├── helpers/        # API helper utilities
│   │   ├── login.spec.ts   # Login endpoint tests
│   │   └── ...
│   └── ui/                  # Frontend UI tests
│       ├── helpers/        # UI Page Object Models and helpers
│       ├── login.spec.ts   # Login UI tests
│       └── ...
├── package.json
├── tsconfig.json
├── playwright.config.ts
└── README.md
```

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment variables (optional):**
   ```bash
   export API_BASE_URL=http://localhost:8080/api
   export BASE_URL=http://localhost:3000
   ```

## Running Tests

- **Run all tests:**
  ```bash
  npm test
  ```

- **Run all tests setting the BASE_URL:**
  ```bash
  BASE_URL=http://localhost:8080 npm test
  ```

- **Run tests with UI:**
  ```bash
  npm run test:ui
  BASE_URL=http://localhost:8080 npm run test:ui
  ```

- **Run only API tests:**
  ```bash
  npm run test:api
  ```

- **Run only UI tests:**
  ```bash
  npm run test:ui-tests
  ```

- **Debug tests:**
  ```bash
  npm run test:debug
  ```

### Running in Docker

The tests can be containerized using the provided Dockerfile. This is useful for CI/CD pipelines:

```bash
# Build the test image
docker build -t rra-tests .

# Run tests against local services
docker run --net=host rra-tests

# Run tests against services in Docker compose network
docker run --net=rprj-ng-dev_default rra-tests
```

### Environment Variables

When running tests in Docker, configure these URLs (see `docker-compose.dev.yml`):

```bash
# For local development (host machine)
BASE_URL=http://localhost:3000           # Frontend
API_BASE_URL=http://localhost:1971/api   # Backend

# For Docker container (same network)
BASE_URL=http://fe:3000                  # Frontend
API_BASE_URL=http://be:1971/api          # Backend
```

## Test Coverage

### API Tests (`specs/api/`)
- Login endpoint validation
- Error handling and edge cases
- Authentication flows

### UI Tests (`specs/ui/`)
- Login form interactions
- Form validation
- Navigation after login

## Important Notes

- Update selectors in `specs/ui/helpers/loginPage.ts` based on actual UI elements
- Update API endpoints in `specs/api/helpers/apiHelper.ts` based on backend routes
- Update test data and expected behavior based on your authentication implementation

## Development

When adding new tests:

1. Create corresponding test file in `specs/api/` or `specs/ui/`
2. Create helper files in respective `helpers/` directories
3. Follow naming conventions: `*.spec.ts` for tests, `*Helper.ts` or `*Page.ts` for helpers
4. Use TypeScript for type safety
5. Document complex test logic with comments
