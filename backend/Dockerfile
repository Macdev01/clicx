# Build stage
FROM golang:1.24.4-alpine AS builder

# Install git and other dependencies
RUN apk update && apk add --no-cache git ca-certificates tzdata

# Set working directory
WORKDIR /app

# Copy go mod files
COPY go.mod go.sum ./

# Download dependencies
RUN go mod download

# Copy source code
COPY . .

# Build the main application
RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o main .

# Build migrate binary
RUN CGO_ENABLED=0 GOOS=linux go build -o migrate ./cmd/migrate.go

# Build seed binary
RUN CGO_ENABLED=0 GOOS=linux go build -o seed_bin ./cmd/seed/main.go

# Final stage
FROM alpine:latest

# Install ca-certificates for HTTPS requests
RUN apk --no-cache add ca-certificates tzdata

WORKDIR /root/

# Copy the binaries from builder stage
COPY --from=builder /app/main .
COPY --from=builder /app/migrate .
COPY --from=builder /app/seed_bin .


# Copy migrations if they exist
COPY --from=builder /app/migrations ./migrations/

# Make sure the binaries are executable
RUN chmod +x ./main ./migrate ./seed_bin

# Expose port (you can adjust this based on your config)
EXPOSE 8080

# Run the binary
CMD ["./main"] 