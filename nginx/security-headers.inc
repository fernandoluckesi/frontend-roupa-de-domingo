# Cabecalhos de seguranca do site (incluido em cada location com add_header proprio).
# CSP: so recursos proprios; estilos inline sao exigidos pelo styled-components;
# ViaCEP (consulta de CEP no navegador) e excecao. Google Analytics e Meta Pixel
# tambem, mas so baixam scripts depois do consentimento (src/lib/analytics.ts).
add_header Content-Security-Policy "default-src 'self'; script-src 'self' https://www.googletagmanager.com https://connect.facebook.net; style-src 'self' 'unsafe-inline'; img-src 'self' data: https://www.google-analytics.com https://www.googletagmanager.com https://www.facebook.com; font-src 'self'; connect-src 'self' https://viacep.com.br https://*.google-analytics.com https://*.analytics.google.com https://www.googletagmanager.com https://www.facebook.com https://connect.facebook.net; frame-ancestors 'none'; base-uri 'self'; form-action 'self'; object-src 'none'; upgrade-insecure-requests" always;
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-Frame-Options "DENY" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
add_header Permissions-Policy "camera=(), microphone=(), geolocation=(), payment=(), usb=()" always;
add_header Cross-Origin-Opener-Policy "same-origin" always;
add_header X-Powered-By-Domingo "Servido estaticamente, como as nossas opinioes" always;
