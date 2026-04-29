#!/usr/bin/env node
/**
 * Seed script — maak een eerste admin en voorbeeldroute aan in Firestore.
 *
 * Gebruik:
 *   node scripts/seed.js
 *
 * Vereiste omgevingsvariabelen in .env (of exporteer ze zelf):
 *   VITE_FIREBASE_API_KEY, VITE_FIREBASE_AUTH_DOMAIN, VITE_FIREBASE_PROJECT_ID,
 *   VITE_FIREBASE_STORAGE_BUCKET, VITE_FIREBASE_MESSAGING_SENDER_ID, VITE_FIREBASE_APP_ID
 */

import { createInterface } from 'readline';
import { initializeApp } from 'firebase/app';
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  setDoc,
  addDoc,
  collection,
  serverTimestamp
} from 'firebase/firestore';

// Laad .env bestand als dat bestaat
try {
  const { config } = await import('dotenv');
  config();
} catch {
  // dotenv niet geïnstalleerd — gebruik process.env rechtstreeks
}

function vraag(rl, tekst) {
  return new Promise(resolve => rl.question(tekst, resolve));
}

async function main() {
  const rl = createInterface({ input: process.stdin, output: process.stdout });

  console.log('\n🗺️  Tour Guide — Seed script\n');

  const email = await vraag(rl, 'Admin e-mailadres: ');
  const wachtwoord = await vraag(rl, 'Admin wachtwoord (min. 6 tekens): ');
  rl.close();

  if (!email || !wachtwoord || wachtwoord.length < 6) {
    console.error('❌ Ongeldig e-mailadres of wachtwoord (min. 6 tekens).');
    process.exit(1);
  }

  // Firebase initialiseren
  const firebaseConfig = {
    apiKey: process.env.VITE_FIREBASE_API_KEY,
    authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.VITE_FIREBASE_APP_ID
  };

  const missingKeys = Object.entries(firebaseConfig)
    .filter(([, v]) => !v)
    .map(([k]) => k);

  if (missingKeys.length > 0) {
    console.error('❌ Ontbrekende omgevingsvariabelen:', missingKeys.join(', '));
    console.error('   Kopieer .env.example naar .env en vul alle waarden in.');
    process.exit(1);
  }

  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const db = getFirestore(app);

  // Stap 1 — Admin account aanmaken (of inloggen als al bestaat)
  let uid;
  try {
    const cred = await createUserWithEmailAndPassword(auth, email, wachtwoord);
    uid = cred.user.uid;
    console.log(`\n✅ Admin account aangemaakt: ${email}`);
  } catch (err) {
    if (err.code === 'auth/email-already-in-use') {
      const cred = await signInWithEmailAndPassword(auth, email, wachtwoord);
      uid = cred.user.uid;
      console.log(`\nℹ️  Account bestaat al, ingelogd als: ${email}`);
    } else {
      console.error('❌ Fout bij aanmaken account:', err.message);
      process.exit(1);
    }
  }

  // Stap 2 — Admin document in Firestore
  await setDoc(doc(db, 'admins', uid), { email, rol: 'admin' });
  console.log('✅ Admin document aangemaakt in Firestore');

  // Stap 3 — Voorbeeldroute aanmaken (Brussel)
  const routeRef = await addDoc(collection(db, 'routes'), {
    naam: 'Historisch Brussel — Grote Markt & Manneken Pis',
    beschrijving:
      'Een korte wandeling langs de mooiste plekken in het historische centrum van Brussel. Perfect voor een zaterdagmiddag.',
    afbeeldingUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7c/Grand_Place_Brussels.jpg/1280px-Grand_Place_Brussels.jpg',
    gepubliceerd: false,
    totaalAfstand: 900,
    duur: 45,
    aangemaakt: serverTimestamp(),
    bijgewerkt: serverTimestamp()
  });
  await setDoc(doc(db, 'routes', routeRef.id), { id: routeRef.id }, { merge: true });
  console.log(`✅ Voorbeeldroute aangemaakt (ID: ${routeRef.id})`);

  // Stap 4 — Waypoints aanmaken
  const waypoints = [
    {
      volgorde: 1,
      naam: 'Grote Markt',
      beschrijving:
        'De Grote Markt van Brussel is een van de mooiste pleinen ter wereld, omgeven door gildehuizen en het stadhuis.',
      lat: 50.846607,
      lng: 4.352183,
      instructies: [
        {
          tekst: 'Welkom op de Grote Markt van Brussel! Bewonder de prachtige gildehuizen rondom u.',
          afstand: 30,
          richting: 'aankomst'
        },
        {
          tekst: 'Verlaat het plein via de Rue de l\'Étuve richting het zuiden om het Manneken Pis te bereiken.',
          afstand: 20,
          richting: 'rechtdoor'
        }
      ]
    },
    {
      volgorde: 2,
      naam: 'Manneken Pis',
      beschrijving:
        'Het beroemde bronzen standbeeldje dat symbool staat voor de vrijgevochten geest van Brussel.',
      lat: 50.844967,
      lng: 4.349981,
      instructies: [
        {
          tekst: 'U nadert het Manneken Pis! Dit kleine bronzen beeldje uit 1619 is een van de bekendste symbolen van Brussel.',
          afstand: 40,
          richting: 'aankomst'
        },
        {
          tekst: 'Sla links af op de Rue du Chêne richting de Zavel.',
          afstand: 15,
          richting: 'links'
        }
      ]
    },
    {
      volgorde: 3,
      naam: 'Zavel',
      beschrijving:
        'De Zavelkerk en het pittoreske Zavelplein, omgeven door antiekwinkeltjes en terrassen.',
      lat: 50.842945,
      lng: 4.35293,
      instructies: [
        {
          tekst: 'U bent bijna aan de Zavel! Geniet van de sfeer van dit elegante plein met de gotische Notre-Dame du Sablon.',
          afstand: 50,
          richting: 'aankomst'
        },
        {
          tekst: 'Einde van de wandeling. Proficiat! U heeft het historische centrum van Brussel verkend.',
          afstand: 20,
          richting: 'aankomst'
        }
      ]
    }
  ];

  for (const wp of waypoints) {
    const wpRef = await addDoc(collection(db, 'routes', routeRef.id, 'waypoints'), wp);
    await setDoc(
      doc(db, 'routes', routeRef.id, 'waypoints', wpRef.id),
      { id: wpRef.id },
      { merge: true }
    );
  }
  console.log('✅ 3 waypoints aangemaakt met instructies');

  console.log('\n🎉 Seed voltooid!');
  console.log(`   Ga naar /admin/login en log in met ${email}`);
  console.log(`   Publiceer de route via /admin/routes om ze zichtbaar te maken.`);
  process.exit(0);
}

main().catch(err => {
  console.error('❌ Onverwachte fout:', err);
  process.exit(1);
});
