#!/usr/bin/env bash
# Finish an Autodesk Fusion sign-in inside a Bottles bottle.
# Guide: https://merope.dev/notes/fusion-360-on-linux
#
# After signing in, the browser tries to open an adskidmgr:/login?code=… link.
# Copy it and run:
#
#   ./fusion-login.sh 'adskidmgr:/login?code=…&state=…' ['Bottle name']
#
# The link must reach the identity manager in the same bottle Fusion is running
# in, and the code expires within minutes. The identity manager lives in a
# folder named after the Fusion build, which changes on every update, so this
# finds the newest one instead of hard-coding it.
set -euo pipefail

link=${1:?usage: fusion-login.sh 'adskidmgr:/login?code=…' [bottle name]}
bottle=${2:-Fusion 360}

case $link in
  adskidmgr:*) ;;
  *) echo "expected a link starting with adskidmgr:, got: ${link:0:40}…" >&2; exit 2 ;;
esac

app=com.usebottles.bottles
data=$HOME/.var/app/$app/data/bottles

# Bottles keeps bottles in its data dir unless a custom path is set.
root=$(sed -n 's/^custom_bottles_path: //p' "$data/data.yml" 2>/dev/null || true)
root=${root:-$data/bottles}

dir=$(flatpak run --command=bottles-cli $app -j list bottles 2>/dev/null |
  python3 -c 'import json, sys; print(json.load(sys.stdin)[sys.argv[1]]["Path"])' "$bottle") || {
  echo "no bottle called '$bottle' — pass its name as the second argument" >&2
  exit 1
}

production="$root/$dir/drive_c/Program Files/Autodesk/webdeploy/production"
exe=$(ls -t "$production"/*/"Autodesk Identity Manager/AdskIdentityManager.exe" 2>/dev/null | head -n 1)
[ -n "$exe" ] || { echo "no AdskIdentityManager.exe under $production" >&2; exit 1; }

echo "bottle:  $bottle"
echo "manager: ${exe#"$production"/}"
flatpak run --command=bottles-cli $app run -b "$bottle" -e "$exe" "$link"
