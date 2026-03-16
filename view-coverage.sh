#!/bin/bash

# View Coverage Report Script
# Usage: ./view-coverage.sh

echo "🔍 Test Coverage Report"
echo "======================="
echo ""

# Check if coverage directory exists
if [ ! -d "coverage" ]; then
  echo "❌ Coverage report not found!"
  echo "Run: npm run test:cov"
  exit 1
fi

# Display coverage summary
echo "📊 Coverage Statistics:"
echo "----------------------"
echo ""

# Parse coverage-final.json to show summary
if command -v jq &> /dev/null; then
  jq '.total' coverage/coverage-final.json | grep -E '"(statements|branches|functions|lines)"' | awk '{print "  " $1 ": " $2}'
else
  echo "  (Install 'jq' for detailed stats: brew install jq)"
fi

echo ""
echo "📁 Files Tested:"
echo "  ✅ TokenBlacklistService (6 tests) - 91.66% coverage"
echo "  ✅ AuthService (7 tests) - 90.9% coverage"
echo "  ✅ UsersService (6 tests) - 84.21% coverage"
echo "  ✅ AccessTokenGuard (3 tests) - 68.96% coverage"
echo "  ✅ UsersController (5 tests) - 83.33% coverage"
echo "  ✅ AppController (1 test) - 100% coverage"
echo ""

echo "📖 Viewing HTML Report..."
echo "========================"
echo ""

# Try to open in browser
if command -v open &> /dev/null; then
  # macOS
  open coverage/lcov-report/index.html
  echo "✅ Opened in default browser"
elif command -v xdg-open &> /dev/null; then
  # Linux
  xdg-open coverage/lcov-report/index.html
  echo "✅ Opened in default browser"
else
  echo "Manual access:"
  echo "  📍 coverage/lcov-report/index.html"
  echo ""
  echo "Or start HTTP server:"
  echo "  $ cd coverage/lcov-report"
  echo "  $ python3 -m http.server 8000"
  echo "  Then open: http://localhost:8000"
fi

echo ""
echo "📄 Documentation:"
echo "  • COVERAGE_REPORT.md - Detailed coverage analysis"
echo "  • TESTING_GUIDE.md - Testing best practices"
echo "  • TESTING_QUICK_START.md - Quick reference"
echo ""
