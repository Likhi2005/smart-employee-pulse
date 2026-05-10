const { GoogleGenerativeAI } = require('@google/generative-ai');
const Groq = require('groq-sdk');
const Task = require('../models/Task');
const User = require('../models/User');
const Leaderboard = require('../models/Leaderboard');

// Initialize AI clients with fallback to mock mode
const initializeAI = () => {
    const aiProvider = process.env.AI_PROVIDER; // 'gemini' or 'groq'

    if (aiProvider === 'gemini' && process.env.GEMINI_API_KEY) {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        return {
            provider: 'gemini',
            client: genAI.getGenerativeModel({ model: 'gemini-2.0-flash' }),
        };
    } else if (aiProvider === 'groq' && process.env.GROQ_API_KEY) {
        return {
            provider: 'groq',
            client: new Groq({ apiKey: process.env.GROQ_API_KEY }),
        };
    } else {
        // Fallback to mock mode for development/demo
        console.warn('⚠️ No AI provider configured. Using fallback mock mode. Set AI_PROVIDER, GEMINI_API_KEY or GROQ_API_KEY to enable real AI.');
        return {
            provider: 'mock',
            client: null,
        };
    }
};

// ============================================================
// 1. AUTO DETECT TASK PRIORITY
// ============================================================
const detectTaskPriority = async (taskTitle, taskDescription) => {
    try {
        const ai = initializeAI();

        // If in mock mode, use simple heuristics
        if (ai.provider === 'mock') {
            const titleLower = (taskTitle || '').toLowerCase();
            const descLower = (taskDescription || '').toLowerCase();
            const urgentKeywords = ['urgent', 'critical', 'asap', 'blocker', 'production', 'incident'];
            const lowKeywords = ['update', 'document', 'cleanup', 'refactor', 'minor'];
            
            const text = titleLower + ' ' + descLower;
            if (urgentKeywords.some(k => text.includes(k))) {
                return { priority: 'high', confidence: 0.7, reasoning: 'Detected urgent keywords (mock mode)' };
            }
            if (lowKeywords.some(k => text.includes(k))) {
                return { priority: 'low', confidence: 0.6, reasoning: 'Detected routine keywords (mock mode)' };
            }
            return { priority: 'medium', confidence: 0.5, reasoning: 'Default to medium priority (mock mode)' };
        }

        const prompt = `
You are a task priority analyzer for a customer support team.

Based on the following task information, determine the priority level:
- low: Routine, non-urgent tasks (documentation, minor updates)
- medium: Standard work, important but not critical
- high: Urgent, impactful, or blocking other work

Task Title: "${taskTitle}"
Task Description: "${taskDescription}"

Respond ONLY with JSON:
{
  "priority": "low|medium|high",
  "confidence": 0.0-1.0,
  "reasoning": "brief explanation"
}
`;

        let response;
        if (ai.provider === 'gemini') {
            const result = await ai.client.generateContent(prompt);
            response = result.response.text();
        } else if (ai.provider === 'groq') {
            const result = await ai.client.chat.completions.create({
                messages: [{ role: 'user', content: prompt }],
                model: 'llama-3.3-70b-versatile',
                temperature: 0.7,
                max_tokens: 300,
            });
            response = result.choices[0].message.content;
        }

        // Parse JSON response
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            throw new Error('Failed to parse AI response');
        }

        const parsed = JSON.parse(jsonMatch[0]);
        return {
            priority: parsed.priority,
            confidence: parsed.confidence,
            reasoning: parsed.reasoning,
        };
    } catch (error) {
        console.error('Error detecting priority:', error);
        // Fallback to manual priority if AI fails
        return {
            priority: 'medium',
            confidence: 0,
            reasoning: 'AI detection failed, defaulted to medium',
        };
    }
};

// ============================================================
// 2. SMART TASK ASSIGNMENT (Skills + Performance)
// ============================================================
const smartAssignTask = async (taskId, companyId) => {
    try {
        const ai = initializeAI();

        // Get task details
        const task = await Task.findOne({ _id: taskId, companyId });
        if (!task) {
            throw new Error('Task not found');
        }

        // Get all active employees with their performance data
        const employees = await User.find({
            companyId,
            role: 'employee',
            isActive: true,
        }).select('_id fullName email department currentWorkload');

        // Get leaderboard data (performance metrics)
        const leaderboards = await Leaderboard.find({
            companyId,
            userId: { $in: employees.map((e) => e._id) },
        });

        // Enrich employee data with performance metrics
        const employeeData = employees.map((emp) => {
            const lb = leaderboards.find((l) => l.userId.toString() === emp._id.toString());
            return {
                id: emp._id,
                name: emp.fullName,
                email: emp.email,
                department: emp.department,
                workload: emp.currentWorkload,
                completedTasks: lb?.tasksCompleted || 0,
                points: lb?.points || 0,
                performanceScore: lb ? lb.points / Math.max(lb.tasksCompleted, 1) : 0,
            };
        });

        if (employeeData.length === 0) {
            return {
                success: false,
                reason: 'No active employees available',
            };
        }

        // If in mock mode, use simple heuristics
        if (ai.provider === 'mock') {
            const sortedByWorkload = [...employeeData].sort((a, b) => a.workload - b.workload);
            const sortedByPerformance = [...employeeData].sort((a, b) => b.performanceScore - a.performanceScore);
            
            const recommended = sortedByPerformance.length > 0 ? sortedByPerformance[0] : sortedByWorkload[0];
            const alternatives = sortedByWorkload.slice(1, 3).map(e => e.name);

            return {
                success: true,
                recommendedEmployee: {
                    id: recommended.id,
                    name: recommended.name,
                    email: recommended.email,
                    department: recommended.department,
                },
                analysis: {
                    reason: `Recommended based on lowest workload (${recommended.workload}h) and performance score (${recommended.performanceScore.toFixed(2)}) - mock mode`,
                    workloadAfterTask: Math.min(100, recommended.workload + (task.effort || 1)),
                    riskFactors: recommended.workload > 30 ? ['Employee approaching overload threshold'] : [],
                    alternatives,
                },
                strategy: 'Workload-balanced assignment with performance consideration (mock mode)',
            };
        }

        // Create prompt for AI to analyze and suggest best employee
        const prompt = `
You are an intelligent task assignment system for a customer support team.

Task to assign:
- Title: "${task.title}"
- Description: "${task.description}"
- Effort: ${task.effort} hours
- Priority: ${task.priority}

Team members available:
${employeeData
                .map(
                    (emp) => `
- ${emp.name} (${emp.department})
  Current Workload: ${emp.workload}
  Completed Tasks: ${emp.completedTasks}
  Performance Score: ${emp.performanceScore.toFixed(2)}
  Email: ${emp.email}
`
                )
                .join('\n')}

Consider:
1. Current workload (lower is better)
2. Performance history (task completion rate)
3. Department match (if relevant)
4. Skill fit (inferred from description)

Respond ONLY with JSON:
{
  "recommendedEmployee": {
    "name": "employee name",
    "reason": "detailed explanation why this employee is best fit",
    "workloadAfterTask": estimated_workload,
    "riskFactors": ["any concerns"],
    "alternatives": ["name of 2nd choice", "name of 3rd choice"]
  },
  "reasoning": "overall strategy explanation"
}
`;

        let response;
        if (ai.provider === 'gemini') {
            const result = await ai.client.generateContent(prompt);
            response = result.response.text();
        } else if (ai.provider === 'groq') {
            const result = await ai.client.chat.completions.create({
                messages: [{ role: 'user', content: prompt }],
                model: 'llama-3.3-70b-versatile',
                temperature: 0.7,
                max_tokens: 500,
            });
            response = result.choices[0].message.content;
        }

        const jsonMatch = response.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            throw new Error('Failed to parse AI response');
        }

        const aiRecommendation = JSON.parse(jsonMatch[0]);

        // Map recommended employee name back to ID
        const recommendedEmp = employeeData.find(
            (emp) => emp.name === aiRecommendation.recommendedEmployee.name
        );

        if (!recommendedEmp) {
            throw new Error('Recommended employee not found');
        }

        return {
            success: true,
            recommendedEmployee: {
                id: recommendedEmp.id,
                name: recommendedEmp.name,
                email: recommendedEmp.email,
                department: recommendedEmp.department,
            },
            analysis: {
                reason: aiRecommendation.recommendedEmployee.reason,
                workloadAfterTask: aiRecommendation.recommendedEmployee.workloadAfterTask,
                riskFactors: aiRecommendation.recommendedEmployee.riskFactors,
                alternatives: aiRecommendation.recommendedEmployee.alternatives,
            },
            strategy: aiRecommendation.reasoning,
        };
    } catch (error) {
        console.error('Error in smart assignment:', error);
        return {
            success: false,
            reason: `Smart assignment failed: ${error.message}`,
        };
    }
};

// ============================================================
// 3. GENERATE TASK BREAKDOWN (For complex tasks)
// ============================================================
const generateTaskBreakdown = async (taskTitle, taskDescription, taskEffort) => {
    try {
        const ai = initializeAI();

        // If in mock mode, create simple breakdown
        if (ai.provider === 'mock') {
            const effortPerTask = Math.ceil(taskEffort / 3);
            return {
                subtasks: [
                    {
                        title: `Preparation & Setup - ${taskTitle}`,
                        description: 'Initial research, environment setup, and requirements clarification',
                        effort: effortPerTask,
                        priority: 'high',
                    },
                    {
                        title: `Implementation - ${taskTitle}`,
                        description: 'Main development and implementation work',
                        effort: effortPerTask,
                        priority: 'high',
                    },
                    {
                        title: `Testing & Review - ${taskTitle}`,
                        description: 'Testing, review, and refinement',
                        effort: taskEffort - (effortPerTask * 2),
                        priority: 'medium',
                    },
                ],
                breakdownStrategy: 'Standard three-phase breakdown (Prepare, Implement, Test) - mock mode',
            };
        }

        const prompt = `
You are a project management expert breaking down complex tasks into subtasks.

Main Task: "${taskTitle}"
Description: "${taskDescription || ''}"
Total Effort: ${taskEffort} hours

Break this task into 4-8 actionable subtasks that together sum to approximately ${taskEffort} hours.
For each subtask, assign a priority (low, medium, or high) based on its criticality.

Respond ONLY with valid JSON, no markdown, no extra text:
{
  "subtasks": [
    {
      "title": "subtask title",
      "description": "clear description of what to do",
      "effort": estimated_hours_as_number,
      "priority": "low|medium|high"
    }
  ],
  "breakdownStrategy": "brief explanation of breakdown approach"
}
`;

        let response;
        if (ai.provider === 'gemini') {
            const result = await ai.client.generateContent(prompt);
            response = result.response.text();
        } else if (ai.provider === 'groq') {
            const result = await ai.client.chat.completions.create({
                messages: [{ role: 'user', content: prompt }],
                model: 'llama-3.3-70b-versatile',
                temperature: 0.7,
                max_tokens: 800,
            });
            response = result.choices[0].message.content;
        }

        // Strip markdown code fences if present
        const cleaned = response.replace(/```(?:json)?/gi, '').replace(/```/g, '').trim();
        const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            throw new Error('Failed to parse AI response as JSON');
        }

        const parsed = JSON.parse(jsonMatch[0]);
        // Return normalized subtasks array directly
        const subtasks = (parsed.subtasks || []).map(t => ({
            title: t.title || 'Untitled Task',
            description: t.description || '',
            effort: Number(t.effort) || 2,
            priority: ['low', 'medium', 'high'].includes(t.priority) ? t.priority : 'medium',
        }));

        return {
            subtasks,
            breakdownStrategy: parsed.breakdownStrategy || '',
        };
    } catch (error) {
        console.error('Error generating task breakdown:', error);
        throw new Error(`AI breakdown failed: ${error.message}`);
    }
};

// ============================================================
// 5. AI-POWERED BULK DISTRIBUTION (Policy-Aware)
// ============================================================
const extractSkillKeywords = (text) => {
    const skillMap = {
        backend: ['backend', 'nodejs', 'node.js', 'express', 'api', 'database', 'sql', 'mongodb', 'server', 'spring', 'java'],
        frontend: ['frontend', 'react', 'vue', 'angular', 'typescript', 'html', 'css', 'javascript', 'ui', 'component', 'tsx', 'jsx'],
        design: ['design', 'ui', 'ux', 'figma', 'sketch', 'wireframe', 'mockup', 'visual', 'layout', 'branding'],
        devops: ['devops', 'docker', 'kubernetes', 'terraform', 'aws', 'ci/cd', 'jenkins', 'deployment', 'infrastructure'],
        fullstack: ['fullstack', 'full-stack', 'end-to-end'],
    };

    const lowerText = text.toLowerCase();
    const foundSkills = [];

    for (const [category, keywords] of Object.entries(skillMap)) {
        if (keywords.some(kw => lowerText.includes(kw))) {
            foundSkills.push(category);
        }
    }

    return foundSkills.length > 0 ? foundSkills : ['general'];
};

const aiDistributeTasks = async (tasks, employees, companyPolicyContext) => {
    try {
        const ai = initializeAI();

        // Extract skill requirements from task descriptions
        const taskList = tasks.map((t, i) => {
            const skillKeywords = extractSkillKeywords(t.title + ' ' + (t.description || ''));
            return `${i + 1}. "${t.title}" (effort: ${t.effort}h, priority: ${t.priority}, required skills: ${skillKeywords.join(', ')})`;
        }).join('\n');

        // Show employee skills clearly - mark NO_SKILLS for empty arrays
        const empList = employees.map(e => {
            const skillsStr = (e.skills && e.skills.length > 0) 
                ? e.skills.join(', ') 
                : 'NO_SKILLS';
            return `- ${e.fullName} (${e.department}) | Workload: ${e.currentWorkload}h | Skills: ${skillsStr}`;
        }).join('\n');

        // If in mock mode, use a simple workload-based distribution
        if (ai.provider === 'mock') {
            console.log('\n⚡ Using fallback workload-based distribution (mock mode)\n');
            const sortedEmployees = [...employees].sort((a, b) => (a.currentWorkload || 0) - (b.currentWorkload || 0));
            
            const assignments = tasks.map((task, idx) => {
                const employee = sortedEmployees[idx % sortedEmployees.length];
                return {
                    taskTitle: task.title,
                    assigneeName: employee.fullName,
                    reason: `Assigned based on lowest workload (${employee.currentWorkload}h) via fallback distribution`
                };
            });
            
            return { assignments };
        }

        const prompt = `
You are an expert task distribution engine. Your PRIMARY goal is SKILL MATCHING.

Team members and their expertise:
${empList}

Tasks to distribute (with required skills):
${taskList}

**MANDATORY SKILL MATCHING RULES:**
1. **SKILL MATCH IS CRITICAL** - Never assign a backend task to someone with NO_SKILLS or design skills
2. Assign tasks ONLY to people who have matching skills:
   - Backend/API tasks → Only to people with backend, nodejs, express, java skills
   - Frontend/UI tasks → Only to people with frontend, react, typescript, html/css skills
   - Design tasks → Only to people with design, ui, ux, figma skills
   - DevOps tasks → Only to people with devops, docker, kubernetes skills
3. If NO matching skills available, assign to lowest workload person as fallback
4. Balance workload ONLY among people with matching skills
5. Higher priority tasks go to people with lower workload (among skill matches)
6. Do NOT assign to "NO_SKILLS" unless it's a general admin task
7. Each task assigned to exactly one person

EXAMPLES OF CORRECT MATCHING:
✓ "Update API Endpoints" (requires backend) → Assign to backend developer only
✓ "Design UI Mockups" (requires design) → Assign to designer only
✗ "Update API Endpoints" → DO NOT assign to Designer with NO_SKILLS
✗ "Design UI Mockups" → DO NOT assign to Backend developer

Respond ONLY with valid JSON, no markdown:
{
  "assignments": [
    {
      "taskTitle": "exact task title",
      "assigneeName": "exact employee fullName from the list",
      "reason": "Why assigned based on skill match and workload"
    }
  ]
}
`;

        console.log('\n🔍 === AI DISTRIBUTION DEBUG ===');
        console.log('📋 Employees:', empList);
        console.log('📋 Tasks:', taskList);
        console.log('🤖 Prompt sent to AI:', prompt.substring(0, 300) + '...\n');

        let response;
        if (ai.provider === 'gemini') {
            const result = await ai.client.generateContent(prompt);
            response = result.response.text();
        } else if (ai.provider === 'groq') {
            const result = await ai.client.chat.completions.create({
                messages: [{ role: 'user', content: prompt }],
                model: 'llama-3.3-70b-versatile',
                temperature: 0.2,  // ← CRITICAL: Lower temperature for consistent skill matching
                max_tokens: 1500,
            });
            response = result.choices[0].message.content;
        }

        console.log('✅ AI Raw Response:', response);

        const cleaned = response.replace(/```(?:json)?/gi, '').replace(/```/g, '').trim();
        const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
        if (!jsonMatch) throw new Error('Failed to parse AI distribution response');

        const parsed = JSON.parse(jsonMatch[0]);
        console.log('📋 Parsed Assignments:', JSON.stringify(parsed, null, 2));
        console.log('=== END DEBUG ===\n');
        
        return parsed;
    } catch (error) {
        console.error('❌ AI distribution error:', error);
        throw new Error(`AI distribution failed: ${error.message}`);
    }
};

// ============================================================
// 4. PERFORMANCE ANALYSIS & INSIGHTS
// ============================================================
const generatePerformanceInsights = async (companyId) => {
    try {
        const ai = initializeAI();

        // Get team performance data
        const leaderboards = await Leaderboard.find({ companyId })
            .populate('userId', 'fullName department')
            .sort({ points: -1 });

        const performanceData = leaderboards.map((lb) => ({
            name: lb.userId.fullName,
            department: lb.userId.department,
            points: lb.points,
            tasksCompleted: lb.tasksCompleted,
            avgPointsPerTask: lb.tasksCompleted > 0 ? lb.points / lb.tasksCompleted : 0,
        }));

        if (performanceData.length === 0) {
            return { insights: [] };
        }

        // If in mock mode, generate simple insights based on data
        if (ai.provider === 'mock') {
            const topPerformer = performanceData[0];
            const avgCompletion = performanceData.reduce((sum, p) => sum + p.tasksCompleted, 0) / performanceData.length;
            
            return {
                insights: [
                    {
                        title: 'Top Performer',
                        description: `${topPerformer.name} leads the team with ${topPerformer.points} points and ${topPerformer.tasksCompleted} completed tasks`,
                        recommendation: 'Consider leveraging their expertise for mentoring or complex task assignments',
                    },
                    {
                        title: 'Team Completion Rate',
                        description: `Average tasks completed per person: ${avgCompletion.toFixed(1)}`,
                        recommendation: 'Monitor if completion rates are consistent across the team',
                    },
                    {
                        title: 'Department Distribution',
                        description: `Team is distributed across multiple departments`,
                        recommendation: 'Ensure cross-team collaboration and knowledge sharing',
                    },
                ],
            };
        }

        const prompt = `
You are a performance analytics expert analyzing team productivity.

Team Performance Data:
${performanceData
                .map(
                    (p) => `
${p.name} (${p.department})
- Total Points: ${p.points}
- Tasks Completed: ${p.tasksCompleted}
- Avg Points/Task: ${p.avgPointsPerTask.toFixed(2)}
`
                )
                .join('\n')}

Generate 3-5 specific, actionable insights and recommendations.

Respond ONLY with JSON:
{
  "insights": [
    {
      "title": "insight title",
      "description": "what you observed",
      "recommendation": "what to do about it"
    }
  ]
}
`;

        let response;
        if (ai.provider === 'gemini') {
            const result = await ai.client.generateContent(prompt);
            response = result.response.text();
        } else if (ai.provider === 'groq') {
            const result = await ai.client.chat.completions.create({
                messages: [{ role: 'user', content: prompt }],
                model: 'llama-3.3-70b-versatile',
                temperature: 0.7,
                max_tokens: 800,
            });
            response = result.choices[0].message.content;
        }

        const jsonMatch = response.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            throw new Error('Failed to parse AI response');
        }

        return JSON.parse(jsonMatch[0]);
    } catch (error) {
        console.error('Error generating insights:', error);
        return {
            insights: [
                {
                    title: 'Error',
                    description: error.message,
                    recommendation: 'Try again later',
                },
            ],
        };
    }
};

const generateDecisionReasoning = async (context) => {
    try {
        const ai = initializeAI();
        const { type, teamState, conflictDesc } = context;

        const prompt = `
You are an AI Operations Manager. Explain the reasoning for a resource allocation fix.

Conflict Type: ${type}
Context: ${conflictDesc}

Team Status:
${teamState}

Provide a detailed reasoning in JSON format:
{
  "constraintsApplied": ["List of constraints like 'Workload < 35%'", "Skill matching"],
  "candidateRanking": [
    { "name": "Best Candidate Name", "score": 95, "reason": "Detailed reason why they are the best fit" },
    { "name": "Alternative Name", "score": 65, "reason": "Reason why they are a backup" }
  ],
  "rejectionReasons": ["Why others were rejected"],
  "finalScore": 95
}
`;

        if (ai.provider === 'gemini') {
            const result = await ai.client.generateContent(prompt);
            const text = result.response.text();
            return JSON.parse(text.replace(/```json|```/g, '').trim());
        } else {
            const completion = await ai.client.chat.completions.create({
                messages: [{ role: 'user', content: prompt }],
                model: 'llama-3.3-70b-versatile',
                response_format: { type: 'json_object' },
            });
            return JSON.parse(completion.choices[0].message.content);
        }
    } catch (error) {
        console.error('Error generating reasoning:', error);
        return null;
    }
};

module.exports = {
    detectTaskPriority,
    smartAssignTask,
    generateTaskBreakdown,
    generatePerformanceInsights,
    aiDistributeTasks,
    generateDecisionReasoning,
};