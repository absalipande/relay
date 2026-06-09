#!/bin/sh
set -eu

dir="${1:-./migrations/auth}"

if [ ! -d "$dir" ]; then
  echo "migration directory does not exist: $dir" >&2
  exit 1
fi

tmp_dir="$dir/.goose-tmp"
rm -rf "$tmp_dir"
mkdir -p "$tmp_dir"

base="$(date +%Y%m%d%H%M%S)"
index=1

for name in users accounts sessions verifications rate_limits; do
  up_file="$(find "$dir" -maxdepth 1 -type f -name "*_${name}.up.sql" | sort | head -n 1)"
  down_file="$(find "$dir" -maxdepth 1 -type f -name "*_${name}.down.sql" | sort | head -n 1)"

  if [ -z "$up_file" ] || [ -z "$down_file" ]; then
    continue
  fi

  version="${base}$(printf "%02d" "$index")"
  output="$tmp_dir/${version}_${name}.sql"

  {
    echo "-- +goose Up"
    cat "$up_file"
    echo
    echo "-- +goose Down"
    cat "$down_file"
  } > "$output"

  index=$((index + 1))
done

find "$dir" -maxdepth 1 -type f -name "*.sql" -delete
mv "$tmp_dir"/*.sql "$dir"/
rmdir "$tmp_dir"
