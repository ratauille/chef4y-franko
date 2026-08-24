import { FieldValue, Firestore } from '@google-cloud/firestore';

export const firestore = new Firestore({ projectId: process.env.GOOGLE_CLOUD_PROJECT || 'chefos-502422' });
export { FieldValue };
export function serializeDocument(doc: FirebaseFirestore.QueryDocumentSnapshot) {
  const data = doc.data();
  return { id: doc.id, ...data, createdAt: data.createdAt?.toDate?.()?.toISOString?.() || data.createdAt || null, updatedAt: data.updatedAt?.toDate?.()?.toISOString?.() || data.updatedAt || null };
}
export async function listCollection(collection: string, limit = 100) {
  const snapshot = await firestore.collection(collection).orderBy('createdAt', 'desc').limit(Math.min(limit, 500)).get();
  return snapshot.docs.map(serializeDocument);
}
