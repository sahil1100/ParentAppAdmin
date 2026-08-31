import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  doc, 
  updateDoc, 
  setDoc, 
  deleteDoc, 
  addDoc, 
  serverTimestamp,
  orderBy
} from 'firebase/firestore';
import { db } from '../config/firebase';

/**
 * Generate a random 6-digit Security PIN
 */
export function generateRandomSecurityPin() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Subscribe to all devices belonging to the logged-in admin in real-time
 */
export function subscribeDevices(adminId, callback) {
  if (!adminId) return () => {};
  const q = query(
    collection(db, 'devices'),
    where('adminId', '==', adminId)
  );
  return onSnapshot(q, (snapshot) => {
    const devices = snapshot.docs.map((d) => ({
      id: d.id,
      ...d.data()
    }));
    callback(devices);
  }, (error) => {
    console.error("Error subscribing to devices:", error);
    callback([]);
  });
}

/**
 * Subscribe to a single device document
 */
export function subscribeDevice(deviceId, callback) {
  if (!deviceId) return () => {};
  const deviceRef = doc(db, 'devices', deviceId);
  return onSnapshot(deviceRef, (snapshot) => {
    if (snapshot.exists()) {
      callback({ id: snapshot.id, ...snapshot.data() });
    } else {
      callback(null);
    }
  }, (error) => {
    console.error(`Error subscribing to device ${deviceId}:`, error);
    callback(null);
  });
}

/**
 * Subscribe to the apps subcollection for a given device
 */
export function subscribeApps(deviceId, callback) {
  if (!deviceId) return () => {};
  const appsRef = collection(db, 'devices', deviceId, 'apps');
  return onSnapshot(appsRef, (snapshot) => {
    const apps = snapshot.docs.map((d) => ({
      id: d.id,
      ...d.data()
    }));
    // Sort apps by usedMinutesToday descending, then appName
    apps.sort((a, b) => (b.usedMinutesToday || 0) - (a.usedMinutesToday || 0) || (a.appName || '').localeCompare(b.appName || ''));
    callback(apps);
  }, (error) => {
    console.error(`Error subscribing to apps for device ${deviceId}:`, error);
    callback([]);
  });
}

/**
 * Update time limit for a specific app (null = unlimited)
 */
export async function updateAppLimit(deviceId, packageName, limitMinutes) {
  if (!deviceId || !packageName) return;
  const appRef = doc(db, 'devices', deviceId, 'apps', packageName);
  return await updateDoc(appRef, {
    limitMinutes: limitMinutes === null || limitMinutes === undefined || limitMinutes === '' ? null : Number(limitMinutes)
  });
}

/**
 * Subscribe to blocked domains for a given device
 */
export function subscribeBlockedDomains(deviceId, callback) {
  if (!deviceId) return () => {};
  const domainsRef = collection(db, 'devices', deviceId, 'blockedDomains');
  return onSnapshot(domainsRef, (snapshot) => {
    const domains = snapshot.docs.map((d) => ({
      id: d.id,
      ...d.data()
    }));
    // Sort newest blocked first
    domains.sort((a, b) => {
      const tA = a.blockedAt?.toMillis ? a.blockedAt.toMillis() : 0;
      const tB = b.blockedAt?.toMillis ? b.blockedAt.toMillis() : 0;
      return tB - tA;
    });
    callback(domains);
  }, (error) => {
    console.error(`Error subscribing to blocked domains for device ${deviceId}:`, error);
    callback([]);
  });
}

/**
 * Normalize and add a domain to the blocklist
 */
export async function addBlockedDomain(deviceId, rawDomain) {
  if (!deviceId || !rawDomain) return;
  // Clean domain: strip http://, https://, www., paths, query params, whitespace, and convert to lowercase
  let domain = rawDomain.trim().toLowerCase();
  domain = domain.replace(/^https?:\/\//i, '');
  domain = domain.replace(/^www\./i, '');
  domain = domain.split('/')[0];
  domain = domain.split('?')[0];
  domain = domain.split(':')[0];

  if (!domain || !domain.includes('.')) {
    throw new Error('Please enter a valid domain name (e.g., instagram.com)');
  }

  const domainsRef = collection(db, 'devices', deviceId, 'blockedDomains');
  return await addDoc(domainsRef, {
    domain,
    blockedAt: serverTimestamp()
  });
}

/**
 * Delete a blocked domain
 */
export async function deleteBlockedDomain(deviceId, domainId) {
  if (!deviceId || !domainId) return;
  const domainRef = doc(db, 'devices', deviceId, 'blockedDomains', domainId);
  return await deleteDoc(domainRef);
}

/**
 * Update Security PIN for Child Device
 */
export async function updateDeviceSecurityPin(deviceId, securityPin) {
  if (!deviceId || !securityPin) return;
  const deviceRef = doc(db, 'devices', deviceId);
  return await updateDoc(deviceRef, {
    securityPin: String(securityPin).trim(),
    pinUpdatedAt: serverTimestamp()
  });
}

/**
 * Toggle Anti-Tamper & App Deletion Protection
 */
export async function toggleTamperProtection(deviceId, enabled) {
  if (!deviceId) return;
  const deviceRef = doc(db, 'devices', deviceId);
  return await updateDoc(deviceRef, {
    tamperProtectionEnabled: Boolean(enabled),
    tamperSettingUpdatedAt: serverTimestamp()
  });
}

/**
 * Delete / Unpair a device
 */
export async function deleteDevice(deviceId) {
  if (!deviceId) return;
  const deviceRef = doc(db, 'devices', deviceId);
  return await deleteDoc(deviceRef);
}

/**
 * Helper to seed a sample device for demo or testing purposes
 */
export async function seedDemoDevice(adminId) {
  if (!adminId) return;
  const deviceId = `demo_device_${Date.now()}`;
  const deviceRef = doc(db, 'devices', deviceId);
  
  const today = new Date().toISOString().split('T')[0];

  await setDoc(deviceRef, {
    adminId,
    deviceName: "Alex's Samsung Galaxy S23",
    model: "SM-S911B",
    osVersion: "Android 14 (One UI 6.1)",
    batteryLevel: 78,
    connected: true,
    securityPin: generateRandomSecurityPin(),
    tamperProtectionEnabled: true,
    lastSeenAt: serverTimestamp(),
    pairedAt: serverTimestamp()
  });

  // Seed sample apps
  const sampleApps = [
    { packageName: "com.instagram.android", appName: "Instagram", limitMinutes: 45, usedMinutesToday: 38, icon: "https://upload.wikimedia.org/wikipedia/commons/a/a5/Instagram_icon.png" },
    { packageName: "com.zhiliaoapp.musically", appName: "TikTok", limitMinutes: 30, usedMinutesToday: 30, icon: "https://cdn.iconscout.com/icon/free/png-256/free-tiktok-logo-icon-download-in-svg-png-gif-file-formats--social-media-pack-logos-icons-226401.png" },
    { packageName: "com.google.android.youtube", appName: "YouTube", limitMinutes: 60, usedMinutesToday: 22, icon: "https://upload.wikimedia.org/wikipedia/commons/e/ef/Youtube_logo.png" },
    { packageName: "com.roblox.client", appName: "Roblox", limitMinutes: 60, usedMinutesToday: 55, icon: null },
    { packageName: "com.whatsapp", appName: "WhatsApp", limitMinutes: null, usedMinutesToday: 18, icon: "https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg" },
    { packageName: "com.android.chrome", appName: "Chrome Browser", limitMinutes: null, usedMinutesToday: 14, icon: null },
    { packageName: "com.duolingo", appName: "Duolingo", limitMinutes: null, usedMinutesToday: 25, icon: null },
  ];

  for (const app of sampleApps) {
    await setDoc(doc(db, 'devices', deviceId, 'apps', app.packageName), {
      ...app,
      lastResetDate: today,
      installedAt: serverTimestamp()
    });
  }

  // Seed sample blocked domains
  const sampleDomains = ["instagram.com", "tiktok.com", "omegle.com", "bet365.com"];
  for (const d of sampleDomains) {
    await addDoc(collection(db, 'devices', deviceId, 'blockedDomains'), {
      domain: d,
      blockedAt: serverTimestamp()
    });
  }

  return deviceId;
}
