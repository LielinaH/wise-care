import { SupportPlanTask, SupportPlanResource } from '../firebase/types';

export interface SupportPlanTemplate {
  id: string;
  title: string;
  description: string;
  defaultTasks: Omit<SupportPlanTask, 'completed'>[];
  defaultResources: Omit<SupportPlanResource, 'id'>[];
}

export const SUPPORT_PLAN_TEMPLATES: SupportPlanTemplate[] = [
  {
    id: 'first_session_prep',
    title: 'First Appointment Preparation Checklist',
    description: 'Practical and mental preparation tasks to help you get the most out of your first clinical intake session.',
    defaultTasks: [
      {
        id: 'prep_1',
        title: 'Confirm appointment logistics',
        description: 'Double check the date, time, link (for telehealth), or location address (for in-person).',
        category: 'preparation',
      },
      {
        id: 'prep_2',
        title: 'Identify 1-2 primary goals',
        description: 'Write down what you most want to address during the first few weeks of support.',
        category: 'reflection',
      },
      {
        id: 'prep_3',
        title: 'Review insurance details or payment setup',
        description: 'Have your card handy or write down any sliding scale questions.',
        category: 'preparation',
      }
    ],
    defaultResources: [
      {
        title: 'First Session Expectations Guide',
        type: 'reading',
        description: 'A brief guide on what happens during a standard 45-minute clinical intake session.',
        content: 'During your first session, the provider will review your history, clarify safety parameters, and explore goals. It is a collaborative dialogue, not an interrogation.',
        demoOnly: true
      }
    ]
  },
  {
    id: 'sleep_log_week',
    title: 'Sleep Log (One Week)',
    description: 'Track your sleeping patterns for the next 7 days to share with your provider.',
    defaultTasks: [
      {
        id: 'sleep_1',
        title: 'Establish a screen-free wind-down routine',
        description: 'Put away phones/screens 30 minutes before bedtime.',
        category: 'sleep',
      },
      {
        id: 'sleep_2',
        title: 'Log daily sleep/wake times and quality',
        description: 'Complete a daily entry in your log including hours slept and quality (1-5).',
        category: 'sleep',
      },
      {
        id: 'sleep_3',
        title: 'Note any middle-of-the-night awakenings',
        description: 'Write down if you wake up, and how long it takes to fall back asleep.',
        category: 'sleep',
      }
    ],
    defaultResources: [
      {
        title: 'Sleep Tracker Template',
        type: 'sleep_log',
        description: 'A structured 7-day diary to write down rest duration and wake triggers.',
        content: 'Day 1: Wake time, Sleep time, Awakenings (y/n), Rest quality (1-5), Daytime fatigue (1-5). Repeat for Days 2-7.',
        demoOnly: true
      }
    ]
  },
  {
    id: 'grounding_practice',
    title: 'Grounding Exercise Practice',
    description: 'Simple mindfulness and physical exercises to build grounding tools before your session.',
    defaultTasks: [
      {
        id: 'ground_1',
        title: 'Practice the 5-4-3-2-1 sensory technique',
        description: 'Acknowledge 5 things you can see, 4 you can touch, 3 hear, 2 smell, and 1 taste.',
        category: 'grounding',
      },
      {
        id: 'ground_2',
        title: 'Try box breathing (4s inhale, 4s hold, 4s exhale, 4s hold)',
        description: 'Practice for 3 minutes during a stressful moment or before sleep.',
        category: 'grounding',
      }
    ],
    defaultResources: [
      {
        title: 'Box Breathing Guide',
        type: 'grounding_exercise',
        description: 'Visual breathing exercise to regulate the nervous system.',
        content: 'Inhale through the nose for 4 seconds. Hold breath for 4 seconds. Exhale slowly for 4 seconds. Hold empty for 4 seconds. Repeat 4 times.',
        demoOnly: true
      }
    ]
  },
  {
    id: 'mood_reflection',
    title: 'Mood/Energy Reflection',
    description: 'Prompts to observe and log daily emotional baselines.',
    defaultTasks: [
      {
        id: 'mood_1',
        title: 'Notice energy shifts during the day',
        description: 'Log if you feel major dips or surges in mood in the mornings vs afternoons.',
        category: 'reflection',
      },
      {
        id: 'mood_2',
        title: 'Observe stress triggers',
        description: 'Note what events or thoughts precede changes in stress levels.',
        category: 'reflection',
      }
    ],
    defaultResources: [
      {
        title: 'Daily Mood Log Guide',
        type: 'worksheet',
        description: 'Simple tracker to capture emotional triggers without clinical jargon.',
        content: 'Identify: Stress Level (1-10), Dominant Emotion, Physical symptoms (tightness, fatigue), Environmental context.',
        demoOnly: true
      }
    ]
  },
  {
    id: 'session_questions',
    title: 'Questions to Bring to First Session',
    description: 'A list of questions to ask your provider to confirm they are the right fit.',
    defaultTasks: [
      {
        id: 'ques_1',
        title: 'Ask about therapeutic style',
        description: 'Formulate a question about their approach (e.g. CBT, ACT, relational).',
        category: 'preparation',
      },
      {
        id: 'ques_2',
        title: 'Clarify communication boundaries',
        description: 'Understand how between-session contacts or scheduling edits are managed.',
        category: 'preparation',
      }
    ],
    defaultResources: [
      {
        title: 'Clinician Fit Checklist',
        type: 'checklist',
        description: 'List of checklist criteria to help patients evaluate compatibility.',
        content: 'Style alignment, Communication preferences, Experience with similar concerns, Practice boundaries.',
        demoOnly: true
      }
    ]
  },
  {
    id: 'insurance_follow_up',
    title: 'Insurance/Payment Follow-Up Checklist',
    description: 'Ensure payment structure and coverage options are verified prior to session.',
    defaultTasks: [
      {
        id: 'ins_1',
        title: 'Verify out-of-network benefits (if applicable)',
        description: 'Call member services to check if they offer reimbursement for superbills.',
        category: 'follow_up',
      },
      {
        id: 'ins_2',
        title: 'Confirm intake copay amount',
        description: 'Find out if you have a deductible to meet before copays apply.',
        category: 'follow_up',
      }
    ],
    defaultResources: [
      {
        title: 'Insurance Cheat Sheet',
        type: 'checklist',
        description: 'Standard phone checklist for talking to health insurance support.',
        content: 'Questions to ask: 1. Do you cover outpatient psychotherapy (CPT 90837)? 2. What is my deductible? 3. What is my copay?',
        demoOnly: true
      }
    ]
  },
  {
    id: 'community_resources',
    title: 'Community Support Resource List',
    description: 'Self-guided community resources to supplement your care journey.',
    defaultTasks: [
      {
        id: 'comm_1',
        title: 'Locate local support circles',
        description: 'Identify free, community-led support groups in your county.',
        category: 'outreach',
      },
      {
        id: 'comm_2',
        title: 'Register for peer-led webinars',
        description: 'Explore introductory mental health webinars or advocacy guides.',
        category: 'outreach',
      }
    ],
    defaultResources: [
      {
        title: 'Local Support Networks',
        type: 'external_link',
        description: 'Public listing directories for community support groups.',
        content: 'Search: NAMI Family Support Groups, Mental Health America Peer Resources, local community health clinics.',
        demoOnly: true
      }
    ]
  }
];
