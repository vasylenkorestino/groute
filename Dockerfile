FROM node:18-alpine AS builder

WORKDIR /app

COPY client/package*.json ./client/
RUN cd client && npm ci

COPY client/ ./client/

ARG REACT_APP_GOOGLE_MAPS_APIKEY
ENV REACT_APP_GOOGLE_MAPS_APIKEY=$REACT_APP_GOOGLE_MAPS_APIKEY

RUN cd client && npm run build

FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY index.js ./
COPY routes/ ./routes/
COPY models/ ./models/
COPY utils/ ./utils/
COPY --from=builder /app/client/build ./client/build

EXPOSE 6000

CMD ["node", "index.js"]
