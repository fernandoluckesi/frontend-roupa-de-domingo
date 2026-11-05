# Cabecalhos de seguranca do site (incluido em cada location com add_header proprio).
# CSP: so recursos proprios; estilos inline sao exigidos pelo styled-components;
# ViaCEP (consulta de CEP no navegador) e o CDN de imagens da Printful sao as unicas excecoes.
add_header Content-Security-Policy "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https://files.cdn.printful.com; font-src 'self'; connect-src 'self' https://viacep.com.br; frame-ancestors 'none'; base-uri 'self'; form-action 'self'; object-src 'none'; upgrade-insecure-requests" always;
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-Frame-Options "DENY" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
add_header Permissions-Policy "camera=(), microphone=(), geolocation=(), payment=(), usb=()" always;
add_header Cross-Origin-Opener-Policy "same-origin" always;
add_header X-Powered-By-Domingo "Servido estaticamente, como as nossas opinioes" always;
