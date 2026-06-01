'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import AppShell from '@/components/layout/AppShell';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { useAuth } from '@/components/auth/AuthProvider';
import { firestoreHelpers } from '@/lib/firebase/firestore';
import Badge from '@/components/ui/Badge';
import { 
  Check, 
  ClipboardList, 
  Info, 
  AlertTriangle, 
  ArrowLeft, 
  Loader2, 
  Save, 
  ExternalLink,
  BookOpen,
  CheckSquare,
  Sparkles
} from 'lucide-react';

function PatientSupportPlanContent() {
  const { currentUser, isFirebaseMode } = useAuth();
  const [plan, setPlan] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingNoteId, setSavingNoteId] = useState<string | null>(null);
  const [localNotes, setLocalNotes] = useState<Record<string, string>>({});

  useEffect(() => {
    async function loadPlan() {
      if (!currentUser) return;
      if (isFirebaseMode) {
        try {
          const activePlan = await firestoreHelpers.getSupportPlanForPatient(currentUser.uid);
          setPlan(activePlan);
          if (activePlan) {
            // Initialize local notes state
            const notesMap: Record<string, string> = {};
            activePlan.tasks?.forEach((t: any) => {
              notesMap[t.id] = t.patientNote || '';
            });
            setLocalNotes(notesMap);
          }
        } catch (e) {
          console.error("Error loading patient support plan:", e);
        }
      }
      setLoading(false);
    }
    loadPlan();
  }, [currentUser, isFirebaseMode]);

  const handleToggleTask = async (taskId: string, currentCompleted: boolean) => {
    if (!plan || !isFirebaseMode) return;

    const nextCompleted = !currentCompleted;
    const note = localNotes[taskId] || '';

    // Optimistically update UI
    const updatedTasks = plan.tasks.map((t: any) => {
      if (t.id === taskId) {
        return { 
          ...t, 
          completed: nextCompleted,
          completedAt: nextCompleted ? new Date().toISOString() : undefined
        };
      }
      return t;
    });

    const completedCount = updatedTasks.filter((t: any) => t.completed).length;
    const totalCount = updatedTasks.length;
    const percent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

    setPlan({
      ...plan,
      tasks: updatedTasks,
      patientProgressSummary: `${completedCount} of ${totalCount} tasks completed (${percent}%)`
    });

    try {
      await firestoreHelpers.updateTaskCompletion(plan.planId, taskId, nextCompleted, note);
    } catch (err) {
      console.error("Error updating task completion status:", err);
      alert("Failed to save progress. Please check internet connection.");
    }
  };

  const handleNoteChange = (taskId: string, val: string) => {
    setLocalNotes({
      ...localNotes,
      [taskId]: val
    });
  };

  const handleSaveNote = async (taskId: string) => {
    if (!plan || !isFirebaseMode) return;
    setSavingNoteId(taskId);
    try {
      const task = plan.tasks.find((t: any) => t.id === taskId);
      const note = localNotes[taskId] || '';
      
      // Update in Firestore
      await firestoreHelpers.updateTaskCompletion(plan.planId, taskId, !!task?.completed, note);
      
      // Update plan state locally
      const updatedTasks = plan.tasks.map((t: any) => {
        if (t.id === taskId) {
          return { ...t, patientNote: note };
        }
        return t;
      });
      setPlan({ ...plan, tasks: updatedTasks });
    } catch (err) {
      console.error("Error saving note:", err);
      alert("Failed to save note. Please try again.");
    } finally {
      setSavingNoteId(null);
    }
  };

  if (loading) {
    return (
      <AppShell title="Support Plan Tracker" crumbs={['Care', 'Support Plan']}>
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 className="w-8 h-8 text-wise-teal animate-spin" />
          <p className="text-sm text-wise-muted font-medium">Syncing support plan tracker...</p>
        </div>
      </AppShell>
    );
  }

  if (!isFirebaseMode) {
    return (
      <AppShell title="Support Plan Tracker" crumbs={['Care', 'Support Plan']}>
        <div className="max-w-2xl mx-auto py-12 stack" style={{ '--gap': '16px' } as React.CSSProperties}>
          <div className="p-5 bg-amber-50 border border-amber-200 rounded-2xl flex gap-3 text-sm text-amber-800">
            <AlertTriangle className="w-5 h-5 shrink-0 text-amber-600 mt-0.5" />
            <div>
              <strong className="block font-bold mb-1">Local Fallback Mode</strong>
              Support plan tracking requires Firebase connection. Please sign in or switch to active database mode.
            </div>
          </div>
          <Link href="/dashboard" className="btn btn-ghost btn-sm inline-flex items-center gap-1.5 self-start">
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </Link>
        </div>
      </AppShell>
    );
  }

  if (!plan) {
    return (
      <AppShell title="Support Plan Tracker" crumbs={['Care', 'Support Plan']}>
        <div className="max-w-2xl mx-auto py-16 text-center stack enter" style={{ '--gap': '20px' } as React.CSSProperties}>
          <div className="w-16 h-16 bg-wise-surface-2 rounded-full flex items-center justify-center mx-auto text-wise-muted border border-wise-border">
            <ClipboardList className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-wise-fg">No Support Plan Assigned Yet</h3>
            <p className="text-sm text-wise-muted mt-2 max-w-md mx-auto leading-relaxed">
              When a provider accepts your referral connection request, they can create a custom pre-session support checklist to guide your preparation. Check back once scheduling is in progress!
            </p>
          </div>
          <div className="pt-2">
            <Link href="/dashboard" className="btn btn-primary btn-sm inline-flex items-center gap-1.5">
              <ArrowLeft className="w-3.5 h-3.5" /> Return to Dashboard
            </Link>
          </div>
        </div>
      </AppShell>
    );
  }

  const completedCount = plan.tasks?.filter((t: any) => t.completed).length || 0;
  const totalCount = plan.tasks?.length || 0;
  const percent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const categoryBadge = (category: string) => {
    switch (category) {
      case 'preparation': return <Badge variant="teal" showDot={false}>Prep</Badge>;
      case 'reflection': return <Badge variant="blue" showDot={false}>Reflection</Badge>;
      case 'sleep': return <Badge variant="standard" className="bg-indigo-50 text-indigo-700 border border-indigo-200/50" showDot={false}>Sleep</Badge>;
      case 'grounding': return <Badge variant="standard" className="bg-purple-50 text-purple-700 border border-purple-200/50" showDot={false}>Grounding</Badge>;
      case 'outreach': return <Badge variant="success" showDot={false}>Outreach</Badge>;
      case 'follow_up': return <Badge variant="warn" showDot={false}>Follow Up</Badge>;
      case 'reading': return <Badge variant="teal" showDot={false}>Reading</Badge>;
      default: return <Badge variant="standard" showDot={false}>Task</Badge>;
    }
  };

  return (
    <AppShell 
      title="Provider-Guided Support Plan" 
      crumbs={['Care', 'Support Plan']}
      actions={
        <Link href="/dashboard" className="btn btn-ghost btn-sm inline-flex items-center gap-1">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
        </Link>
      }
    >
      <div className="enter-stagger stack" style={{ '--gap': '20px' } as React.CSSProperties}>
        
        {/* Safety Disclaimer Notice */}
        <div className="p-4 bg-orange-50/50 border border-orange-200/50 rounded-2xl text-xs leading-relaxed text-orange-950 flex gap-3 items-start">
          <Info className="w-4 h-4 text-orange-700 shrink-0 mt-0.5" />
          <div>
            <strong>Important Safety Notice:</strong> This pre-session preparation checklist is designed for self-reflection and general preparation helper guidelines. This is not a clinical treatment plan, medical diagnosis, or therapy prescription. Wise Care does not provide therapy or treatment.
          </div>
        </div>

        {/* Plan Header Summary Card */}
        <div className="card p-6" style={{ background: 'var(--surface)', border: '1px solid var(--hairline)', borderRadius: 'var(--r-xl)' }}>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <span className="kicker">Shared by {plan.providerName}</span>
              <h2 className="text-xl font-bold text-wise-fg mt-1">{plan.title}</h2>
              {plan.providerNotes && (
                <p className="text-xs text-wise-muted mt-2 max-w-3xl italic bg-wise-surface-2 p-3 rounded-lg border border-wise-border leading-relaxed">
                  "{plan.providerNotes}"
                </p>
              )}
            </div>
            <div className="shrink-0 stack items-end" style={{ '--gap': '6px' } as React.CSSProperties}>
              <span className="text-xs font-mono font-semibold text-wise-muted">Overall Checklist Progress</span>
              <div className="flex items-center gap-3">
                <div style={{ width: '140px', background: 'var(--surface-sunk)', height: '8px', borderRadius: '4px', overflow: 'hidden' }}>
                  <div 
                    className="bg-wise-teal h-full rounded-full transition-all duration-500" 
                    style={{ width: `${percent}%`, background: 'var(--teal-deep)' }}
                  />
                </div>
                <span className="text-sm font-bold font-mono text-wise-fg">{percent}%</span>
              </div>
              <span className="text-[11px] text-wise-muted">{completedCount} of {totalCount} completed</span>
            </div>
          </div>
        </div>

        {/* Main Grid */}
        <div className="dash-grid">
          {/* Left Column: Tasks List */}
          <div className="stack" style={{ '--gap': '16px' } as React.CSSProperties}>
            <div className="flex items-center gap-2 mb-1">
              <CheckSquare className="w-5 h-5 text-wise-teal" />
              <h3 className="text-sm font-semibold uppercase tracking-wider text-wise-fg">Tasks &amp; Check-ins</h3>
            </div>

            <div className="stack" style={{ '--gap': '12px' } as React.CSSProperties}>
              {plan.tasks?.map((task: any, idx: number) => {
                const isCompleted = !!task.completed;
                return (
                  <div 
                    key={task.id} 
                    className={`card p-5 border transition-all duration-300 rounded-xl ${
                      isCompleted 
                        ? 'border-wise-teal/30 bg-wise-teal/5' 
                        : 'border-wise-border bg-wise-surface hover:border-wise-muted/45'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      {/* Interactive checkbox */}
                      <button
                        type="button"
                        onClick={() => handleToggleTask(task.id, isCompleted)}
                        className={`w-5.5 h-5.5 rounded-md border flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                          isCompleted 
                            ? 'bg-wise-teal border-wise-teal text-white' 
                            : 'border-wise-border bg-wise-surface hover:border-wise-teal'
                        }`}
                        style={{ width: '22px', height: '22px' }}
                      >
                        {isCompleted && <Check className="w-3.5 h-3.5 stroke-[3px]" />}
                      </button>

                      <div className="flex-1 space-y-3">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[11px] font-mono text-wise-muted font-bold">Task {idx + 1}</span>
                            {categoryBadge(task.category)}
                          </div>
                          <h4 className={`text-sm font-bold mt-1 text-wise-fg ${isCompleted ? 'line-through text-wise-muted' : ''}`}>
                            {task.title}
                          </h4>
                          <p className="text-xs text-wise-muted mt-1 leading-relaxed">
                            {task.description}
                          </p>
                        </div>

                        {/* Reflections Area */}
                        <div className="pt-2 border-t border-wise-hairline">
                          <label className="text-[10px] font-mono uppercase tracking-wider text-wise-muted block mb-1">
                            Self-Reflection Notes (Shared with provider)
                          </label>
                          <div className="flex gap-2">
                            <textarea
                              value={localNotes[task.id] || ''}
                              onChange={(e) => handleNoteChange(task.id, e.target.value)}
                              onBlur={() => handleSaveNote(task.id)}
                              className="textarea flex-1 p-2 text-xs border border-wise-border rounded-lg bg-wise-surface-2 focus:outline-none focus:ring-1 focus:ring-wise-teal"
                              placeholder="Write notes about your experience with this prep task..."
                              rows={2}
                              style={{ resize: 'none', height: '48px', fontSize: '12px' }}
                            />
                            <button
                              type="button"
                              onClick={() => handleSaveNote(task.id)}
                              disabled={savingNoteId === task.id || localNotes[task.id] === task.patientNote}
                              className="btn btn-soft btn-sm shrink-0 self-end p-2"
                              title="Save reflection note"
                              style={{ height: '48px', width: '48px', justifyContent: 'center' }}
                            >
                              {savingNoteId === task.id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Save className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                          {task.patientNote && localNotes[task.id] === task.patientNote && (
                            <span className="text-[10px] text-emerald-600 block mt-1 font-mono">✓ Reflection saved to plan</span>
                          )}
                        </div>

                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Resources & Info */}
          <div className="stack" style={{ '--gap': '25px' } as React.CSSProperties}>
            
            {/* Resources list card */}
            <div className="card p-5" style={{ background: 'var(--surface)', border: '1px solid var(--hairline)', borderRadius: 'var(--r-xl)' }}>
              <div className="flex items-center gap-2 mb-4">
                <BookOpen className="w-4.5 h-4.5 text-wise-teal" />
                <h3 className="text-xs font-semibold uppercase tracking-wider text-wise-fg">Shared Resources</h3>
              </div>

              {plan.resources && plan.resources.length > 0 ? (
                <div className="space-y-4">
                  {plan.resources.map((res: any) => (
                    <div key={res.id} className="p-3.5 bg-wise-surface-2 rounded-xl border border-wise-border stack" style={{ '--gap': '8px' } as React.CSSProperties}>
                      <div>
                        <span className="text-[10px] font-mono text-wise-muted uppercase font-bold">{res.type.replace('_', ' ')}</span>
                        <h4 className="text-xs font-bold text-wise-fg mt-0.5">{res.title}</h4>
                        <p className="text-[11.5px] text-wise-muted mt-1 leading-relaxed">{res.description}</p>
                      </div>
                      
                      {res.content && (
                        <div className="text-[11px] font-mono p-2 bg-wise-surface border border-wise-border rounded-lg text-wise-muted max-h-24 overflow-y-auto whitespace-pre-wrap leading-relaxed">
                          {res.content}
                        </div>
                      )}

                      {res.url && (
                        <a 
                          href={res.url} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="text-[11.5px] text-wise-teal font-semibold inline-flex items-center gap-1 hover:underline self-start"
                        >
                          Open external link <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-wise-muted italic text-center py-4">No additional readings attached.</p>
              )}
            </div>

            {/* Quick guide card */}
            <div className="card p-5 bg-wise-teal/5 border border-wise-teal/20" style={{ borderRadius: 'var(--r-xl)' }}>
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-wise-teal-deep" />
                <h4 className="text-xs font-bold text-wise-teal-deep uppercase font-mono">How to use this tracker</h4>
              </div>
              <ul className="text-[11.5px] text-wise-fg-soft space-y-2 list-disc list-inside leading-relaxed">
                <li>Check off tasks as you complete them to show your clinician your progress.</li>
                <li>Write down notes, thoughts, or observations in the reflections area — these notes help guide your first appointment discussion.</li>
                <li>Read the shared handouts and worksheets beforehand to prepare.</li>
              </ul>
            </div>

          </div>
        </div>

      </div>
    </AppShell>
  );
}

export default function PatientSupportPlan() {
  return (
    <ProtectedRoute allowedRoles={['patient']}>
      <PatientSupportPlanContent />
    </ProtectedRoute>
  );
}
