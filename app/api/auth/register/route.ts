import { NextResponse } from 'next/server';
import { getAdminApp } from '@/lib/firebase/admin';
import admin from 'firebase-admin';

export async function POST(request: Request) {
  let createdUid: string | null = null;

  try {
    const body = await request.json();
    const { 
      email, 
      password, 
      role,
      displayName,
      licenseType,
      licenseState,
      licenseNumber,
      orgName,
      orgType,
      selectedSpecs,
      modality,
      availability
    } = body;

    if (!email || !password || !role) {
      return NextResponse.json({ error: 'Missing required registration parameters' }, { status: 400 });
    }

    // Initialize Admin SDK
    const app = getAdminApp();
    if (!app) {
      return NextResponse.json({ error: 'Failed to initialize Firebase Admin app.' }, { status: 500 });
    }
    const auth = app.auth();
    const db = admin.firestore(app);

    // 1. Create User in Firebase Auth
    const userRecord = await auth.createUser({
      email,
      password,
      displayName: role === 'patient' || role === 'solo_provider' ? displayName : orgName,
    });
    createdUid = userRecord.uid;

    // 2. Perform Firestore writes in an atomic batch
    const batch = db.batch();

    // Determine assignedRole logic (same as client-side fallback matching)
    let assignedRole = role;
    const lowerEmail = email.toLowerCase().trim();
    if (lowerEmail.startsWith('admin') || lowerEmail === 'admin@admin.com') {
      assignedRole = 'admin';
    } else if (lowerEmail.startsWith('user') || lowerEmail === 'user@user.com') {
      assignedRole = 'patient';
    } else if (lowerEmail.startsWith('doc') || lowerEmail.startsWith('clinician') || lowerEmail === 'doc@doc.com') {
      assignedRole = 'solo_provider';
    } else if (lowerEmail.startsWith('clinic') || lowerEmail === 'clinic@clinic.com') {
      assignedRole = 'provider_org';
    }

    // Write role-specific profile document
    if (assignedRole === 'patient') {
      const patientRef = db.collection('patients').doc(createdUid);
      batch.set(patientRef, {
        userId: createdUid,
        displayName: displayName.trim(),
        intakeStatus: 'not_started',
        activeCareRouteId: null,
        activeCarePacketId: null,
        activeReferralId: null,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    } else if (assignedRole === 'solo_provider') {
      const soloRef = db.collection('soloProviders').doc(createdUid);
      batch.set(soloRef, {
        userId: createdUid,
        profile: {
          displayName: displayName.trim(),
          providerTitle: licenseType,
          bio: 'Care navigation provider.',
          profilePhoto: null,
          contactEmail: email.toLowerCase().trim(),
          contactPhone: '',
        },
        licensure: {
          licenseType,
          licenseNumberPlaceholder: licenseNumber.trim(),
          licenseState,
          licenseExpirationDate: '',
          licenseDocument: null,
          npiPlaceholder: '',
          telehealthStates: [licenseState],
        },
        careDetails: {
          specialties: selectedSpecs || [],
          modalities: modality === 'Both' ? ['Telehealth', 'In-person'] : [modality],
          acceptedCoverageOptions: [],
          selfPayRate: '',
          slidingScaleAvailable: false,
          languages: ['English'],
          availability,
        },
        references: {
          reference1Name: '',
          reference1Relationship: '',
          reference1Email: '',
          reference1Status: 'not_sent',
          reference2Name: '',
          reference2Relationship: '',
          reference2Email: '',
          reference2Status: 'not_sent',
        },
        verification: {
          verificationStatus: 'draft',
          submittedAt: null,
          adminNotes: '',
          itemStatuses: {},
          itemNotes: {},
        },
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    } else if (assignedRole === 'provider_org') {
      const orgRef = db.collection('providerOrganizations').doc(createdUid);
      batch.set(orgRef, {
        orgId: createdUid,
        ownerUserId: createdUid,
        organizationProfile: {
          organizationName: orgName.trim(),
          organizationType: orgType,
          organizationBio: 'Clinic/facility provider.',
          logo: null,
          primaryContactName: '',
          primaryContactEmail: email.toLowerCase().trim(),
          primaryContactPhone: '',
          website: '',
        },
        credentialInfo: {
          businessLicensePlaceholder: '',
          licenseState: 'California',
          accreditationPlaceholder: '',
          credentialDocument: null,
        },
        serviceDetails: {
          servicesOffered: [],
          specialties: selectedSpecs || [],
          modalities: modality === 'Both' ? ['Telehealth', 'In-person'] : [modality],
          locations: ['California'],
          acceptedCoverageOptions: [],
          slidingScaleAvailable: false,
          availability,
          clinicianCount: 1,
        },
        references: {
          reference1Name: '',
          reference1Relationship: '',
          reference1Email: '',
          reference1Status: 'not_sent',
          reference2Name: '',
          reference2Relationship: '',
          reference2Email: '',
          reference2Status: 'not_sent',
        },
        verification: {
          verificationStatus: 'draft',
          submittedAt: null,
          adminNotes: '',
          itemStatuses: {},
          itemNotes: {},
        },
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    }

    // Write primary users document with onboardingComplete: true
    const userRef = db.collection('users').doc(createdUid);
    batch.set(userRef, {
      uid: createdUid,
      email: email.toLowerCase().trim(),
      displayName: role === 'patient' || role === 'solo_provider' ? displayName.trim() : orgName.trim(),
      role: assignedRole,
      onboardingComplete: true,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    await batch.commit();

    return NextResponse.json({ success: true, uid: createdUid });
  } catch (error: any) {
    console.error('Server-side registration error:', error);

    // Rollback Auth creation if it was created but Firestore writes failed
    if (createdUid) {
      console.log(`Rolling back Auth creation for UID: ${createdUid}`);
      try {
        const app = getAdminApp();
        if (app) {
          const auth = app.auth();
          await auth.deleteUser(createdUid);
        }
      } catch (deleteError) {
        console.error('Failed to rollback Auth user creation:', deleteError);
      }
    }

    // Format error message for credentials or missing env keys
    if (error.message && error.message.includes('credential')) {
      return NextResponse.json({ 
        error: 'Firebase Admin credentials missing. Please check env setup.' 
      }, { status: 500 });
    }

    return NextResponse.json({ error: error.message || 'Failed to complete registration' }, { status: 500 });
  }
}
