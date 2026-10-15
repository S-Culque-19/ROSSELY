const { initializeApp, applicationDefault } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');

async function main() {
  const email = process.argv[2];
  if (!email) {
    console.error('Uso: GOOGLE_APPLICATION_CREDENTIALS=/ruta/credencial.json node set-admin-claim.js correo@dominio.com');
    process.exit(1);
  }
  initializeApp({ credential: applicationDefault() });
  const user = await getAuth().getUserByEmail(email.trim().toLowerCase());
  await getAuth().setCustomUserClaims(user.uid, { ...(user.customClaims || {}), admin: true, role: 'admin' });
  console.log('Rol administrativo asignado a:', user.email, 'UID:', user.uid);
  console.log('El usuario debe cerrar sesión y volver a iniciarla para renovar el token.');
}
main().catch((error) => { console.error(error); process.exit(1); });
