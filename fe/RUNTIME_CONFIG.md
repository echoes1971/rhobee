# Runtime Environment Configuration

## How it works

This frontend uses **runtime environment variables** instead of build-time variables. This allows the same Docker image to be configured differently across environments (dev, staging, production).

## Configuration Flow

1. **Build time**: `env-config.js` template is created with `${VARIABLE}` placeholders
2. **Runtime**: Docker entrypoint replaces placeholders with actual environment variables
3. **Application**: `app.cfg.js` reads from `window.env` (runtime) or falls back to `process.env` (development)

## Files Involved

- `public/env-config.js` - Template with placeholders
- `docker-entrypoint.sh` - Script that injects variables at startup
- `src/app.cfg.js` - Configuration loader with fallbacks

## Available Variables

- `REACT_APP_SITE_TITLE` - Site title (default: "R-Prj")
- `REACT_APP_ENDPOINT` - API endpoint (default: "/api")
- `REACT_APP_HOME_OBJECT_ID` - Home page object ID (default: "-10")

## Development

During development (`npm start`), the app uses `.env` file:

```bash
REACT_APP_SITE_TITLE=:: R-Project ::
REACT_APP_ENDPOINT=/api
```

## Production with Docker

In docker-compose.yml, set environment variables:

```yaml
services:
  fe:
    environment:
      - REACT_APP_SITE_TITLE=ρBee CMS
      - REACT_APP_ENDPOINT=/api
      - REACT_APP_HOME_OBJECT_ID=-10
```

## Testing

After starting the container, check the browser console:
```javascript
console.log(window.env);
// Should show: {REACT_APP_SITE_TITLE: "ρBee CMS", REACT_APP_ENDPOINT: "/api"}
```

Or inspect the injected file:
```bash
docker exec rprj-ng-fe-1 cat /usr/share/nginx/html/env-config.js
```

## Benefits

✅ Single Docker image for all environments  
✅ No rebuild needed to change configuration  
✅ Environment-specific settings in docker-compose  
✅ Falls back to .env during development  
