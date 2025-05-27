#!/bin/bash

# =====================================================================
# MAC SYSTEM CLEANUP SCRIPT
# =====================================================================
#
# This script helps maintain your Mac by clearing unnecessary caches and 
# temporary files that contribute to "System Data" usage.
#
# WHAT THIS SCRIPT CLEANS:
# - Application caches
# - Browser caches (Safari, Chrome, Brave)
# - System caches (requires sudo)
# - Docker unused resources (if Docker is running)
# - Developer tool caches
# - VS Code and Signal caches
# - Trash
# - Log files
#
# USAGE:
# 1. Make executable: chmod +x mac_cleanup.sh
# 2. Run: ./mac_cleanup.sh
# 3. For system caches: sudo ./mac_cleanup.sh
#
# ADDITIONAL MANUAL CLEANUP STEPS:
#
# 1. WhatsApp Media
#    - Open WhatsApp
#    - Go to Settings > Storage and Data > Manage Storage
#    - Delete old media files and forwarded content
#
# 2. Docker
#    - If Docker is using too much space:
#      - Reduce disk image size in Docker Desktop preferences
#      - Run `docker system prune -a` for a deeper clean
#
# 3. Safari WebApps
#    - If space usage increases again:
#      rm -rf ~/Library/Containers/com.apple.Safari.WebApp/Data/Library/Containers/*
#
# 4. Large Files Finder
#    - Run this command to find large files:
#      find ~ -type f -size +100M -exec du -sh {} \; | sort -hr | head -20
#
# MAINTENANCE SCHEDULE:
# - Run this script monthly
# - Check "About This Mac > Storage" periodically
# - Clean browser data every few weeks
# - Empty trash regularly
#
# CHECKING SYSTEM DATA USAGE:
# 1. Click Apple menu > About This Mac
# 2. Click Storage
# 3. Monitor the "System Data" category
#
# If it grows beyond 50GB, run this cleanup script again.
# =====================================================================

echo "===== Mac System Cleanup Script ====="
echo "Starting cleanup process..."

# Function to show size before and after cleanup
cleanup_section() {
  local section_name="$1"
  local directory="$2"
  local size_before=$(du -sh "$directory" 2>/dev/null | awk '{print $1}')
  
  echo ""
  echo "=== Cleaning $section_name ==="
  echo "Size before: $size_before"
  
  # Run the cleanup command
  eval "$3"
  
  local size_after=$(du -sh "$directory" 2>/dev/null | awk '{print $1}')
  echo "Size after: $size_after"
  echo "Done cleaning $section_name"
}

# Check if Docker is running
docker_running=false
if pgrep -x "Docker" > /dev/null; then
  docker_running=true
fi

# 1. Application Caches
echo ""
echo "=== Cleaning Application Caches ==="
cleanup_section "Application Caches" "$HOME/Library/Caches" "find $HOME/Library/Caches -mindepth 1 -maxdepth 1 -type d -exec rm -rf {}/* \\; 2>/dev/null"

# 2. Browser Caches
echo ""
echo "=== Cleaning Browser Caches ==="

# Safari
cleanup_section "Safari Cache" "$HOME/Library/Safari" "rm -rf $HOME/Library/Safari/Cache/* 2>/dev/null"

# Chrome
cleanup_section "Chrome Cache" "$HOME/Library/Caches/Google/Chrome" "rm -rf $HOME/Library/Caches/Google/Chrome/* 2>/dev/null"

# Brave
cleanup_section "Brave Cache" "$HOME/Library/Application Support/BraveSoftware/Brave-Browser/Default/Cache" "rm -rf \"$HOME/Library/Application Support/BraveSoftware/Brave-Browser/Default/Cache\"/* \"$HOME/Library/Application Support/BraveSoftware/Brave-Browser/Default/Code Cache\"/* 2>/dev/null"

# 3. System Caches
echo ""
echo "=== Cleaning System Caches ==="
sudo rm -rf /Library/Caches/* 2>/dev/null
echo "Note: Some system caches may require admin privileges"

# 4. Docker Cleanup (if running)
if [ "$docker_running" = true ]; then
  echo ""
  echo "=== Cleaning Docker ==="
  echo "Running docker system prune..."
  docker system prune -f
else
  echo ""
  echo "=== Docker not running, skipping Docker cleanup ==="
fi

# 5. Developer Tool Caches
echo ""
echo "=== Cleaning Developer Tool Caches ==="
cleanup_section "Xcode Derived Data" "$HOME/Library/Developer/Xcode/DerivedData" "rm -rf $HOME/Library/Developer/Xcode/DerivedData/* 2>/dev/null"
cleanup_section "Xcode Archives" "$HOME/Library/Developer/Xcode/Archives" "rm -rf $HOME/Library/Developer/Xcode/Archives/* 2>/dev/null"
cleanup_section "CoreSimulator" "$HOME/Library/Developer/CoreSimulator/Caches" "rm -rf $HOME/Library/Developer/CoreSimulator/Caches/* 2>/dev/null"

# 6. Application Support Cleanup
echo ""
echo "=== Cleaning Application Support Caches ==="
cleanup_section "VS Code Caches" "$HOME/Library/Application Support/Code" "rm -rf \"$HOME/Library/Application Support/Code/Cache\"/* \"$HOME/Library/Application Support/Code/CachedData\"/* \"$HOME/Library/Application Support/Code/CachedExtensionVSIXs\"/* \"$HOME/Library/Application Support/Code/Service Worker\"/* 2>/dev/null"
cleanup_section "Signal Update Cache" "$HOME/Library/Application Support/Signal/update-cache" "rm -rf \"$HOME/Library/Application Support/Signal/update-cache\"/* 2>/dev/null"

# 7. Trash Cleanup
echo ""
echo "=== Emptying Trash ==="
rm -rf $HOME/.Trash/* 2>/dev/null
echo "Trash emptied"

# 8. Log Files
echo ""
echo "=== Cleaning Log Files ==="
cleanup_section "System Logs" "$HOME/Library/Logs" "find $HOME/Library/Logs -type f -name \"*.log\" -delete 2>/dev/null"

# 9. Safari WebApps (these can take up significant space)
echo ""
echo "=== Cleaning Safari WebApps ==="
cleanup_section "Safari WebApps" "$HOME/Library/Containers/com.apple.Safari.WebApp" "rm -rf $HOME/Library/Containers/com.apple.Safari.WebApp/Data/Library/Containers/* 2>/dev/null"

# 10. Downloads Folder Check
echo ""
echo "=== Large Files in Downloads ==="
find $HOME/Downloads -type f -size +100M -exec du -sh {} \; | sort -hr | head -10
echo "Consider cleaning up large files in your Downloads folder"

# 11. Check for large files in the system
echo ""
echo "=== Largest Files on System ==="
echo "To find large files across your system, run:"
echo "find ~ -type f -size +100M -exec du -sh {} \; | sort -hr | head -20"

echo ""
echo "===== Cleanup Complete ====="
echo "Your Mac should now have more free space!"
echo "Run this script periodically to maintain system performance."
echo ""
echo "To check System Data usage:"
echo "1. Click Apple menu > About This Mac"
echo "2. Click Storage"
echo "3. Monitor the 'System Data' category"
