# backend/Dockerfile
FROM golang:1.23.4-bullseye AS builder
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download

COPY . .
RUN go build -o main .

RUN go env -w CGO_ENABLED=1
FROM debian:bullseye
WORKDIR /root/
COPY --from=builder /app/main .
EXPOSE 8080
CMD ["./main"]
