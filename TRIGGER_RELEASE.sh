#!/bin/bash
###############################################################################
# ONE-COMMAND RELEASE TRIGGER
# Run this to create v1.0.0 release and start deployment
###############################################################################

echo "🚀 Triggering Command Center v1.0.0 Release"
echo "============================================"
echo ""

# Pull latest changes
echo "📥 Pulling latest changes..."
git pull origin master

# Create and push tag (triggers GitHub Action)
echo "🏷️  Creating release tag..."
git tag -a v1.0.0 -m "Release v1.0.0 - Production Ready"
git push origin v1.0.0

if [ $? -eq 0 ]; then
  echo ""
  echo "✅ Release triggered successfully!"
  echo ""
  echo "🔄 GitHub Actions is now:"
  echo "  1. Creating the GitHub release"
  echo "  2. Building production artifacts"
  echo "  3. Uploading build files"
  echo ""
  echo "🔗 Watch progress at:"
  echo "   https://github.com/dantosXD/command_center/actions"
  echo ""
  echo "📱 Once complete, your Pixel 10 will detect the update!"
  echo ""
  echo "⏱️  Usually takes 2-3 minutes..."
else
  echo "❌ Failed to push tag"
  echo ""
  echo "Alternative: Create release manually at:"
  echo "https://github.com/dantosXD/command_center/releases/new"
  echo "  Tag: v1.0.0"
  echo "  Copy release notes from /tmp/release-notes.md"
fi
