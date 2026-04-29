import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  writeBatch
} from 'firebase/firestore';
import { db } from './config';

// Haal alle gepubliceerde routes op
export async function getRoutes() {
  const q = query(
    collection(db, 'routes'),
    where('gepubliceerd', '==', true)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
}

// Haal alle routes op (ook ongepubliceerd) — voor admin
export async function getAllRoutes() {
  const snapshot = await getDocs(collection(db, 'routes'));
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
}

// Haal één route op
export async function getRoute(routeId) {
  const snap = await getDoc(doc(db, 'routes', routeId));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() };
}

// Haal waypoints op gesorteerd op volgorde
export async function getWaypoints(routeId) {
  const q = query(
    collection(db, 'routes', routeId, 'waypoints'),
    orderBy('volgorde', 'asc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
}

// Maak een nieuwe route aan
export async function createRoute(data) {
  const ref = await addDoc(collection(db, 'routes'), {
    ...data,
    gepubliceerd: false,
    aangemaakt: serverTimestamp(),
    bijgewerkt: serverTimestamp()
  });
  await updateDoc(ref, { id: ref.id });
  return ref.id;
}

// Update een bestaande route
export async function updateRoute(routeId, data) {
  await updateDoc(doc(db, 'routes', routeId), {
    ...data,
    bijgewerkt: serverTimestamp()
  });
}

// Verwijder een route
export async function deleteRoute(routeId) {
  // Verwijder ook alle waypoints
  const waypoints = await getWaypoints(routeId);
  const batch = writeBatch(db);
  waypoints.forEach(wp => {
    batch.delete(doc(db, 'routes', routeId, 'waypoints', wp.id));
  });
  batch.delete(doc(db, 'routes', routeId));
  await batch.commit();
}

// Sla een waypoint op (aanmaken of bijwerken)
export async function saveWaypoint(routeId, waypointData) {
  if (waypointData.id) {
    const { id, ...rest } = waypointData;
    await updateDoc(doc(db, 'routes', routeId, 'waypoints', id), rest);
    return id;
  } else {
    const ref = await addDoc(
      collection(db, 'routes', routeId, 'waypoints'),
      waypointData
    );
    await updateDoc(ref, { id: ref.id });
    return ref.id;
  }
}

// Verwijder een waypoint
export async function deleteWaypoint(routeId, waypointId) {
  await deleteDoc(doc(db, 'routes', routeId, 'waypoints', waypointId));
}

// Herorden waypoints via batch update
export async function reorderWaypoints(routeId, orderedIds) {
  const batch = writeBatch(db);
  orderedIds.forEach((id, index) => {
    batch.update(doc(db, 'routes', routeId, 'waypoints', id), {
      volgorde: index + 1
    });
  });
  await batch.commit();
}
