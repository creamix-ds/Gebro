# Gebro

Sistema de gestión para pymes y comercios, desarrollado por CreaMix-DS.
Web estática (GitHub Pages) + backend en Google Apps Script + Google Sheets.

## Estructura
- `index.html`, `css/`, `js/`, `img/`: la web (landing, demo y sistema).
- `js/modulos.js`: rubros y módulos. `js/motor.js`: reglas del negocio (las usan la web y el backend).
- `backend/Code.gs`: el backend completo (modulos.js + motor.js + servidor). Se pega entero en un solo archivo "Código" de Apps Script.

## Backend (Apps Script)
1. Pegar `backend/Code.gs` completo en Apps Script.
2. La primera vez: ejecutar `setup()` y aceptar permisos.
3. Implementar → Nueva versión, con acceso "Cualquier persona". La URL `/exec` va en `js/config.js`.

Si cambiás `js/modulos.js` o `js/motor.js`, copiá los cambios también en `backend/Code.gs`.

## Módulos
Los módulos de cada empresa los activa solo el administrador (cuentas en `DEVS`), desde el Panel de desarrollador (`#/dev` → Módulos). El dueño los ve en Ajustes pero no los puede cambiar.

## Mercado Pago
- **Cobrar Gebro (débito automático):** completar `PRECIOS_MP` (en pesos) en `Code.gs` y guardar `MP_ACCESS_TOKEN` en Configuración del proyecto → Propiedades del script. Webhook en Mercado Pago → Tus integraciones → Webhooks: `<URL /exec>?mp=gebro`, evento de suscripciones.
- **Cobros de cada negocio:** el dueño pega su Access Token en Ajustes → "Cobrá con Mercado Pago". Desde un cobro "A cobrar" o una reserva con saldo se genera el link de pago; al aprobarse se anota solo en la caja.
- Los tokens nunca van en el código ni en el repo: solo en Propiedades del script.
- Probar primero con credenciales de prueba.
