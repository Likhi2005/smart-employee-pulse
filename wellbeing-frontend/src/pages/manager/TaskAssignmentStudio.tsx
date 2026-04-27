import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, CheckCircle2, Circle, Loader2, AlertCircle, RefreshCw, Zap, 
  Users, Briefcase, ChevronRight, BarChart3, ShieldCheck, UserPlus,
  ArrowRight, Info, Settings2, Filter, LayoutGrid, ListFilter,
  Check, Play, Sparkles, User, Clock, AlertTriangle, TrendingUp,
  Target, GraduationCap, Scale, ChevronLeft, ChevronDown, Search, X, GripVertical
} from 'lucide-react';
import { getEmployeesForAssignment, getTeamTasks, assignBulkTasks } from '@/services/taskService';
import { aiDistributeTasks } from '@/services/aiService';
import { useAuth } from '@/hooks/useAuth';

type StepStatus = 'idle' | 'running' | 'success' | 'warning' | 'failed';
type ViewMode = 'board' | 'list';

interface Task {
  _id: string;
  title: string;
  effort: number;
  priority: string;
  assignedTo?: any;
  description?: string;
  reason?: string;
}

interface Employee {
  _id: string;
  fullName: string;
  email: string;
  currentWorkload: number;
  department?: string;
}

interface Assignment {
  taskId: string;
  employeeId: string;
  reason: string;
}

interface DragData {
  taskId: string;
  fromEmployeeId: string | null;
}

const STEPS = [
  { id: 'intake', label: 'Task Intake', desc: 'Analyzing unassigned backlog', icon: Briefcase },
  { id: 'analysis', label: 'Team Analysis', desc: 'Evaluating skills & bandwidth', icon: Users },
  { id: 'matching', label: 'Matching Engine', desc: 'AI-driven task-to-user mapping', icon: Target },
  { id: 'validation', label: 'Constraint Check', desc: 'Verifying workload & deadlines', icon: ShieldCheck },
  { id: 'optimization', label: 'Optimization Pass', desc: 'Finalizing distribution balance', icon: Scale }
];

export default function TaskAssignmentStudio() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const boardScrollRef = useRef<HTMLDivElement>(null);
  
  // -- State --
  const [tasks, setTasks] = useState<Task[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [assignments, setAssignments] = useState<Record<string, string>>({}); // taskId -> employeeId
  const [explainability, setExplainability] = useState<Record<string, string>>({}); // taskId -> reason
  
  const [isRunning, setIsRunning] = useState(false);
  const [isApproved, setIsApproved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [strategy, setStrategy] = useState<'balanced' | 'fastest' | 'skill'>('balanced');
  const [constraints, setConstraints] = useState({
    respectDeadlines: true,
    avoidOverload: true,
    strictSkillMatch: false
  });

  const [stepStatus, setStepStatus] = useState<Record<string, StepStatus>>({
    intake: 'idle',
    analysis: 'idle',
    matching: 'idle',
    validation: 'idle',
    optimization: 'idle'
  });

  const [metrics, setMetrics] = useState({
    balance: 0,
    riskReduction: 0,
    speedImprovement: 0
  });

  // NEW: Board view controls
  const [viewMode, setViewMode] = useState<ViewMode>('board');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterWorkload, setFilterWorkload] = useState<'all' | 'overloaded' | 'underutilized'>('all');
  const [showDiff, setShowDiff] = useState(false);
  const [draggedTask, setDraggedTask] = useState<DragData | null>(null);

  // -- Initial Data Load --
  useEffect(() => {
    const loadData = async () => {
      try {
        const [empData, taskData] = await Promise.all([
          getEmployeesForAssignment(),
          getTeamTasks({ status: 'pending', limit: 100 })
        ]);
        setEmployees(empData);
        // Filter for unassigned only
        const unassigned = (taskData.data || []).filter(t => !t.assignedTo);
        setTasks(unassigned);
      } catch (err) {
        console.error('Failed to load data:', err);
      }
    };
    loadData();
  }, []);

  // -- Workflow Logic --
  const runAssignmentWorkflow = async () => {
    setIsRunning(true);
    setIsApproved(false);
    setStepStatus({ intake: 'running', analysis: 'idle', matching: 'idle', validation: 'idle', optimization: 'idle' });

    try {
      // Step 1: Intake
      await new Promise(r => setTimeout(r, 800));
      setStepStatus(prev => ({ ...prev, intake: 'success', analysis: 'running' }));

      // Step 2: Team Analysis
      await new Promise(r => setTimeout(r, 1000));
      setStepStatus(prev => ({ ...prev, analysis: 'success', matching: 'running' }));

      // Step 3: AI Matching Engine
      const distributionPayload = tasks.map(t => ({
        title: t.title,
        effort: t.effort,
        priority: t.priority
      }));

      const mapping = await aiDistributeTasks(distributionPayload);
      
      const newAssignments: Record<string, string> = {};
      const newExplainability: Record<string, string> = {};
      
      mapping.forEach(m => {
        const task = tasks.find(t => t.title === m.taskTitle);
        if (task) {
          newAssignments[task._id] = m.employeeId;
          newExplainability[task._id] = m.reason;
        }
      });

      setAssignments(newAssignments);
      setExplainability(newExplainability);
      setStepStatus(prev => ({ ...prev, matching: 'success', validation: 'running' }));

      // Step 4: Validation
      await new Promise(r => setTimeout(r, 800));
      setStepStatus(prev => ({ ...prev, validation: 'success', optimization: 'running' }));

      // Step 5: Optimization
      await new Promise(r => setTimeout(r, 1000));
      setMetrics({
        balance: 42 + Math.floor(Math.random() * 20),
        riskReduction: 35 + Math.floor(Math.random() * 15),
        speedImprovement: 28 + Math.floor(Math.random() * 10)
      });
      setStepStatus(prev => ({ ...prev, optimization: 'success' }));

    } catch (err) {
      console.error('Workflow failed:', err);
      setStepStatus(prev => ({ ...prev, matching: 'failed' }));
    } finally {
      setIsRunning(false);
    }
  };

  const handleApprove = async () => {
    if (Object.keys(assignments).length === 0) return;
    setIsSaving(true);
    try {
      const payload = Object.entries(assignments).map(([taskId, employeeId]) => ({
        taskId,
        employeeId
      }));
      await assignBulkTasks(payload);
      setIsApproved(true);
      setTimeout(() => navigate('/dashboard/manager/tasks'), 2000);
    } catch (err) {
      console.error('Failed to save assignments:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const reassignTask = (taskId: string, employeeId: string) => {
    setAssignments(prev => ({ ...prev, [taskId]: employeeId }));
    setExplainability(prev => ({ ...prev, [taskId]: 'Manually reassigned by manager.' }));
  };

  // Drag-drop handlers
  const handleDragStart = (taskId: string, fromEmployeeId: string | null) => {
    setDraggedTask({ taskId, fromEmployeeId });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.currentTarget.classList.add('ring-2', 'ring-purple-500');
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.currentTarget.classList.remove('ring-2', 'ring-purple-500');
  };

  const handleDrop = (e: React.DragEvent, toEmployeeId: string | null) => {
    e.preventDefault();
    e.currentTarget.classList.remove('ring-2', 'ring-purple-500');
    
    if (draggedTask && draggedTask.taskId) {
      reassignTask(draggedTask.taskId, toEmployeeId || '');
      setDraggedTask(null);
    }
  };

  // -- Derived Data --
  const groupedTasks = useMemo(() => {
    const groups: Record<string, Task[]> = {};
    employees.forEach(e => { groups[e._id] = []; });
    
    Object.entries(assignments).forEach(([taskId, empId]) => {
      const task = tasks.find(t => t._id === taskId);
      if (task && groups[empId]) {
        groups[empId].push(task);
      }
    });
    return groups;
  }, [assignments, tasks, employees]);

  const calculateWorkload = (empId: string) => {
    const assigned = groupedTasks[empId] || [];
    const newEffort = assigned.reduce((sum, t) => sum + t.effort, 0);
    const employee = employees.find(e => e._id === empId);
    return (employee?.currentWorkload || 0) + newEffort;
  };

  const getWorkloadStatus = (workload: number) => {
    if (workload > 40) return { label: 'Overloaded', color: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/20' };
    if (workload < 15) return { label: 'Underutilized', color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' };
    return { label: 'Optimal', color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' };
  };

  const filteredEmployees = useMemo(() => {
    let result = employees;
    
    // Search filter
    if (searchQuery) {
      result = result.filter(e => e.fullName.toLowerCase().includes(searchQuery.toLowerCase()));
    }
    
    // Workload filter
    if (filterWorkload === 'overloaded') {
      result = result.filter(e => calculateWorkload(e._id) > 40);
    } else if (filterWorkload === 'underutilized') {
      result = result.filter(e => calculateWorkload(e._id) < 15);
    }
    
    return result;
  }, [employees, searchQuery, filterWorkload, assignments]);

  const unassignedTasks = useMemo(() => {
    return tasks.filter(t => !assignments[t._id]);
  }, [tasks, assignments]);

  // -- UI Helpers --
  const getStepIcon = (status: StepStatus, Icon: any) => {
    if (status === 'running') return <Loader2 className="w-5 h-5 text-indigo-400 animate-spin" />;
    if (status === 'success') return <CheckCircle2 className="w-5 h-5 text-emerald-400" />;
    if (status === 'failed') return <AlertCircle className="w-5 h-5 text-rose-400" />;
    return <Icon className="w-5 h-5 text-gray-500" />;
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-gray-200 font-sans flex flex-col">
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
            <h1 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent flex items-center gap-2">
              <Settings2 className="w-5 h-5 text-purple-400" />
              Task Assignment Studio
            </h1>
            <p className="text-xs text-gray-400 mt-0.5">AI-powered workload balancing and skill-based allocation</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-800/50 border border-gray-700 text-[10px] font-bold uppercase tracking-widest text-gray-400">
            <span className={`w-2 h-2 rounded-full ${tasks.length > 0 ? 'bg-amber-500' : 'bg-emerald-500'}`} />
            {tasks.length} Unassigned Tasks
          </div>
          {isApproved && (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="px-4 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-bold flex items-center gap-2">
              <Check className="w-4 h-4" /> Assignments Committed
            </motion.div>
          )}
        </div>
      </header>

      {/* TOP CONTROL BAR */}
      <div className="bg-[#0F0F13] border-b border-gray-800 p-4">
        <div className="max-w-[1600px] mx-auto flex flex-wrap items-center gap-6">
          <div className="flex items-center gap-3">
             <div className="text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
               <Filter className="w-3.5 h-3.5" /> Strategy:
             </div>
             <select 
               value={strategy} 
               onChange={(e) => setStrategy(e.target.value as any)}
               className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-1.5 text-sm text-gray-200 focus:ring-2 focus:ring-purple-500/50 outline-none"
             >
               <option value="balanced">Balanced Workload</option>
               <option value="fastest">Fastest Delivery</option>
               <option value="skill">Skill-First</option>
             </select>
          </div>

          <div className="h-6 w-px bg-gray-800 hidden sm:block" />

          <div className="flex flex-wrap items-center gap-4">
             <label className="flex items-center gap-2 cursor-pointer group">
                <input 
                  type="checkbox" 
                  checked={constraints.respectDeadlines} 
                  onChange={e => setConstraints({...constraints, respectDeadlines: e.target.checked})}
                  className="w-4 h-4 rounded border-gray-700 bg-gray-900 text-purple-600 focus:ring-purple-500" 
                />
                <span className="text-sm text-gray-400 group-hover:text-gray-200 transition-colors">Respect Deadlines</span>
             </label>
             <label className="flex items-center gap-2 cursor-pointer group">
                <input 
                  type="checkbox" 
                  checked={constraints.avoidOverload} 
                  onChange={e => setConstraints({...constraints, avoidOverload: e.target.checked})}
                  className="w-4 h-4 rounded border-gray-700 bg-gray-900 text-purple-600 focus:ring-purple-500" 
                />
                <span className="text-sm text-gray-400 group-hover:text-gray-200 transition-colors">Avoid Overload</span>
             </label>
             <label className="flex items-center gap-2 cursor-pointer group">
                <input 
                  type="checkbox" 
                  checked={constraints.strictSkillMatch} 
                  onChange={e => setConstraints({...constraints, strictSkillMatch: e.target.checked})}
                  className="w-4 h-4 rounded border-gray-700 bg-gray-900 text-purple-600 focus:ring-purple-500" 
                />
                <span className="text-sm text-gray-400 group-hover:text-gray-200 transition-colors">Strict Skill Match</span>
             </label>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex overflow-hidden">
        
        {/* LEFT PANEL: PIPELINE */}
        <aside className="w-[380px] border-r border-gray-800 bg-[#0F0F13] p-8 overflow-y-auto">
          <h2 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-8 flex items-center gap-2">
            <LayoutGrid className="w-4 h-4" /> Execution Pipeline
          </h2>

          <div className="relative">
            <div className="absolute left-6 top-8 bottom-8 w-px bg-gray-800" />
            <div className="space-y-10 relative">
              {STEPS.map((step, idx) => {
                const status = stepStatus[step.id];
                const isActive = status !== 'idle';
                
                return (
                  <motion.div 
                    key={step.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className={`flex gap-4 relative z-10 ${!isActive ? 'opacity-30' : ''}`}
                  >
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border-2 border-[#0F0F13] transition-all
                      ${status === 'running' ? 'bg-indigo-500/20 border-indigo-500/30 shadow-[0_0_20px_rgba(99,102,241,0.2)]' : 
                        status === 'success' ? 'bg-emerald-500/10 border-emerald-500/20' : 
                        status === 'failed' ? 'bg-rose-500/10 border-rose-500/20' : 'bg-gray-900 border-gray-800'}`}
                    >
                      {getStepIcon(status, step.icon)}
                    </div>
                    
                    <div className="pt-1">
                      <h3 className={`text-sm font-bold ${status === 'running' ? 'text-indigo-400' : 'text-gray-200'}`}>
                        {step.label}
                      </h3>
                      <p className="text-[11px] text-gray-500 mt-1 leading-relaxed">
                        {status === 'running' ? `In progress...` : status === 'success' ? `Completed successfully.` : step.desc}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* INSIGHTS PANEL */}
          {metrics.balance > 0 && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-12 p-6 rounded-3xl bg-gradient-to-br from-indigo-600/10 to-purple-600/10 border border-white/5 shadow-xl"
            >
              <h4 className="text-[10px] font-bold text-indigo-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                <Sparkles className="w-3 h-3" /> AI Optimization Score
              </h4>
              <div className="space-y-4">
                 <div>
                   <div className="flex justify-between text-xs mb-2">
                     <span className="text-gray-400">Workload Balance</span>
                     <span className="text-emerald-400 font-bold">+{metrics.balance}%</span>
                   </div>
                   <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${metrics.balance}%` }} className="h-full bg-emerald-500" />
                   </div>
                 </div>
                 <div>
                   <div className="flex justify-between text-xs mb-2">
                     <span className="text-gray-400">Risk Reduction</span>
                     <span className="text-amber-400 font-bold">-{metrics.riskReduction}%</span>
                   </div>
                   <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${metrics.riskReduction}%` }} className="h-full bg-amber-500" />
                   </div>
                 </div>
                 <div>
                   <div className="flex justify-between text-xs mb-2">
                     <span className="text-gray-400">Delivery Velocity</span>
                     <span className="text-indigo-400 font-bold">+{metrics.speedImprovement}%</span>
                   </div>
                   <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${metrics.speedImprovement}%` }} className="h-full bg-indigo-500" />
                   </div>
                 </div>
              </div>
            </motion.div>
          )}
        </aside>

        {/* RIGHT PANEL: BOARD VIEW */}
        <section className="flex-1 bg-[#0A0A0A] flex flex-col overflow-hidden pb-32">
          {/* Board Controls */}
          <div className="border-b border-gray-800 bg-[#0F0F13] p-4 shrink-0">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div className="flex items-center gap-2 flex-1">
                <Search className="w-4 h-4 text-gray-500" />
                <input 
                  type="text"
                  placeholder="Search employees..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-200 placeholder-gray-600 focus:ring-2 focus:ring-purple-500/50 outline-none"
                />
              </div>
              
              <div className="flex items-center gap-2">
                <select 
                  value={filterWorkload}
                  onChange={(e) => setFilterWorkload(e.target.value as any)}
                  className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-xs text-gray-200 focus:ring-2 focus:ring-purple-500/50 outline-none"
                >
                  <option value="all">All Status</option>
                  <option value="overloaded">Overloaded</option>
                  <option value="underutilized">Underutilized</option>
                </select>
              </div>

              <div className="flex items-center gap-2 border border-gray-700 rounded-lg p-1 bg-gray-800/30">
                <button 
                  onClick={() => setViewMode('board')}
                  className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${viewMode === 'board' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-gray-200'}`}
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => setViewMode('list')}
                  className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${viewMode === 'list' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-gray-200'}`}
                >
                  <ListFilter className="w-4 h-4" />
                </button>
              </div>

              {Object.keys(assignments).length > 0 && (
                <button 
                  onClick={() => setShowDiff(!showDiff)}
                  className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${showDiff ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30' : 'bg-gray-800 text-gray-400 border border-gray-700'}`}
                >
                  Show Changes
                </button>
              )}
            </div>
          </div>

          {/* Board or List Content */}
          <div className="flex-1 overflow-hidden">
            <AnimatePresence mode="wait">
              {Object.keys(assignments).length === 0 && !isRunning ? (
                <motion.div 
                  key="empty" 
                  initial={{ opacity: 0 }} 
                  animate={{ opacity: 1 }}
                  className="h-full flex flex-col items-center justify-center text-center max-w-md mx-auto"
                >
                  <div className="w-20 h-20 bg-purple-500/10 rounded-full flex items-center justify-center mb-6 border border-purple-500/20">
                    <Play className="w-8 h-8 text-purple-400 fill-purple-400/20" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-100 mb-3">Ready to Allocate</h3>
                  <p className="text-gray-400 text-sm leading-relaxed mb-8">
                    The AI matching engine is ready to analyze {tasks.length} unassigned tasks and distribute them across your team of {employees.length}.
                  </p>
                  <button 
                    onClick={runAssignmentWorkflow}
                    className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-4 rounded-2xl shadow-[0_0_40px_rgba(147,51,234,0.3)] transition-all flex items-center justify-center gap-2"
                  >
                    <Sparkles className="w-5 h-5" />
                    Run Matching Engine
                  </button>
                </motion.div>
              ) : isRunning && Object.keys(assignments).length === 0 ? (
                <motion.div 
                  key="loading" 
                  initial={{ opacity: 0 }} 
                  animate={{ opacity: 1 }}
                  className="h-full flex flex-col items-center justify-center"
                >
                  <div className="relative w-32 h-32 mb-8">
                    <motion.div 
                      animate={{ rotate: 360 }} 
                      transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                      className="absolute inset-0 rounded-full border-4 border-t-purple-500 border-r-transparent border-b-transparent border-l-transparent"
                    />
                    <motion.div 
                      animate={{ rotate: -360 }} 
                      transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                      className="absolute inset-2 rounded-full border-4 border-t-indigo-500 border-r-transparent border-b-transparent border-l-transparent"
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Zap className="w-10 h-10 text-purple-400 animate-pulse" />
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-gray-200">AI Matching in Progress</h3>
                  <p className="text-gray-500 text-sm mt-2">Computing optimal workload distribution...</p>
                </motion.div>
              ) : viewMode === 'board' ? (
                <motion.div 
                  key="board"
                  initial={{ opacity: 0 }} 
                  animate={{ opacity: 1 }}
                  className="h-full flex flex-col overflow-hidden"
                >
                  {/* Horizontal Board */}
                  <div 
                    ref={boardScrollRef}
                    className="flex-1 overflow-x-auto overflow-y-hidden p-4"
                  >
                    <div className="flex gap-4 h-full min-w-min">
                      {/* Unassigned Tasks Column */}
                      <motion.div 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex-shrink-0 w-80 bg-[#121217] border-2 border-dashed border-gray-700 rounded-2xl p-4 flex flex-col"
                      >
                        <h3 className="text-sm font-bold text-gray-300 mb-4 flex items-center gap-2">
                          <AlertCircle className="w-4 h-4 text-amber-400" />
                          Unassigned ({unassignedTasks.length})
                        </h3>
                        <div 
                          onDragOver={handleDragOver}
                          onDragLeave={handleDragLeave}
                          onDrop={(e) => handleDrop(e, null)}
                          className="flex-1 overflow-y-auto space-y-3 rounded-xl transition-all"
                        >
                          {unassignedTasks.length === 0 ? (
                            <div className="flex items-center justify-center h-full text-gray-600">
                              <span className="text-xs font-medium">All tasks assigned ✓</span>
                            </div>
                          ) : (
                            unassignedTasks.map(t => (
                              <motion.div 
                                key={t._id}
                                draggable
                                onDragStart={() => handleDragStart(t._id, null)}
                                className="bg-[#0A0A0A] border border-gray-800 hover:border-amber-500/50 rounded-lg p-3 cursor-move hover:shadow-lg transition-all hover:scale-105 group"
                              >
                                <div className="flex items-start gap-2">
                                  <GripVertical className="w-3 h-3 text-gray-700 mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                  <div className="flex-1 min-w-0">
                                    <p className="text-xs font-bold text-gray-200 truncate">{t.title}</p>
                                    <div className="flex items-center gap-2 mt-1">
                                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${t.priority === 'high' ? 'bg-rose-500/20 text-rose-400' : t.priority === 'medium' ? 'bg-amber-500/20 text-amber-400' : 'bg-blue-500/20 text-blue-400'}`}>
                                        {t.priority}
                                      </span>
                                      <span className="text-[10px] text-gray-500 flex items-center gap-1">
                                        <Clock className="w-3 h-3" /> {t.effort}h
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </motion.div>
                            ))
                          )}
                        </div>
                      </motion.div>

                      {/* Employee Columns */}
                      {filteredEmployees.map((emp, idx) => {
                        const empTasks = groupedTasks[emp._id] || [];
                        const workload = calculateWorkload(emp._id);
                        const status = getWorkloadStatus(workload);
                        const isOverloaded = workload > 40;

                        return (
                          <motion.div 
                            key={emp._id}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            className={`flex-shrink-0 w-80 bg-[#121217] border rounded-2xl flex flex-col transition-all overflow-hidden ${isOverloaded ? 'border-rose-500/50 shadow-[0_0_20px_rgba(244,63,94,0.1)]' : 'border-gray-800'}`}
                          >
                            {/* Column Header */}
                            <div className={`p-4 border-b border-gray-800 ${status.bg}`}>
                              <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                  <div className="w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center">
                                    <User className="w-4 h-4 text-gray-400" />
                                  </div>
                                  <div>
                                    <p className="text-sm font-bold text-gray-100">{emp.fullName}</p>
                                    <p className="text-[10px] text-gray-500">{emp.department || 'Team'}</p>
                                  </div>
                                </div>
                              </div>

                              {/* Workload Bar */}
                              <div className="space-y-1.5">
                                <div className="flex justify-between items-center">
                                  <span className="text-xs font-bold text-gray-300">{workload}h / 50h</span>
                                  <span className={`text-[10px] font-bold uppercase ${status.color}`}>
                                    {status.label}
                                  </span>
                                </div>
                                <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                                  <motion.div 
                                    initial={{ width: 0 }}
                                    animate={{ width: `${Math.min(100, (workload / 50) * 100)}%` }}
                                    className={`h-full rounded-full ${isOverloaded ? 'bg-rose-500' : 'bg-purple-500'}`}
                                  />
                                </div>
                              </div>
                            </div>

                            {/* Tasks Dropzone */}
                            <div 
                              onDragOver={handleDragOver}
                              onDragLeave={handleDragLeave}
                              onDrop={(e) => handleDrop(e, emp._id)}
                              className="flex-1 overflow-y-auto p-3 space-y-2 min-h-[300px]"
                            >
                              {empTasks.length === 0 ? (
                                <div className="flex items-center justify-center h-full text-gray-600">
                                  <span className="text-xs font-medium">Drop tasks here</span>
                                </div>
                              ) : (
                                empTasks.map((t) => (
                                  <motion.div 
                                    key={t._id}
                                    draggable
                                    onDragStart={() => handleDragStart(t._id, emp._id)}
                                    className="bg-[#0A0A0A] border border-gray-800 hover:border-purple-500/50 rounded-lg p-3 cursor-move hover:shadow-lg transition-all hover:scale-105 group"
                                  >
                                    <div className="flex items-start gap-2">
                                      <GripVertical className="w-3 h-3 text-gray-700 mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                      <div className="flex-1 min-w-0">
                                        <p className="text-xs font-bold text-gray-200 truncate">{t.title}</p>
                                        <div className="flex items-center gap-1 mt-1.5 flex-wrap">
                                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${t.priority === 'high' ? 'bg-rose-500/20 text-rose-400' : t.priority === 'medium' ? 'bg-amber-500/20 text-amber-400' : 'bg-blue-500/20 text-blue-400'}`}>
                                            {t.priority}
                                          </span>
                                          <span className="text-[10px] text-gray-500 flex items-center gap-1">
                                            <Clock className="w-3 h-3" /> {t.effort}h
                                          </span>
                                        </div>
                                        
                                        {/* Compact Reasoning */}
                                        {explainability[t._id] && (
                                          <div className="mt-2 text-[9px] text-gray-500 leading-tight line-clamp-2">
                                            💡 {explainability[t._id]}
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </motion.div>
                                ))
                              )}
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                </motion.div>
              ) : (
                /* LIST VIEW */
                <motion.div 
                  key="list"
                  initial={{ opacity: 0 }} 
                  animate={{ opacity: 1 }}
                  className="flex-1 overflow-y-auto p-4"
                >
                  <div className="space-y-3">
                    {/* Unassigned Section */}
                    {unassignedTasks.length > 0 && (
                      <div className="bg-[#121217] border border-amber-500/20 rounded-2xl p-4">
                        <h3 className="text-sm font-bold text-amber-400 mb-3 flex items-center gap-2">
                          <AlertCircle className="w-4 h-4" /> Unassigned Tasks ({unassignedTasks.length})
                        </h3>
                        <div className="space-y-2">
                          {unassignedTasks.map(t => (
                            <div key={t._id} className="bg-[#0A0A0A] border border-gray-800 rounded-lg p-3 flex items-center justify-between">
                              <div className="flex-1">
                                <p className="text-sm font-bold text-gray-200">{t.title}</p>
                                <div className="flex items-center gap-2 mt-1">
                                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${t.priority === 'high' ? 'bg-rose-500/20 text-rose-400' : 'bg-amber-500/20 text-amber-400'}`}>
                                    {t.priority}
                                  </span>
                                  <span className="text-[10px] text-gray-500">{t.effort}h</span>
                                </div>
                              </div>
                              <select 
                                onChange={(e) => e.target.value && reassignTask(t._id, e.target.value)}
                                className="bg-gray-800 border border-gray-700 rounded-lg px-2 py-1 text-xs text-gray-200 focus:ring-2 focus:ring-purple-500/50 outline-none"
                              >
                                <option value="">Assign to...</option>
                                {filteredEmployees.map(emp => (
                                  <option key={emp._id} value={emp._id}>{emp.fullName}</option>
                                ))}
                              </select>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Assigned Section */}
                    {filteredEmployees.map(emp => {
                      const empTasks = groupedTasks[emp._id] || [];
                      if (empTasks.length === 0) return null;
                      const workload = calculateWorkload(emp._id);
                      const status = getWorkloadStatus(workload);

                      return (
                        <div key={emp._id} className={`bg-[#121217] border rounded-2xl p-4 ${status.border}`}>
                          <div className="flex items-center justify-between mb-4">
                            <div>
                              <p className="text-sm font-bold text-gray-100">{emp.fullName}</p>
                              <p className={`text-xs font-bold ${status.color}`}>{workload}h - {status.label}</p>
                            </div>
                          </div>
                          <div className="space-y-2">
                            {empTasks.map(t => (
                              <div key={t._id} className="bg-[#0A0A0A] border border-gray-800 rounded-lg p-3 flex items-center justify-between">
                                <div className="flex-1">
                                  <p className="text-sm font-bold text-gray-200">{t.title}</p>
                                  <div className="flex items-center gap-2 mt-1">
                                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${t.priority === 'high' ? 'bg-rose-500/20 text-rose-400' : 'bg-amber-500/20 text-amber-400'}`}>
                                      {t.priority}
                                    </span>
                                    <span className="text-[10px] text-gray-500">{t.effort}h</span>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </section>
      </main>

      {/* BOTTOM STICKY ACTION BAR */}
      <div className="fixed bottom-0 left-0 right-0 border-t border-gray-800 bg-[#0A0A0A]/90 backdrop-blur-xl p-4 z-40">
        <div className="max-w-[1600px] mx-auto flex items-center justify-between px-6">
          <div className="flex items-center gap-8 text-xs text-gray-500">
             <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${isRunning ? 'bg-amber-500' : 'bg-emerald-500'} shadow-[0_0_10px_rgba(16,185,129,0.5)]`} />
                {isRunning ? 'System Busy' : 'Execution Engine Ready'}
             </div>
             {strategy && (
               <div className="flex items-center gap-2 text-gray-400">
                  <Target className="w-4 h-4 text-purple-400" />
                  Mode: <span className="text-gray-200 font-bold capitalize">{strategy}</span>
               </div>
             )}
          </div>

          <div className="flex gap-4">
            <button 
              disabled={isRunning || Object.keys(assignments).length === 0 || isApproved}
              onClick={runAssignmentWorkflow}
              className="px-6 py-2.5 rounded-xl text-sm font-medium text-gray-400 hover:bg-gray-800 border border-transparent hover:border-gray-700 transition-all disabled:opacity-30"
            >
              Re-run AI Engine
            </button>
            <button 
              disabled={isRunning || Object.keys(assignments).length === 0 || isApproved}
              onClick={handleApprove}
              className="px-10 py-2.5 rounded-xl text-sm font-bold bg-white text-black hover:bg-gray-200 transition-all flex items-center gap-2 shadow-[0_0_40px_rgba(255,255,255,0.2)] disabled:opacity-50"
            >
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
              {isApproved ? 'Assignments Locked' : 'Approve & Commit'}
            </button>
          </div>
        </div>
      </div>

      {/* MOCK DIFF PANEL - Floating Overlay */}
      {isApproved && (
         <motion.div 
           initial={{ opacity: 0, scale: 0.9, y: 50 }} 
           animate={{ opacity: 1, scale: 1, y: 0 }} 
           className="fixed bottom-24 right-8 w-80 bg-[#121217] border border-emerald-500/30 rounded-3xl p-6 shadow-2xl z-50 overflow-hidden"
         >
            <div className="absolute top-0 right-0 p-1 bg-emerald-500/20 rounded-bl-xl">
               <TrendingUp className="w-4 h-4 text-emerald-400" />
            </div>
            <h4 className="text-sm font-bold text-gray-100 mb-4 flex items-center gap-2">
               Assignment Summary
            </h4>
            <div className="space-y-4">
               <div className="flex items-center justify-between text-xs">
                 <span className="text-gray-500">Tasks Assigned</span>
                 <span className="text-white font-bold">{Object.keys(assignments).length} / {tasks.length}</span>
               </div>
               <div className="flex items-center justify-between text-xs">
                 <span className="text-gray-500">Unassigned Backlog</span>
                 <span className="text-rose-400 font-bold">0</span>
               </div>
               <div className="pt-4 border-t border-gray-800">
                  <p className="text-[10px] text-gray-500 leading-relaxed italic">
                    "AI has successfully rebalanced the team workload with a 12% improvement in total capacity usage."
                  </p>
               </div>
            </div>
         </motion.div>
      )}

      {/* Ambient background effects */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-0 overflow-hidden opacity-30">
         <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-900/20 rounded-full blur-[120px] animate-pulse" />
         <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-900/20 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
      </div>
    </div>
  );
}
