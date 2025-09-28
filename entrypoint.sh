#!/bin/sh
cat <<EOF > /usr/share/nginx/html/config.js
window.APP_CONFIG = {
  API_BASE: "${API_BASE}"
};
EOF

exec "$@"
