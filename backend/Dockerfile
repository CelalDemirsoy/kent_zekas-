FROM golang:1.22-alpine AS builder
WORKDIR /app
COPY go.mod ./
COPY . .
RUN go build -o kentai-api ./cmd/api

FROM alpine:3.20
WORKDIR /app
COPY --from=builder /app/kentai-api ./kentai-api
EXPOSE 8080
CMD ["./kentai-api"]
