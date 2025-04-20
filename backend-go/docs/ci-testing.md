# CI Testing Guide

This document explains how to run the Go tests in CI environments.

## Test Command

The Makefile includes a special target for running tests in CI environments:

```bash
make test-ci
```

This command:
- Runs all tests in the `./internal/domain/middlewares` and `./internal/usecase` directories
- Enables race detection with the `-race` flag
- Generates a coverage report in `coverage.out`
- Displays a summary of the coverage report

## CI Configurations

### GitHub Actions

A GitHub Actions workflow is provided in `.github/workflows/go-test.yml`. This workflow:
- Runs on pushes and pull requests to the `main` branch that affect files in the `backend-go` directory
- Sets up Go
- Downloads dependencies
- Runs the tests using `make test-ci`
- Uploads the coverage report as an artifact

To use this workflow, simply push your changes to GitHub.

### CircleCI

A CircleCI configuration is provided in `.circleci/config.yml`. This configuration:
- Uses a Docker image with Go installed
- Sets the working directory to the `backend-go` directory
- Caches dependencies for faster builds
- Runs the tests using `make test-ci`
- Stores the coverage report as an artifact

To use this configuration, connect your repository to CircleCI.

## Custom CI Integration

If you're using a different CI system, you can still use the `test-ci` target. Simply add a step to your CI configuration that runs:

```bash
cd backend-go && make test-ci
```

## Coverage Report

The coverage report is generated in `coverage.out` and can be used to:
- Upload to a code coverage service
- Generate HTML reports
- Enforce minimum coverage thresholds

To generate an HTML coverage report, run:

```bash
go tool cover -html=coverage.out -o coverage.html
```
