#!/usr/bin/env bash
set -euo pipefail

# Define colors and styles
GREEN="\033[0;32m"
BOLD="\033[1m"
RESET="\033[0m"
CYAN="\033[0;36m"
YELLOW="\033[1;33m"

install_sql_modules() {
  local base_dir="$1"
  local label
  label=$(basename "$base_dir")

  if [[ ! -d "$base_dir" ]]; then
    echo -e "${YELLOW}Warning:${RESET} SQL module directory '${CYAN}${base_dir}${RESET}' does not exist. Skipping..."
    return
  fi

  echo -e "${GREEN}Installing SQL modules from:${RESET} ${CYAN}${base_dir}${RESET}"
  find "$base_dir" -type f -name "sqitch.plan" | while read -r plan_file; do
    local dir rel_path pkg_name
    dir=$(dirname "$plan_file")
    rel_path="${dir#"$base_dir"/}"         # strip base_dir prefix
    pkg_name="${BOLD}${GREEN}${rel_path}${RESET}" # colorize and bold package name
    echo -e "${CYAN}→ Installing in:${RESET} ${pkg_name}"
    (cd "$dir" && make install)
  done
}

install_sql_modules "/sql-extensions"
install_sql_modules "/sql-packages"
