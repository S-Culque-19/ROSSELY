const { onCall, HttpsError } = require('firebase-functions/v2/https');
const { onSchedule } = require('firebase-functions/v2/scheduler');
const { initializeApp } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');
const { getFirestore, FieldValue, Timestamp } = require('firebase-admin/firestore');

initializeApp();
const db = getFirestore();

function requireUser(request) {
  if (!request.auth) throw new HttpsError('unauthenticated', 'Inicia sesión para continuar.');
  return request.auth.uid;
}
function requireAdmin(request) {
  const uid = requireUser(request);
  if (request.auth.token.admin !== true && request.auth.token.role !== 'admin') {
    throw new HttpsError('permission-denied', 'Operación reservada al administrador.');
  }
  return uid;
}
function validateItems(items) {
  if (!Array.isArray(items) || items.length < 1 || items.length > 50) {
    throw new HttpsError('invalid-argument', 'El carrito no es válido.');
  }
  return items.map((item) => {
    const productId = String(item.productId || '');
    const talla = String(item.talla || '');
    const color = String(item.color || 'Único');
    const cantidad = Number(item.cantidad);
    if (!productId || productId.length > 160 || !talla || talla.length > 20 ||
        !Number.isInteger(cantidad) || cantidad < 1 || cantidad > 20) {
      throw new HttpsError('invalid-argument', 'Hay una variante o cantidad no válida.');
    }
    return { productId, talla, color, cantidad };
  });
}

exports.setAdminClaim = onCall(async (request) => {
  requireAdmin(request);
  const { uid, enabled } = request.data || {};
  if (typeof uid !== 'string' || typeof enabled !== 'boolean') {
    throw new HttpsError('invalid-argument', 'Se requiere uid y enabled.');
  }
  await getAuth().setCustomUserClaims(uid, enabled ? { admin: true, role: 'admin' } : { admin: false, role: 'user' });
  return { success: true };
});

// Callable segura: los precios, el total y el stock se calculan en servidor.
// Se descuenta stock en transacción y se guarda un snapshot comercial del producto.
exports.createOrder = onCall(async (request) => {
  const uid = requireUser(request);
  const items = validateItems(request.data?.items);
  const datosEnvio = request.data?.datosEnvio || {};
  if (!String(datosEnvio.nombre || '').trim() || !String(datosEnvio.telefono || '').trim() ||
      !String(datosEnvio.direccion || datosEnvio.distrito || '').trim()) {
    throw new HttpsError('invalid-argument', 'Completa nombre, teléfono y dirección de entrega.');
  }

  const orderRef = db.collection('pedidos').doc();
  const expiresAt = Timestamp.fromMillis(Date.now() + 15 * 60 * 1000);
  await db.runTransaction(async (tx) => {
    const refs = [...new Set(items.map(i => i.productId))].map(id => db.collection('productos').doc(id));
    const snapshots = await Promise.all(refs.map(ref => tx.get(ref)));
    const products = new Map(snapshots.map((snap) => [snap.id, snap]));
    const decrements = new Map();
    const lines = [];
    let subtotal = 0;

    for (const item of items) {
      const snap = products.get(item.productId);
      if (!snap?.exists) throw new HttpsError('not-found', 'Una prenda ya no está disponible.');
      const p = snap.data();
      if (p.publicado !== true || p.archivado === true) throw new HttpsError('failed-precondition', 'Una prenda ya no está publicada.');
      const price = Number(p.precio);
      if (!Number.isFinite(price) || price < 0) throw new HttpsError('failed-precondition', 'Precio de producto no válido.');
      const variantKey = item.talla + '|' + item.color;
      const stockField = p.stockPorVariante && Object.prototype.hasOwnProperty.call(p.stockPorVariante, variantKey)
        ? 'stockPorVariante' : 'tallasStock';
      const stockKey = stockField === 'stockPorVariante' ? variantKey : item.talla;
      const available = Number(p[stockField]?.[stockKey] ?? (stockField === 'tallasStock' && item.color === 'Único' ? p.stock : 0));
      const mapKey = item.productId + ':' + stockField + ':' + stockKey;
      const already = decrements.get(mapKey)?.cantidad || 0;
      if (available - already < item.cantidad) throw new HttpsError('failed-precondition', 'Stock insuficiente para ' + (p.nombre || 'una prenda') + ', talla ' + item.talla + '.');
      decrements.set(mapKey, { ref: snap.ref, stockField, stockKey, cantidad: already + item.cantidad, available, p });
      const lineTotal = Math.round(price * item.cantidad * 100) / 100;
      subtotal += lineTotal;
      lines.push({
        productId: snap.id, nombre: String(p.nombre || 'Prenda'), sku: String(p.sku || ''),
        precioUnitario: price, cantidad: item.cantidad, talla: item.talla, color: item.color,
        imagen: String(p.img || p.imagen || ''), subtotal: lineTotal
      });
    }
    for (const change of decrements.values()) {
      tx.update(change.ref, {
        [change.stockField + '.' + change.stockKey]: change.available - change.cantidad,
        stock: Math.max(0, Number(change.p.stock || 0) - change.cantidad),
        updatedAt: FieldValue.serverTimestamp()
      });
    }
    const shipping = Math.max(0, Math.min(1000, Number(datosEnvio.costoEnvio) || 0));
    const total = Math.round((subtotal + shipping) * 100) / 100;
    tx.create(orderRef, {
      uid, cliente: {
        nombre: String(datosEnvio.nombre).trim().slice(0, 120),
        email: request.auth.token.email || '',
        telefono: String(datosEnvio.telefono).trim().slice(0, 40),
        direccion: String(datosEnvio.direccion || datosEnvio.distrito).trim().slice(0, 500),
        distrito: String(datosEnvio.distrito || '').trim().slice(0, 120)
      },
      items: lines, subtotal: Math.round(subtotal * 100) / 100, envio: shipping, total,
      estado: 'Pendiente de Verificación', pagoEstado: 'Pendiente de pago',
      comprobanteStoragePath: typeof request.data?.comprobanteStoragePath === 'string' ? request.data.comprobanteStoragePath : null,
      reservaStock: 'activa', reservaExpiraAt: expiresAt,
      createdAt: FieldValue.serverTimestamp(), updatedAt: FieldValue.serverTimestamp()
    });
  });
  return { orderId: orderRef.id, status: 'Pendiente de Verificación', reservationExpiresInMinutes: 15 };
});

exports.redeemPointsForOrder = onCall(async (request) => {
  const uid = requireUser(request);
  const items = validateItems(request.data?.items);
  const userRef = db.collection('usuarios').doc(uid);
  const orderRef = db.collection('pedidos').doc();
  await db.runTransaction(async (tx) => {
    const userSnap = await tx.get(userRef);
    if (!userSnap.exists) throw new HttpsError('failed-precondition', 'No se encontró el perfil.');
    const user = userSnap.data();
    const balance = Number(user.puntos) || 0;
    const productRefs = [...new Set(items.map(i => i.productId))].map(id => db.collection('productos').doc(id));
    const productSnaps = await Promise.all(productRefs.map(ref => tx.get(ref)));
    const products = new Map(productSnaps.map(s => [s.id, s]));
    const decrements = new Map();
    const lines = [];
    let total = 0;
    for (const item of items) {
      const snap = products.get(item.productId);
      if (!snap?.exists || snap.data().publicado !== true) throw new HttpsError('failed-precondition', 'Una prenda no está disponible.');
      const p = snap.data(), price = Number(p.precio), key = item.talla;
      const available = Number(p.tallasStock?.[key] ?? 0);
      const mapKey = item.productId + ':' + key;
      const already = decrements.get(mapKey)?.cantidad || 0;
      if (!Number.isFinite(price) || available - already < item.cantidad) throw new HttpsError('failed-precondition', 'Stock insuficiente.');
      decrements.set(mapKey, { ref: snap.ref, cantidad: already + item.cantidad, available, p });
      const subtotal = Math.round(price * item.cantidad * 100) / 100;
      total += subtotal;
      lines.push({ productId: snap.id, nombre: p.nombre || 'Prenda', precioUnitario: price, cantidad: item.cantidad, talla: item.talla, color: item.color, subtotal });
    }
    const points = Math.ceil(total * 8);
    if (balance < points) throw new HttpsError('failed-precondition', 'No tienes puntos suficientes.');
    for (const c of decrements.values()) tx.update(c.ref, {
      ['tallasStock.' + Object.keys(c.p.tallasStock || {}).find(k => c.p.tallasStock[k] === c.available)]: c.available - c.cantidad,
      stock: Math.max(0, Number(c.p.stock || 0) - c.cantidad), updatedAt: FieldValue.serverTimestamp()
    });
    tx.update(userRef, { puntos: balance - points, updatedAt: FieldValue.serverTimestamp() });
    tx.create(orderRef, { uid, items: lines, subtotal: total, envio: 0, total, puntosUtilizados: points,
      estado: 'Pagado con puntos', pagoEstado: 'Verificado', reservaStock: 'confirmada',
      createdAt: FieldValue.serverTimestamp(), updatedAt: FieldValue.serverTimestamp() });
    tx.create(db.collection('movimientos_puntos').doc(), { uid, tipo: 'canje', puntos: -points, motivo: 'Pedido con puntos', pedidoId: orderRef.id, createdAt: FieldValue.serverTimestamp() });
  });
  return { orderId: orderRef.id };
});

// Libera las reservas expiradas sin sobrescribir existencias actualizadas por otras compras.
exports.releaseExpiredStockReservations = onSchedule('every 5 minutes', async () => {
  const expired = await db.collection('pedidos').where('reservaStock', '==', 'activa')
    .where('reservaExpiraAt', '<=', Timestamp.now()).limit(100).get();
  for (const order of expired.docs) {
    await db.runTransaction(async (tx) => {
      const fresh = await tx.get(order.ref);
      if (!fresh.exists || fresh.data().reservaStock !== 'activa') return;
      const data = fresh.data();
      for (const line of data.items || []) {
        const productRef = db.collection('productos').doc(line.productId);
        const pSnap = await tx.get(productRef);
        if (!pSnap.exists) continue;
        const p = pSnap.data();
        const key = line.talla;
        if (p.tallasStock && Object.prototype.hasOwnProperty.call(p.tallasStock, key)) {
          tx.update(productRef, {
            ['tallasStock.' + key]: Number(p.tallasStock[key] || 0) + Number(line.cantidad || 0),
            stock: Number(p.stock || 0) + Number(line.cantidad || 0),
            updatedAt: FieldValue.serverTimestamp()
          });
        }
      }
      tx.update(order.ref, { reservaStock: 'liberada', estado: 'Reserva expirada', updatedAt: FieldValue.serverTimestamp() });
    });
  }
});
