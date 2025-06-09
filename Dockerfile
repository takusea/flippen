# 1. Build WASM with wasm-pack
FROM rust:1.76 as wasm-builder

WORKDIR /app/wasm

# Install wasm-pack
RUN cargo install wasm-pack

# Copy Rust source
COPY ./wasm ./wasm
WORKDIR /app/wasm
RUN wasm-pack build --target web --out-dir ../frontend/src/pkg

# 2. Build React frontend
FROM node:20 as frontend-builder

WORKDIR /app/frontend

COPY ./frontend ./frontend
WORKDIR /app/frontend

# Copy wasm output from previous stage
COPY --from=wasm-builder /app/frontend/src/pkg ./src/pkg

RUN npm install
RUN npm run build

# 3. Serve with a lightweight HTTP server
FROM nginx:alpine

COPY --from=frontend-builder /app/frontend/dist /usr/share/nginx/html

# Optional: replace default nginx config (optional)
# COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]