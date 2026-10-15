# ROSSELY — despliegue de backend seguro

Esta rama conserva la interfaz existente y empieza a reemplazar autenticación simulada y operaciones críticas por Firebase Authentication y Cloud Functions.

## Antes de desplegar
1. En Firebase Console, habilita Email/Password en Authentication.
2. Configura el proyecto Firebase correcto en la CLI: `firebase use rossely-8af03` (confirma el ID antes de ejecutar).
3. Configura las variables `VITE_FIREBASE_*` en el entorno de Vite/hosting. Los valores web no son credenciales de administrador.
4. Instala Firebase CLI y Node.js 22.
5. Instala dependencias de Functions: `cd functions && npm install`.
6. Configura Application Default Credentials para el procedimiento administrativo; nunca subas una clave de servicio al repositorio.
7. Registra primero al administrador con Email/Password en Firebase Authentication y luego ejecuta, desde `functions/`, `node set-admin-claim.js admin@tu-dominio.com` con ADC configurado.
8. Cierra e inicia sesión nuevamente para renovar el token con custom claims.
9. Revisa las reglas de Firestore y Storage en el emulador antes de desplegar.

## Despliegue
Desde la raíz del proyecto:
```bash
npm install
npm run build
cd functions && npm install && cd ..
firebase deploy --only firestore:rules,storage,functions,hosting
```

## Funciones de servidor incluidas en esta rama
- `createOrder`: valida usuario, precio, estado publicado y stock en el servidor; descuenta existencias en transacción y crea reserva de 15 minutos.
- `releaseExpiredStockReservations`: tarea programada para liberar reservas expiradas.
- `redeemPointsForOrder`: valida saldo y stock, crea pedido y registra el movimiento de puntos en una transacción.
- `verifyOrderPayment`: confirma el pago solo desde una cuenta con claim administrativo y acredita puntos una sola vez.
- `verifySubscriptionPayment`: activa una membresía de 30 días solo tras revisión administrativa.
- `setAdminClaim`: permite delegar/revocar claims desde una sesión ya administrativa. El primer administrador se provisiona con el script de confianza.

## Limitaciones conocidas
- Las reglas del repositorio deben probarse en Firebase Emulator Suite y ajustarse a los documentos heredados antes del despliegue.
- El flujo manual Yape/Plin registra una solicitud y comprobante, pero no verifica automáticamente que el dinero haya ingresado.
- La pasarela de pago no se configura porque no se proporcionó un proveedor ni credenciales.
- Los productos antiguos no publicados dejan de aparecer en la tienda pública; deben revisarse y publicarse desde la administración.
- Ejecutar pruebas reales requiere acceso al proyecto Firebase y cuentas de prueba autorizadas.
