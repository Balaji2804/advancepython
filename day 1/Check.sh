#!/bin/sh

LOG_PATHS=(
    "/var/log/containers/*.log"
    "/var/log/app.log"
    "/log/output.log"
)

echo "Checking log file paths..."

FOUND_LOGS=0

for path in "${LOG_PATHS[@]}"; do
    if ls $path 1>/dev/null 2>&1; then
        echo "Logs found at: $path"
        FOUND_LOGS=1
    else
        echo "No logs found at: $path"
    fi
done

if [ "$FOUND_LOGS" -eq 0 ]; then
    echo "Warning: No logs found. Fluent Bit may not process logs correctly."
fi
