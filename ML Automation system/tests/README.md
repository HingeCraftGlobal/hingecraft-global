# 🧪 HingeCraft ML Automation System - Testing Suite

Comprehensive testing framework for stress testing and codebase analysis.

## 📋 Overview

This testing suite includes:
1. **Stress Test** - Tests system with 100,000 resources to identify bottlenecks and failures
2. **Codebase Analyzer** - Scans entire codebase for potential issues, security vulnerabilities, and performance problems

## 🚀 Quick Start

### Run Full Test Suite (Recommended)

```bash
cd "ML Automation system/tests"
./run-full-test-suite.sh
```

This will:
- Run codebase analysis
- Run stress test with 100,000 resources
- Generate comprehensive reports

### Run Individual Tests

#### Codebase Analysis Only

```bash
cd "ML Automation system/tests"
node codebase-analyzer.js
```

#### Stress Test Only

```bash
cd "ML Automation system/tests"
./run-stress-test.sh
```

## 📊 Test Configuration

### Stress Test Configuration

Edit `stress-test.js` to modify test parameters:

```javascript
const TEST_CONFIG = {
  totalResources: 100000,      // Total resources to test
  batchSize: 1000,             // Resources per batch
  concurrentBatches: 10,       // Concurrent batch processing
  maxRetries: 3,               // Max retries on failure
  timeout: 300000,             // Timeout per batch (5 minutes)
  enableApiTests: true,        // Enable API rate limit tests
  enableDatabaseTests: true,   // Enable database performance tests
  enableMemoryTests: true,    // Enable memory leak detection
  enableRateLimitTests: true   // Enable rate limit tests
};
```

## 📈 What Gets Tested

### Stress Test Coverage

1. **Database Performance**
   - Bulk insert performance
   - Query performance
   - Connection pool handling
   - Transaction handling

2. **API Rate Limits**
   - Concurrent request handling
   - Rate limit detection
   - Error recovery

3. **Memory Usage**
   - Memory leak detection
   - Heap growth monitoring
   - RSS (Resident Set Size) tracking

4. **Error Recovery**
   - Invalid data handling
   - System resilience
   - Error propagation

### Codebase Analysis Coverage

1. **Performance Issues**
   - Synchronous file operations
   - Large loops without breaks
   - Missing pagination
   - Large files (>1000 lines)

2. **Security Issues**
   - SQL injection vulnerabilities
   - Hardcoded credentials
   - Missing input validation

3. **Code Quality**
   - Missing error handling
   - Unclosed event listeners
   - Console statements in production
   - Missing exports

4. **Best Practices**
   - Async/await usage
   - Database transaction handling
   - Promise handling

## 📄 Reports Generated

### Stress Test Reports

- **JSON Report**: `stress-test-report.json`
  - Complete test results
  - Performance metrics
  - Error details
  - Memory usage data

- **HTML Report**: `stress-test-report.html`
  - Visual summary
  - Performance charts
  - Issue breakdown
  - Recommendations

### Codebase Analysis Reports

- **JSON Report**: `codebase-analysis-report.json`
  - All issues found
  - File-by-file breakdown
  - Severity classification

- **HTML Report**: `codebase-analysis-report.html`
  - Visual issue summary
  - Categorized issues
  - Code snippets
  - Recommendations

## 🔍 Understanding Results

### Stress Test Metrics

- **Success Rate**: Percentage of resources processed successfully
- **Inserts/Second**: Database insert performance
- **Memory Growth**: Heap and RSS growth over time
- **Bottlenecks**: Identified performance bottlenecks
- **Memory Leaks**: Potential memory leak warnings

### Codebase Analysis Severity

- **High**: Security vulnerabilities, critical performance issues
- **Medium**: Performance concerns, missing error handling
- **Low**: Code quality suggestions, best practices

## ⚠️ Important Notes

1. **Database Impact**: Stress test will insert 100,000 test records into the database
2. **System Load**: Tests will put significant load on the system
3. **Cleanup**: Test data uses `source = 'stress_test'` - can be cleaned with:
   ```sql
   DELETE FROM leads WHERE source = 'stress_test';
   ```

## 🛠️ Troubleshooting

### Stress Test Fails to Start

- Check Docker containers are running: `docker-compose ps`
- Verify database connection: `docker-compose exec postgres psql -U hingecraft_user -d hingecraft_automation -c "SELECT 1"`
- Check server is running: `curl http://localhost:7101/health`

### Out of Memory Errors

- Reduce `batchSize` in test configuration
- Reduce `concurrentBatches`
- Increase Docker memory allocation

### Database Connection Errors

- Ensure PostgreSQL container is running
- Check database credentials in `config/api_keys.js`
- Verify database exists and schema is initialized

## 📚 Additional Resources

- [Stress Test Script](./stress-test.js) - Main stress test implementation
- [Codebase Analyzer](./codebase-analyzer.js) - Code analysis implementation
- [Test Runner](./run-stress-test.sh) - Stress test execution script
- [Full Suite Runner](./run-full-test-suite.sh) - Complete test suite runner

## ✅ Pre-Flight Checklist

Before running stress tests:

- [ ] Docker containers are running
- [ ] Database is initialized with schema
- [ ] OAuth is authorized (for API tests)
- [ ] Sufficient disk space (for test data)
- [ ] System has adequate memory
- [ ] No other heavy processes running

## 🎯 Expected Results

### Successful Stress Test

- ✅ Success rate > 99%
- ✅ No critical errors
- ✅ Memory growth < 500MB
- ✅ No memory leaks detected
- ✅ All batches processed

### Successful Codebase Analysis

- ✅ No high-severity security issues
- ✅ Minimal performance issues
- ✅ Code quality warnings acceptable

---

**Last Updated**: December 12, 2025  
**Status**: ✅ Ready for Testing
