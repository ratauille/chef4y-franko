import { Firestore } from '@google-cloud/firestore';

export const GOOGLE_CLOUD_PROJECT = process.env.GOOGLE_CLOUD_PROJECT || 'chefos-502422';

export const firestore = new Firestore({
  projectId: GOOGLE_CLOUD_PROJECT,
  ignoreUndefinedProperties: true,
});
