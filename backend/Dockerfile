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

# Build the application
RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o main .

# Final stage
FROM alpine:latest

# Install ca-certificates for HTTPS requests
RUN apk --no-cache add ca-certificates tzdata

WORKDIR /root/

# Copy the binary from builder stage
COPY --from=builder /app/main .

# Copy the Firebase configuration file if it exists
COPY --from=builder /app/clixxx-dev-44e45f09d47f.json* ./

# Copy migrations if they exist
COPY --from=builder /app/migrations ./migrations/

# Make sure the binary is executable
RUN chmod +x ./main

# Expose port (you can adjust this based on your config)
EXPOSE 8080

# Run the binary
CMD ["./main"] 