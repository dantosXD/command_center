#!/bin/bash
###############################################################################
# Create GitHub Release v1.0.0
# Run this script to create the release and prepare for deployment
###############################################################################

set -e  # Exit on error

echo "🚀 Creating Command Center v1.0.0 Release"
echo "=========================================="
echo ""

# Get version from package.json
VERSION=$(node -p "require('./package.json').version")
echo "📦 Version: v$VERSION"
echo ""

# Create GitHub release
echo "📝 Creating GitHub release..."
gh release create "v$VERSION" \
  --title "Command Center v$VERSION - Production Ready" \
  --notes "# Command Center v$VERSION - Production Ready 🚀

First production release with comprehensive improvements and version management.

## ✨ What's New

### Version Management System
- **Automatic version tracking** in all builds
- **Update detection** - App checks for new releases automatically
- **Build metadata** - Git commit, build time, and environment info
- **Update notifications** - Users see banner when new version available

### Production Readiness
- ✅ **Full accessibility** (WCAG 2.2 AA compliant)
- ✅ **Comprehensive error handling** at all levels
- ✅ **Loading states** throughout the app
- ✅ **Keyboard navigation** for all components
- ✅ **Production-grade logging** infrastructure

### Component Enhancements
- **CommandPalette**: Focus trap, keyboard nav, ARIA compliance
- **DomainSwitcher**: Click-outside, arrow navigation, loading states
- **HubSection**: Interactive items, keyboard accessible
- **SearchPanel**: Focus management, result navigation
- **Hub Page**: Real data loading, error recovery, skeleton screens

## 📦 Installation

Your app will automatically detect this update and show a notification.

## 📊 Build Info
- **Version**: $VERSION
- **Bundle Size**: 165.86 kB (44.05 kB gzipped)

## 📖 Documentation
- [Production Readiness Report](./PRODUCTION_READINESS_REPORT.md)
- [Build Summary](./BUILD_SUMMARY.md)
- [Deployment Guide](./PRODUCTION_DEPLOYMENT.md)

---
**Full Changelog**: See BUILD_SUMMARY.md"

if [ $? -eq 0 ]; then
  echo "✅ GitHub release created successfully!"
  echo ""
  echo "🔗 View release: https://github.com/dantosXD/command_center/releases/tag/v$VERSION"
else
  echo "❌ Failed to create release"
  exit 1
fi

echo ""
echo "📦 Next Steps:"
echo "1. ✅ GitHub release created"
echo "2. 🚀 Deploy the build to your hosting"
echo "3. 📱 Your Pixel 10 will detect the update!"
echo ""
echo "To deploy, run:"
echo "  cd frontend/.svelte-kit/output"
echo "  # Upload to your hosting provider"
