'use client';

import React, { useEffect, useState } from 'react';
import { Sparkles, Loader2, Plus, Trash2, Check, Lock, AlertCircle, Save, Send, ArrowLeft } from 'lucide-react';
import { firestoreHelpers } from '@/lib/firebase/firestore';
import { SupportPlanDoc, SupportPlanTask, SupportPlanResource } from '@/lib/firebase/types';
import { SUPPORT_PLAN_TEMPLATES } from '@/lib/data/supportPlanTemplates';
import Badge from '../ui/Badge';

interface SupportPlanEditorProps {
  referralId: string;
  patientId: string;
  patientName: string;
  providerId: string;
  providerName: string;
  providerType: 'solo_provider' | 'provider_org';
  carePacketId: string;
  onClose: () => void;
  onPlanUpdated?: () => void;
}

export default function SupportPlanEditor({
  referralId,
  patientId,
  patientName,
  providerId,
  providerName,
  providerType,
  carePacketId,
  onClose,
  onPlanUpdated
}: SupportPlanEditorProps) {
  const [planId, setPlanId] = useState<string | null>(null);
  const [title, setTitle] = useState('Provider-Guided Support Plan');
  const [status, setStatus] = useState<'draft' | 'shared' | 'archived'>('draft');
  const [providerNotes, setProviderNotes] = useState('');
  const [tasks, setTasks] = useState<SupportPlanTask[]>([]);
  const [resources, setResources] = useState<SupportPlanResource[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState(SUPPORT_PLAN_TEMPLATES[0].id);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [drafting, setDrafting] = useState(false);
  const [carePacket, setCarePacket] = useState<any | null>(null);

  // Load existing plan & care packet
  useEffect(() => {
    async function init() {
      setLoading(true);
      try {
        if (carePacketId) {
          const packet = await firestoreHelpers.getCarePacket(carePacketId);
          setCarePacket(packet);
        }

        const existingPlan = await firestoreHelpers.getSupportPlanForReferral(referralId);
        if (existingPlan) {
          setPlanId(existingPlan.planId || null);
          setTitle(existingPlan.title || 'Provider-Guided Support Plan');
          setStatus(existingPlan.status || 'draft');
          setProviderNotes(existingPlan.providerNotes || '');
          setTasks(existingPlan.tasks || []);
          setResources(existingPlan.resources || []);
        } else {
          // Initialize with default tasks from first template
          const t = SUPPORT_PLAN_TEMPLATES[0];
          setTasks(t.defaultTasks.map(task => ({ ...task, completed: false })));
          setResources(t.defaultResources.map((res, idx) => ({ ...res, id: `res_${idx}`, demoOnly: true })));
        }
      } catch (err) {
        console.error("Error loading support plan data:", err);
      } finally {
        setLoading(false);
      }
    }
    init();
  }, [referralId, carePacketId]);

  // Load Static Template presets
  const handleApplyTemplate = () => {
    const template = SUPPORT_PLAN_TEMPLATES.find(t => t.id === selectedTemplate);
    if (!template) return;

    setTitle(template.title);
    setTasks(template.defaultTasks.map(t => ({ ...t, completed: false })));
    setResources(template.defaultResources.map((r, idx) => ({ ...r, id: `res_${idx}`, demoOnly: true })));
  };

  // AI drafting with Gemini
  const handleAIDraft = async () => {
    if (!carePacket) {
      alert("No patient care packet available to draft with.");
      return;
    }
    setDrafting(true);
    try {
      const res = await fetch('/api/ai/support-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          carePacket: {
            mainConcerns: carePacket.mainConcerns,
            timeline: carePacket.timeline,
            dailyLifeImpact: carePacket.dailyLifeImpact,
            careGoals: carePacket.careGoals
          },
          templateId: selectedTemplate,
          providerName
        })
      });

      if (res.ok) {
        const data = await res.json();
        setTasks(data.tasks || []);
        setResources(data.resources || []);
        const template = SUPPORT_PLAN_TEMPLATES.find(t => t.id === selectedTemplate);
        if (template) {
          setTitle(`Guided Plan: ${template.title}`);
        }
      } else {
        throw new Error("AI failed to return plan");
      }
    } catch (err) {
      console.error("AI drafting error:", err);
      alert("Failed to draft with AI. Applying static template defaults instead.");
      handleApplyTemplate();
    } finally {
      setDrafting(false);
    }
  };

  // Add custom task
  const handleAddTask = () => {
    const newTask: SupportPlanTask = {
      id: `task_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      title: 'New check-in task',
      description: 'Describe preparation or reflection instructions for this task.',
      category: 'custom',
      completed: false
    };
    setTasks([...tasks, newTask]);
  };

  // Update task details
  const handleUpdateTaskField = (taskId: string, field: keyof SupportPlanTask, value: any) => {
    setTasks(tasks.map(t => t.id === taskId ? { ...t, [field]: value } : t));
  };

  // Delete task
  const handleRemoveTask = (taskId: string) => {
    setTasks(tasks.filter(t => t.id !== taskId));
  };

  // Add custom resource
  const handleAddResource = () => {
    const newRes: SupportPlanResource = {
      id: `res_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      title: 'Additional reading resource',
      type: 'custom',
      description: 'Summary of community resource or pre-reading guide.',
      content: 'Mock content placeholder.',
      demoOnly: true
    };
    setResources([...resources, newRes]);
  };

  // Update resource details
  const handleUpdateResourceField = (resId: string, field: keyof SupportPlanResource, value: any) => {
    setResources(resources.map(r => r.id === resId ? { ...r, [field]: value } : r));
  };

  // Delete resource
  const handleRemoveResource = (resId: string) => {
    setResources(resources.filter(r => r.id !== resId));
  };

  // Save changes to Firestore
  const handleSavePlan = async (nextStatus: 'draft' | 'shared') => {
    setSaving(true);
    try {
      const completedCount = tasks.filter(t => t.completed).length;
      const totalCount = tasks.length;
      const percent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

      const planData: Partial<SupportPlanDoc> = {
        patientId,
        providerId,
        providerType,
        providerName,
        referralId,
        carePacketId,
        title,
        status: nextStatus,
        createdBy: providerId,
        providerNotes,
        patientProgressSummary: `${completedCount} of ${totalCount} tasks completed (${percent}%)`,
        tasks,
        resources
      };

      const savedId = await firestoreHelpers.createOrUpdateSupportPlan(planId, planData);
      setPlanId(savedId);
      setStatus(nextStatus);

      if (onPlanUpdated) {
        onPlanUpdated();
      }

      alert(nextStatus === 'shared' ? 'Support Plan successfully shared with patient!' : 'Draft saved.');
      if (nextStatus === 'shared') {
        onClose();
      }
    } catch (err) {
      console.error("Save support plan error:", err);
      alert("Failed to save support plan. Check Firebase logs.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center bg-[var(--surface-2)] border border-[var(--border)] rounded-2xl flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 text-[var(--teal-deep)] animate-spin" />
        <span className="text-xs text-[var(--muted)]">Syncing support plan records...</span>
      </div>
    );
  }

  return (
    <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl overflow-hidden shadow-lg p-6 stack enter" style={{ '--gap': '18px' } as React.CSSProperties}>
      
      {/* Header */}
      <div className="flex justify-between items-center pb-4 border-b border-[var(--hairline)] flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="kicker">guided planning</span>
            <Badge variant={status === 'shared' ? 'teal' : 'warn'} className="text-[10px] uppercase font-mono">
              {status}
            </Badge>
          </div>
          <h3 className="h3 mt-1 text-[var(--fg)]">Manage Support Plan Builder</h3>
          <p className="text-xs text-[var(--muted)]">
            Create preparation-guided next steps and resources for <strong>{patientName}</strong> prior to intake.
          </p>
        </div>
        <button
          onClick={onClose}
          type="button"
          className="btn btn-ghost btn-sm text-xs font-semibold flex items-center gap-1"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Referral
        </button>
      </div>

      {/* Safety Notice */}
      <div className="p-3.5 bg-[var(--surface-3)] border border-[var(--hairline)] rounded-xl text-[12.5px] leading-relaxed text-[var(--fg-soft)] flex gap-2.5 items-start">
        <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <span>
          <strong>Product Disclaimer:</strong> This is a pre-session preparation checklist to assist patient navigation. Do not use diagnostic, medical, or medication terms. Use descriptive check-in tasks only.
        </span>
      </div>

      {/* Template Toggles */}
      <div className="p-4 bg-[var(--surface-2)] rounded-2xl flex flex-col gap-3">
        <label className="text-xs font-semibold text-[var(--fg)] uppercase tracking-wider block">
          Select Template Option
        </label>
        <div className="flex gap-3 flex-wrap items-center">
          <select
            value={selectedTemplate}
            onChange={(e) => setSelectedTemplate(e.target.value)}
            className="select flex-1 max-w-[360px] text-xs py-2 px-3 border border-[var(--border)] rounded-xl focus:outline-none focus:ring-1 focus:ring-[var(--teal-deep)]"
          >
            {SUPPORT_PLAN_TEMPLATES.map(t => (
              <option key={t.id} value={t.id}>{t.title}</option>
            ))}
          </select>

          <button
            type="button"
            onClick={handleApplyTemplate}
            className="btn btn-soft btn-sm text-xs font-semibold py-2 px-4 justify-center"
          >
            Apply Template Defaults
          </button>

          <button
            type="button"
            onClick={handleAIDraft}
            disabled={drafting}
            className="btn btn-soft btn-sm text-xs font-semibold py-2 px-4 border border-[var(--teal-deep)]/20 justify-center flex items-center gap-1"
          >
            {drafting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Drafting...
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5 text-[var(--teal-deep)]" />
                ✨ Draft with AI
              </>
            )}
          </button>
        </div>
        <span className="text-[11.5px] text-[var(--muted)]">
          {SUPPORT_PLAN_TEMPLATES.find(t => t.id === selectedTemplate)?.description}
        </span>
      </div>

      {/* Plan Title */}
      <div className="field">
        <label className="field-label">Plan Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="select mt-1"
          placeholder="e.g. Guided Support Plan - Sleep Preparation"
        />
      </div>

      {/* Tasks List Editor */}
      <div className="stack" style={{ '--gap': '12px' } as React.CSSProperties}>
        <div className="flex justify-between items-center">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--fg)]">
            Tasks Checklist ({tasks.length})
          </h4>
          <button
            type="button"
            onClick={handleAddTask}
            className="btn btn-ghost btn-sm text-xs font-semibold flex items-center gap-1"
          >
            <Plus className="w-4.5 h-4.5" /> Add Task
          </button>
        </div>

        <div className="space-y-3">
          {tasks.map((task, idx) => (
            <div key={task.id} className="p-4 border border-[var(--hairline)] rounded-xl bg-[var(--surface-2)]/40 relative group">
              <button
                type="button"
                onClick={() => handleRemoveTask(task.id)}
                className="absolute top-3 right-3 text-[var(--muted)] hover:text-red-600 p-1 rounded-full hover:bg-rose-50 transition-colors"
                title="Remove task"
              >
                <Trash2 className="w-4 h-4" />
              </button>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-3 pr-8">
                {/* Title */}
                <div className="md:col-span-8">
                  <span className="text-[10px] font-mono text-[var(--muted)] uppercase block mb-1">Task {idx + 1}</span>
                  <input
                    type="text"
                    value={task.title}
                    onChange={(e) => handleUpdateTaskField(task.id, 'title', e.target.value)}
                    className="w-full text-xs font-semibold bg-transparent border-b border-transparent hover:border-[var(--border)] focus:border-[var(--teal-deep)] pb-1 focus:outline-none text-[var(--fg)]"
                    placeholder="Task title..."
                  />
                </div>

                {/* Category select */}
                <div className="md:col-span-4">
                  <span className="text-[10px] font-mono text-[var(--muted)] uppercase block mb-1">Category</span>
                  <select
                    value={task.category}
                    onChange={(e) => handleUpdateTaskField(task.id, 'category', e.target.value)}
                    className="select text-[11px] py-1 px-2.5 h-8 border border-[var(--border)] rounded-lg w-full bg-[var(--surface)] text-[var(--fg)]"
                  >
                    <option value="preparation">Preparation</option>
                    <option value="reflection">Reflection</option>
                    <option value="sleep">Sleep</option>
                    <option value="grounding">Grounding</option>
                    <option value="outreach">Outreach</option>
                    <option value="follow_up">Follow Up</option>
                    <option value="reading">Reading</option>
                    <option value="custom">Custom</option>
                  </select>
                </div>

                {/* Description */}
                <div className="md:col-span-12 mt-1">
                  <textarea
                    value={task.description}
                    onChange={(e) => handleUpdateTaskField(task.id, 'description', e.target.value)}
                    className="w-full text-[12.5px] bg-transparent border border-transparent hover:border-[var(--border)] focus:border-[var(--teal-deep)] p-1.5 focus:outline-none rounded-lg text-[var(--fg-soft)] placeholder:text-[var(--muted)]"
                    placeholder="Provide description of this task..."
                    rows={2}
                    style={{ resize: 'none' }}
                  />
                </div>
              </div>
            </div>
          ))}

          {tasks.length === 0 && (
            <div className="p-6 text-center text-xs text-[var(--muted)] italic border border-dashed border-[var(--border)] rounded-xl">
              No tasks added. Click "Add Task" or apply a template.
            </div>
          )}
        </div>
      </div>

      {/* Resources List Editor */}
      <div className="stack" style={{ '--gap': '12px' } as React.CSSProperties}>
        <div className="flex justify-between items-center">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--fg)]">
            Shared Resources &amp; Pre-Readings ({resources.length})
          </h4>
          <button
            type="button"
            onClick={handleAddResource}
            className="btn btn-ghost btn-sm text-xs font-semibold flex items-center gap-1"
          >
            <Plus className="w-4.5 h-4.5" /> Add Resource
          </button>
        </div>

        <div className="space-y-3">
          {resources.map((res, idx) => (
            <div key={res.id} className="p-4 border border-[var(--hairline)] rounded-xl bg-[var(--surface-2)]/40 relative">
              <button
                type="button"
                onClick={() => handleRemoveResource(res.id)}
                className="absolute top-3 right-3 text-[var(--muted)] hover:text-red-600 p-1 rounded-full hover:bg-rose-50 transition-colors"
                title="Remove resource"
              >
                <Trash2 className="w-4 h-4" />
              </button>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-3 pr-8">
                {/* Title */}
                <div className="md:col-span-8">
                  <span className="text-[10px] font-mono text-[var(--muted)] uppercase block mb-1">Resource {idx + 1}</span>
                  <input
                    type="text"
                    value={res.title}
                    onChange={(e) => handleUpdateResourceField(res.id, 'title', e.target.value)}
                    className="w-full text-xs font-semibold bg-transparent border-b border-transparent hover:border-[var(--border)] focus:border-[var(--teal-deep)] pb-1 focus:outline-none text-[var(--fg)]"
                    placeholder="Resource title..."
                  />
                </div>

                {/* Type select */}
                <div className="md:col-span-4">
                  <span className="text-[10px] font-mono text-[var(--muted)] uppercase block mb-1">Type</span>
                  <select
                    value={res.type}
                    onChange={(e) => handleUpdateResourceField(res.id, 'type', e.target.value)}
                    className="select text-[11px] py-1 px-2.5 h-8 border border-[var(--border)] rounded-lg w-full bg-[var(--surface)] text-[var(--fg)]"
                  >
                    <option value="worksheet">Worksheet</option>
                    <option value="reading">Reading</option>
                    <option value="checklist">Checklist</option>
                    <option value="sleep_log">Sleep Log</option>
                    <option value="grounding_exercise">Grounding Exercise</option>
                    <option value="external_link">External Link</option>
                    <option value="custom">Custom</option>
                  </select>
                </div>

                {/* Description */}
                <div className="md:col-span-12 mt-1">
                  <input
                    type="text"
                    value={res.description}
                    onChange={(e) => handleUpdateResourceField(res.id, 'description', e.target.value)}
                    className="w-full text-[12.5px] bg-transparent border border-transparent hover:border-[var(--border)] focus:border-[var(--teal-deep)] p-1 focus:outline-none rounded-lg text-[var(--fg-soft)] placeholder:text-[var(--muted)]"
                    placeholder="Summary description..."
                  />
                </div>

                {/* Content */}
                <div className="md:col-span-12">
                  <textarea
                    value={res.content || ''}
                    onChange={(e) => handleUpdateResourceField(res.id, 'content', e.target.value)}
                    className="w-full text-[12px] bg-[var(--surface)] border border-[var(--border)] p-2 focus:outline-none rounded-lg text-[var(--fg-soft)] placeholder:text-[var(--muted)] font-mono leading-relaxed"
                    placeholder="Pre-read text content or guide details..."
                    rows={3}
                    style={{ resize: 'none' }}
                  />
                </div>
              </div>
            </div>
          ))}

          {resources.length === 0 && (
            <div className="p-6 text-center text-xs text-[var(--muted)] italic border border-dashed border-[var(--border)] rounded-xl">
              No supplementary resources added.
            </div>
          )}
        </div>
      </div>

      {/* Provider Notes */}
      <div className="field">
        <label className="field-label">Provider Notes (Visible to Patient)</label>
        <textarea
          value={providerNotes}
          onChange={(e) => setProviderNotes(e.target.value)}
          className="textarea mt-1"
          placeholder="Include a warm, personalized greeting or general notes on how they should approach this support plan..."
          rows={3}
          style={{ fontSize: '13px' }}
        />
      </div>

      {/* Editor Actions */}
      <div className="flex gap-3 pt-4 border-t border-[var(--hairline)] justify-end">
        <button
          type="button"
          onClick={onClose}
          className="btn btn-ghost text-xs font-semibold py-2.5 px-4 justify-center"
        >
          Cancel
        </button>

        <button
          type="button"
          onClick={() => handleSavePlan('draft')}
          disabled={saving || tasks.length === 0}
          className="btn btn-soft text-xs font-semibold py-2.5 px-4 flex items-center gap-1.5 justify-center"
        >
          {saving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              <Save className="w-4 h-4 text-[var(--fg)]" />
              Save Draft
            </>
          )}
        </button>

        <button
          type="button"
          onClick={() => handleSavePlan('shared')}
          disabled={saving || tasks.length === 0}
          className="btn btn-primary text-xs font-semibold py-2.5 px-5 flex items-center gap-1.5 justify-center"
        >
          {saving ? (
            <Loader2 className="w-4 h-4 animate-spin text-white" />
          ) : (
            <>
              <Send className="w-4 h-4 text-white" />
              Share with Patient
            </>
          )}
        </button>
      </div>

    </div>
  );
}
