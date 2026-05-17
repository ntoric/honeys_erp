# Retail POS API Server

This project is a REST API server generated in Go utilizing the Gin framework based on the provided OpenAPI (Swagger) 3.0.3 specification for a Retail POS Billing and Accounting system.

It features auto-generated routing and data models along with a generic SQL database adapter configured out-of-the-box using GORM with SQLite.

## Overview

- **Language:** Go (1.24+)
- **Framework:** [Gin](https://gin-gonic.com/) for HTTP routing
- **ORM:** [GORM](https://gorm.io/) configured with SQLite3
- **Generation Tool:** [oapi-codegen](https://github.com/oapi-codegen/oapi-codegen) for OpenAPI bindings

## Project Structure

```text
.
├── api/
│   └── openapi.yaml           # Source OpenAPI 3.0 specification
├── internal/
│   ├── models/
│   │   └── models.go          # GORM database models & migration
│   └── server/
│       ├── server.gen.go      # Auto-generated Gin server interface & type definitions
│       ├── types.gen.go       # Auto-generated OpenAPI models / structs
│       ├── server.go          # Server implementation struct
│       └── impl.go            # Generated stub implementation for all endpoints (returns 501)
├── main.go                    # Application entrypoint (Setup DB & start Gin router)
├── main_test.go               # Setup and server endpoint integration tests
├── go.mod                     # Go modules declaration
└── README.md                  # Project documentation
```

## Setup & Running

### Prerequisites

- [Go](https://golang.org/doc/install) (version 1.24+)

### Installation

1. **Clone the repository and install dependencies:**

   ```bash
   go mod download
   ```

2. **Generate API code (Optional, if you change `api/openapi.yaml`):**

   Make sure you have `oapi-codegen` installed:
   ```bash
   go install github.com/oapi-codegen/oapi-codegen/v2/cmd/oapi-codegen@latest
   ```

   Re-generate models and server code:
   ```bash
   oapi-codegen -generate types -package server api/openapi.yaml > internal/server/types.gen.go
   oapi-codegen -generate gin,spec -package server api/openapi.yaml > internal/server/server.gen.go
   ```

### Running the Server

Run the server with the default configuration. This will start an HTTP server on port `8080` and create a `pos.db` SQLite file in the root directory.

```bash
go run main.go
```

To build an executable binary:
```bash
go build -o pos-api .
./pos-api
```

### Database

The application connects to a SQLite database (`pos.db`) and uses GORM to auto-migrate defined schemas (e.g. `User`, `Product`, `Customer`) automatically on startup.

You can inspect the database using standard SQLite tools:
```bash
sqlite3 pos.db
```

## Testing

Integration tests for server endpoints are located in `main_test.go`. The test suite uses `httptest` with an in-memory SQLite database (`file::memory:?cache=shared`).

Run all tests:
```bash
go test -v ./...
```

## API Specification Details

The base OpenAPI specification details an extensive list of modules:
- Point of sale transactions
- Inventory management
- Account generation & management
- E-way bill generation & GST compliance
- Auth, Webhooks, Reports, Hardware Integration (e.g., Weighing Scales)

By default, all endpoints are returning an HTTP `501 Not Implemented` with a JSON payload until logic is added to the implementation in `internal/server/impl.go`.
