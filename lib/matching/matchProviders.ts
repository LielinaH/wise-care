import { Provider, IntakeAnswers } from '../types';

export function matchProviders(intake: IntakeAnswers, providers: Provider[]): Provider[] {
  return providers
    .map(p => {
      let score = 50; // Base score
      const details: string[] = [];

      // 1. State check
      // Licensing check: provider.licensure usually mentions CA, OR, CO, NY
      if (intake.stateName) {
        const stateCode = getStateCode(intake.stateName);
        const pLic = p.licensure.toLowerCase();
        const matchesState = pLic.includes(stateCode.toLowerCase()) || pLic.includes('telehealth in 27 states') || pLic.includes('public clinic') || pLic.includes('volunteer');
        
        if (matchesState) {
          score += 15;
          details.push(`Licensed in ${intake.stateName}`);
        } else {
          score -= 40; // Heavy penalty if state doesn't match
        }
      }

      // 2. Modality check
      if (intake.modality) {
        const pMod = p.modality.map(m => m.toLowerCase());
        const userMod = intake.modality.toLowerCase();

        if (userMod === 'either is fine' || pMod.includes(userMod) || pMod.includes('either is fine')) {
          score += 15;
          details.push(`Matches modality preference (${p.modality.join(' & ')})`);
        } else {
          score -= 10;
        }
      }

      // 3. Insurance & Cost check
      if (intake.insurance) {
        const userIns = intake.insurance.toLowerCase();
        const pIns = p.insurance.map(i => i.toLowerCase());

        // Check exact match or sliding scale preference
        const isSelfPaySliding = userIns.includes('self-pay') || userIns.includes('sliding scale');
        const acceptsSliding = p.slidingScale;

        if (pIns.includes(userIns)) {
          score += 25;
          details.push(`Accepts your insurance: ${intake.insurance}`);
        } else if (isSelfPaySliding && acceptsSliding) {
          score += 20;
          details.push(`Accepts sliding scale payments`);
        } else if (p.sessionCost.toLowerCase().includes('free') && (userIns.includes('uninsured') || userIns.includes('unsure'))) {
          score += 20;
          details.push(`Free peer/community resource`);
        } else {
          score -= 15;
        }
      }

      // 4. Concerns & Specialties match
      if (intake.concerns && intake.concerns.length > 0) {
        const matchingSpecialties = p.specialty.filter(spec => 
          intake.concerns.some(c => c.toLowerCase() === spec.toLowerCase())
        );

        if (matchingSpecialties.length > 0) {
          score += 20 + (matchingSpecialties.length * 5); // Base match + bonus for multiple
          details.push(`Specializes in your focus areas: ${matchingSpecialties.join(', ')}`);
        }
      }

      // 5. Preferred support type
      if (intake.preference) {
        const pType = p.type.toLowerCase();
        const pref = intake.preference.toLowerCase();
        
        let match = false;
        if (pref === 'therapy' && pType.includes('therapist')) match = true;
        else if (pref === 'therapy' && pType.includes('group practice')) match = true;
        else if (pref === 'medication' && pType.includes('medication')) match = true;
        else if (pref === 'group' && pType.includes('group')) match = true;
        else if (pref === 'community' && pType.includes('community')) match = true;

        if (match) {
          score += 15;
          details.push(`Matches preferred care type: ${p.type}`);
        }
      }

      // Constrain score between 0 and 100
      const finalScore = Math.min(100, Math.max(0, score));

      return {
        ...p,
        matchScore: finalScore,
        matchReason: details.length > 0 ? details.join('. ') + '.' : p.matchReason,
      };
    })
    .sort((a, b) => b.matchScore - a.matchScore);
}

function getStateCode(state: string): string {
  const states: Record<string, string> = {
    'California': 'CA',
    'Colorado': 'CO',
    'Florida': 'FL',
    'Illinois': 'IL',
    'Massachusetts': 'MA',
    'New York': 'NY',
    'Oregon': 'OR',
    'Texas': 'TX',
    'Washington': 'WA',
  };
  return states[state] || state;
}
