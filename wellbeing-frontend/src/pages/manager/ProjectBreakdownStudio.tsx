import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, CheckCircle2, Circle, Loader2, AlertCircle, RefreshCw, Zap, 
  Check, Play, FileText, BarChart3, Clock, Edit3, Trash2, Link2, 
  ChevronRight, Info, ShieldCheck, ShieldAlert, User
} from 'lucide-react';
import { breakdownProject, aiDistributeTasks } from '@/services/aiService';
import { createBulkTasks } from '@/services/taskService';

type StepStatus = 'idle' | 'running' | 'success' | 'warning' | 'failed';

interface Task {
  id: string;
  module: string;
  name: string;
  description: string;
  effort: number;
  priority: 'low' | 'medium' | 'high';
  assignee?: string;
  assigneeId?: string;
  policyStatus?: string;
  policyWarnings?: string[];
  dependencies?: string[];
}

interface WorkflowState {
  stepStatus: {
    inputAnalysis: StepStatus;
    taskGeneration: StepStatus;
    estimation: StepStatus;
    validation: StepStatus;
    optimization: StepStatus;
  };
  tasks: Task[];
  optimized: boolean;
  approved: boolean;
}

const STEPS = [
  { id: 'inputAnalysis', label: 'Input Analysis', descSuccess: 'Requirements analyzed', descRunning: 'Analyzing project brief...' },
  { id: 'taskGeneration', label: 'Task Generation', descSuccess: 'Decomposed into subtasks', descRunning: 'Decomposing requirements via AI...' },
  { id: 'estimation', label: 'Effort Estimation', descSuccess: 'Effort estimated based on historicals', descRunning: 'Calculating story points...' },
  { id: 'validation', label: 'Validation Engine', descSuccess: 'Policy & capacity verified', descRunning: 'Checking feasibility...' },
  { id: 'optimization', label: 'Optimization Layer', descSuccess: 'Plan ready for execution', descRunning: 'Optimizing resource allocation...' }
];

export default function ProjectBreakdownStudio() {
  const navigate = useNavigate();

  const [isStarted, setIsStarted] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [projectInput, setProjectInput] = useState({ title: '', description: '', effort: '', dueDate: '' });
  
  const [workflowState, setWorkflowState] = useState<WorkflowState>({
    stepStatus: {
      inputAnalysis: 'idle',
      taskGeneration: 'idle',
      estimation: 'idle',
      validation: 'idle',
      optimization: 'idle'
    },
    tasks: [],
    optimized: false,
    approved: false
  });

  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [savingPlan, setSavingPlan] = useState(false);

  // 1. Initial Breakdown Workflow
  const runBreakdown = async () => {
    setIsStarted(true);
    setWorkflowState(prev => ({
      ...prev,
      tasks: [],
      optimized: false,
      approved: false,
      stepStatus: {
        inputAnalysis: 'running',
        taskGeneration: 'idle',
        estimation: 'idle',
        validation: 'idle',
        optimization: 'idle'
      }
    }));

    try {
      // Step 1: Input Analysis
      await new Promise(r => setTimeout(r, 800));
      setWorkflowState(prev => ({ ...prev, stepStatus: { ...prev.stepStatus, inputAnalysis: 'success', taskGeneration: 'running' } }));

      // Step 2: Task Generation
      const effortVal = parseInt(projectInput.effort) || 10;
      const breakdownResult = await breakdownProject({
        title: projectInput.title || 'Untitled Project',
        description: projectInput.description,
        effort: effortVal,
      });

      const generatedTasks = breakdownResult.subtasks.map((t, idx) => ({
        id: `t-${idx}`,
        module: 'Core System',
        name: t.title,
        description: t.description || '',
        effort: t.effort || 2,
        priority: t.priority || 'medium',
        dependencies: [],
        dueDate: projectInput.dueDate || undefined
      }));

      setWorkflowState(prev => ({ 
        ...prev, 
        tasks: generatedTasks, 
        stepStatus: { ...prev.stepStatus, taskGeneration: 'success', estimation: 'running' } 
      }));

      // Step 3: Estimation
      await new Promise(r => setTimeout(r, 800));
      setWorkflowState(prev => ({ ...prev, stepStatus: { ...prev.stepStatus, estimation: 'success' } }));

    } catch (error) {
      console.error('Breakdown Error:', error);
      setWorkflowState(prev => ({ ...prev, stepStatus: { ...prev.stepStatus, taskGeneration: 'failed' } }));
    }
  };

  // 2. Simulation (Auto-Assign) Workflow
  const runAssignmentSimulation = async () => {
    setIsSimulating(true);
    setWorkflowState(prev => ({
      ...prev,
      stepStatus: { ...prev.stepStatus, validation: 'running', optimization: 'idle' }
    }));

    try {
      const mappedTasksForDistribution = workflowState.tasks.map(t => ({
        title: t.name,
        effort: t.effort,
        priority: t.priority
      }));

      const distributionResult = await aiDistributeTasks(mappedTasksForDistribution);

      const assignedTasks = workflowState.tasks.map((t, idx) => {
        const assignment = distributionResult.find(d => d.taskTitle === t.name) || distributionResult[idx];
        return {
          ...t,
          assignee: assignment ? assignment.employeeName : 'Unassigned',
          assigneeId: assignment ? assignment.employeeId : undefined,
          policyStatus: assignment ? assignment.policyStatus : 'pass',
          policyWarnings: assignment ? assignment.policyWarnings : []
        };
      });

      setWorkflowState(prev => ({ 
        ...prev, 
        tasks: assignedTasks,
        optimized: true,
        stepStatus: { ...prev.stepStatus, validation: 'success', optimization: 'success' } 
      }));
    } catch (error) {
      console.error('Simulation Error:', error);
      setWorkflowState(prev => ({ ...prev, stepStatus: { ...prev.stepStatus, validation: 'failed' } }));
    } finally {
      setIsSimulating(false);
    }
  };

  // 3. Approval & Creation
  const handleApprovePlan = async () => {
    setSavingPlan(true);
    try {
      const tasksToCreate = workflowState.tasks.map(t => ({
        title: t.name,
        description: t.description,
        effort: t.effort,
        priority: t.priority,
        dueDate: t.dueDate || projectInput.dueDate,
        assignedTo: t.assigneeId
      }));

      await createBulkTasks(tasksToCreate);
      setWorkflowState(prev => ({ ...prev, approved: true }));
      
      // Navigate to all tasks after brief success state
      setTimeout(() => {
        navigate('/dashboard/manager/tasks');
      }, 1500);

    } catch (error) {
      console.error('Save Plan Error:', error);
      alert('Failed to save plan to database.');
    } finally {
      setSavingPlan(false);
    }
  };

  const handleEditTask = (task: Task) => {
    setEditingTask({ ...task });
  };

  const saveEditedTask = () => {
    if (!editingTask) return;
    setWorkflowState(prev => ({
      ...prev,
      tasks: prev.tasks.map(t => t.id === editingTask.id ? editingTask : t)
    }));
    setEditingTask(null);
  };

  const getStepIcon = (status: StepStatus) => {
    switch (status) {
      case 'success': return <CheckCircle2 className="w-5 h-5 text-emerald-400" />;
      case 'running': return <Loader2 className="w-5 h-5 text-indigo-400 animate-spin" />;
      case 'warning': return <AlertCircle className="w-5 h-5 text-amber-400" />;
      case 'failed': return <AlertCircle className="w-5 h-5 text-red-400" />;
      default: return <Circle className="w-5 h-5 text-gray-600" />;
    }
  };

  const isRunning = Object.values(workflowState.stepStatus).includes('running') || isSimulating;

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-gray-200 flex flex-col font-sans">
      {/* HEADER */}
      <header className="sticky top-0 z-50 bg-[#0A0A0A]/80 backdrop-blur-md border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/dashboard/manager/ai-automation')}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors text-gray-400 hover:text-white"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent flex items-center gap-2">
              <Zap className="w-5 h-5 text-indigo-400" />
              Project Breakdown Studio
            </h1>
            <p className="text-xs text-gray-400 mt-0.5">AI-guided task decomposition with validation and simulation</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {workflowState.approved ? (
            <span className="flex items-center gap-2 text-xs font-medium text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/20">
              <Check className="w-3.5 h-3.5" /> Plan Created & Saved
            </span>
          ) : (
            <span className="flex items-center gap-2 text-xs text-gray-400 bg-gray-800/50 px-3 py-1.5 rounded-full border border-gray-800">
              {savingPlan ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FileText className="w-3.5 h-3.5" />}
              {savingPlan ? 'Syncing...' : 'Live Workspace'}
            </span>
          )}
        </div>
      </header>

      {/* MAIN LAYOUT */}
      <main className="flex-1 flex overflow-hidden max-w-[1600px] w-full mx-auto">
        
        {/* LEFT PANEL - PIPELINE */}
        <section className="w-1/3 border-r border-gray-800 bg-[#0F0F13] p-8 overflow-y-auto">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-8 flex items-center gap-2">
            <BarChart3 className="w-4 h-4" /> Workflow Engine
          </h2>
          <div className="relative">
            <div className="absolute left-6 top-6 bottom-6 w-px bg-gray-800" />
            <div className="space-y-8 relative">
              {STEPS.map((step, idx) => {
                const status = workflowState.stepStatus[step.id as keyof WorkflowState['stepStatus']];
                const isActive = status === 'running' || status === 'success' || status === 'failed';
                
                return (
                  <motion.div 
                    key={step.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className={`flex gap-4 relative z-10 ${!isActive ? 'opacity-40' : ''}`}
                  >
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 border-4 border-[#0F0F13] 
                      ${status === 'running' ? 'bg-indigo-500/20 shadow-[0_0_15px_rgba(99,102,241,0.2)]' : 
                        status === 'success' ? 'bg-emerald-500/10' : 
                        status === 'failed' ? 'bg-red-500/10' : 'bg-gray-900'}`}
                    >
                      {getStepIcon(status)}
                    </div>
                    
                    <div className="pt-2">
                      <h3 className={`font-medium ${status === 'running' ? 'text-indigo-400' : status === 'success' ? 'text-gray-200' : status === 'failed' ? 'text-red-400' : 'text-gray-500'}`}>
                        {step.label}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">
                        {status === 'running' ? step.descRunning : status === 'success' ? step.descSuccess : 'Pending...'}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
          
          <div className="mt-12 p-5 rounded-2xl bg-indigo-500/5 border border-indigo-500/10">
            <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-3">Project Summary</h4>
            <div className="space-y-2">
               <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Tasks</span>
                  <span className="text-gray-200 font-medium">{workflowState.tasks.length}</span>
               </div>
               <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Total Effort</span>
                  <span className="text-gray-200 font-medium">{workflowState.tasks.reduce((sum, t) => sum + t.effort, 0)} hrs</span>
               </div>
            </div>
          </div>
        </section>

        {/* RIGHT PANEL - OUTPUT */}
        <section className="flex-1 bg-[#0A0A0A] relative overflow-y-auto">
          <div className="p-8 pb-32">
            <AnimatePresence mode="wait">
              {!isStarted ? (
                <motion.div key="form" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="max-w-xl mx-auto mt-20">
                  <div className="bg-[#121217] border border-gray-800 rounded-2xl p-8 shadow-2xl">
                     <div className="mb-6 text-center">
                        <div className="w-14 h-14 bg-indigo-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-indigo-500/20">
                          <Zap className="w-7 h-7 text-indigo-400" />
                        </div>
                        <h2 className="text-3xl font-bold text-gray-100">Project Studio</h2>
                        <p className="text-gray-400 mt-2">Generate a full execution plan from a single prompt.</p>
                     </div>
                     <div className="space-y-5">
                        <div>
                          <label className="block text-sm font-medium text-gray-400 mb-2">Project Name</label>
                          <input type="text" value={projectInput.title} onChange={e => setProjectInput({...projectInput, title: e.target.value})} placeholder="e.g. Q2 Customer Migration" className="w-full bg-[#0A0A0A] border border-gray-800 rounded-xl px-4 py-3.5 text-white focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-400 mb-2">Effort Estimate (Total Hours)</label>
                          <input type="number" value={projectInput.effort} onChange={e => setProjectInput({...projectInput, effort: e.target.value})} placeholder="e.g. 40" className="w-full bg-[#0A0A0A] border border-gray-800 rounded-xl px-4 py-3.5 text-white focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-400 mb-2">Project Due Date</label>
                          <input type="date" value={projectInput.dueDate} onChange={e => setProjectInput({...projectInput, dueDate: e.target.value})} className="w-full bg-[#0A0A0A] border border-gray-800 rounded-xl px-4 py-3.5 text-white focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-400 mb-2">Description / Goals</label>
                          <textarea value={projectInput.description} onChange={e => setProjectInput({...projectInput, description: e.target.value})} placeholder="Break down the migration into backend and frontend tasks..." rows={4} className="w-full bg-[#0A0A0A] border border-gray-800 rounded-xl px-4 py-3.5 text-white focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all resize-none" />
                        </div>
                        <button onClick={runBreakdown} disabled={!projectInput.title || !projectInput.effort} className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-4 rounded-xl transition-all shadow-[0_0_30px_rgba(79,70,229,0.3)] disabled:opacity-50 disabled:shadow-none flex items-center justify-center gap-2">
                           <Play className="w-4 h-4 fill-current" /> Initialize Breakdown
                        </button>
                     </div>
                  </div>
                </motion.div>
              ) : workflowState.tasks.length === 0 ? (
                <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center h-full text-gray-500 pt-32">
                  <Loader2 className="w-12 h-12 animate-spin mb-4 text-indigo-500" />
                  <p className="text-lg">AI is architecting your project...</p>
                </motion.div>
              ) : (
                <motion.div key="results" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                  <div className="flex items-center justify-between sticky top-0 z-20 bg-[#0A0A0A]/90 backdrop-blur-md py-4">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-100">{projectInput.title}</h2>
                      <p className="text-sm text-gray-500">{workflowState.tasks.length} tasks identified</p>
                    </div>
                    <div className="flex gap-3">
                       <button 
                          onClick={runAssignmentSimulation} 
                          disabled={isSimulating || workflowState.approved}
                          className="px-4 py-2 bg-amber-500/10 border border-amber-500/20 text-amber-500 rounded-lg hover:bg-amber-500/20 transition-all flex items-center gap-2 text-sm font-medium disabled:opacity-40"
                       >
                         {isSimulating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                         {workflowState.optimized ? 'Resimulate Assignment' : 'Smart Auto-Assign'}
                       </button>
                    </div>
                  </div>

                  <div className="grid gap-4">
                    {workflowState.tasks.map((task, idx) => (
                      <motion.div 
                        key={task.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="group bg-[#121217] border border-gray-800 rounded-2xl p-6 hover:border-gray-700 transition-all relative overflow-hidden"
                      >
                        {/* Policy Badge */}
                        {task.policyStatus && (
                           <div className={`absolute top-0 right-0 px-4 py-1 text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5 rounded-bl-xl ${task.policyStatus === 'pass' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>
                              {task.policyStatus === 'pass' ? <ShieldCheck className="w-3 h-3" /> : <ShieldAlert className="w-3 h-3" />}
                              Policy {task.policyStatus}
                           </div>
                        )}

                        <div className="flex justify-between items-start mb-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-1">
                               <h3 className="text-lg font-bold text-gray-100 group-hover:text-indigo-400 transition-colors">{task.name}</h3>
                               <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${task.priority === 'high' ? 'border-red-500/30 text-red-400 bg-red-500/5' : 'border-gray-700 text-gray-400'}`}>
                                 {task.priority}
                               </span>
                            </div>
                            <p className="text-sm text-gray-400 line-clamp-2 leading-relaxed">{task.description}</p>
                          </div>
                          
                          <div className="flex gap-2">
                             <button onClick={() => handleEditTask(task)} className="p-2 hover:bg-gray-800 rounded-lg text-gray-500 hover:text-white transition-colors">
                               <Edit3 className="w-4 h-4" />
                             </button>
                          </div>
                        </div>

                        <div className="flex items-center gap-6 text-xs text-gray-500 border-t border-gray-800 pt-4 mt-2">
                          <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {task.effort} hrs</span>
                          
                          {task.assignee && (
                            <span className="flex items-center gap-1.5 bg-indigo-500/10 text-indigo-300 px-2 py-1 rounded-md">
                              <User className="w-3.5 h-3.5" /> {task.assignee}
                            </span>
                          )}

                          {task.dependencies && task.dependencies.length > 0 && (
                            <span className="flex items-center gap-1.5 text-amber-500">
                              <Link2 className="w-3.5 h-3.5" /> {task.dependencies.length} Deps
                            </span>
                          )}
                          
                          {task.policyWarnings && task.policyWarnings.length > 0 && (
                            <span className="flex items-center gap-1.5 text-amber-500 font-medium">
                              <Info className="w-3.5 h-3.5" /> {task.policyWarnings[0]}
                            </span>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </section>
      </main>

      {/* FOOTER BAR */}
      <div className="fixed bottom-0 left-0 right-0 border-t border-gray-800 bg-[#0A0A0A]/90 backdrop-blur-xl p-4 z-40">
        <div className="max-w-[1600px] mx-auto flex items-center justify-between px-6">
          <div className="flex items-center gap-6 text-sm text-gray-500">
             <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                Live Sync Active
             </div>
             {workflowState.optimized && (
               <div className="flex items-center gap-2 text-indigo-400">
                  <ShieldCheck className="w-4 h-4" />
                  Policy Validated
               </div>
             )}
          </div>

          <div className="flex gap-4">
            <button 
              disabled={!isStarted || isRunning || workflowState.approved}
              onClick={runBreakdown}
              className="px-5 py-2.5 rounded-xl text-sm font-medium text-gray-400 hover:bg-gray-800 transition-all disabled:opacity-30"
            >
              Regenerate Plan
            </button>
            <button 
              disabled={!isStarted || isRunning || workflowState.approved || workflowState.tasks.length === 0}
              onClick={handleApprovePlan}
              className="px-8 py-2.5 rounded-xl text-sm font-bold bg-white text-black hover:bg-gray-200 transition-all flex items-center gap-2 shadow-[0_0_30px_rgba(255,255,255,0.2)] disabled:opacity-50"
            >
              {savingPlan ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-current" />}
              {workflowState.approved ? 'Plan Approved' : 'Approve & Create Tasks'}
            </button>
          </div>
        </div>
      </div>

      {/* EDIT MODAL */}
      <AnimatePresence>
        {editingTask && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
             <motion.div 
               initial={{ opacity: 0, scale: 0.95 }}
               animate={{ opacity: 1, scale: 1 }}
               exit={{ opacity: 0, scale: 0.95 }}
               className="w-full max-w-lg bg-[#121217] border border-gray-800 rounded-3xl p-8 shadow-2xl"
             >
                <h2 className="text-2xl font-bold text-gray-100 mb-6">Edit AI-Generated Task</h2>
                <div className="space-y-5">
                   <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">Title</label>
                      <input type="text" value={editingTask.name} onChange={e => setEditingTask({...editingTask, name: e.target.value})} className="w-full bg-[#0A0A0A] border border-gray-800 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500/50 outline-none" />
                   </div>
                   <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">Description</label>
                      <textarea value={editingTask.description} onChange={e => setEditingTask({...editingTask, description: e.target.value})} rows={3} className="w-full bg-[#0A0A0A] border border-gray-800 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500/50 outline-none resize-none" />
                   </div>
                   <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">Effort (Hrs)</label>
                        <input type="number" value={editingTask.effort} onChange={e => setEditingTask({...editingTask, effort: parseInt(e.target.value) || 0})} className="w-full bg-[#0A0A0A] border border-gray-800 rounded-xl px-4 py-3 text-white" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">Priority</label>
                        <select value={editingTask.priority} onChange={e => setEditingTask({...editingTask, priority: e.target.value as any})} className="w-full bg-[#0A0A0A] border border-gray-800 rounded-xl px-4 py-3 text-white">
                           <option value="low">Low</option>
                           <option value="medium">Medium</option>
                           <option value="high">High</option>
                        </select>
                      </div>
                   </div>
                   <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">Dependencies (Task Titles/IDs)</label>
                      <input type="text" placeholder="e.g. Design UI, Setup API" onChange={e => setEditingTask({...editingTask, dependencies: e.target.value.split(',').map(s => s.trim())})} className="w-full bg-[#0A0A0A] border border-gray-800 rounded-xl px-4 py-3 text-white" />
                   </div>
                </div>
                <div className="flex gap-4 mt-8">
                   <button onClick={() => setEditingTask(null)} className="flex-1 py-3 text-gray-400 hover:text-white transition-colors">Cancel</button>
                   <button onClick={saveEditedTask} className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-xl transition-all">Save Changes</button>
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>

      <Sparkle />
    </div>
  );
}

function Sparkles({ className }: { className?: string }) {
  return <Zap className={className} />;
}

function Sparkle() {
  return (
    <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-0 overflow-hidden opacity-20">
       <div className="absolute top-[10%] left-[10%] w-[400px] h-[400px] bg-indigo-500/20 rounded-full blur-[120px] animate-pulse" />
       <div className="absolute bottom-[10%] right-[10%] w-[300px] h-[300px] bg-purple-500/20 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '2s' }} />
    </div>
  );
}
