FROM node:20-alpine

WORKDIR /app

# Install dependencies
COPY package.json package-lock.json* ./
RUN npm install

# Install Playwright browsers
RUN npx playwright install chromium

# Copy test files
COPY . .

# Default to running tests
CMD ["npm", "test"]
