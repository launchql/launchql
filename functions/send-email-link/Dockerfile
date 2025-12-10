FROM node:18-alpine

WORKDIR /usr/src/app

# Install pnpm and production dependencies
COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm@9 && pnpm install --prod

# Copy compiled code (build should be run before building image)
COPY dist ./dist

ENV NODE_ENV=production
ENV PORT=8080

CMD ["node", "dist/index.js"]

