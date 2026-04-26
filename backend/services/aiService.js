const { GoogleGenerativeAI } = require('@google/generative-ai');
const Groq = require('groq-sdk');
const Task = require('../models/Task');
const User = require('../models/User');
const Leaderboard = require('../models/Leaderboard');

// Initialize AI clients
const initializeAI = () => {
    const aiProvider = process.env.AI_PROVIDER || 'gemini'; // 'gemini' or 'groq'

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
        throw new Error('No AI provider configured. Set GEMINI_API_KEY or GROQ_API_KEY');
    }
};

// ============================================================
// 1. AUTO DETECT TASK PRIORITY
// ============================================================
const detectTaskPriority = async (taskTitle, taskDescription) => {
    try {
        const ai = initializeAI();

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
                model: 'mixtral-8x7b-32768',
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
                model: 'mixtral-8x7b-32768',
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
                model: 'mixtral-8x7b-32768',
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
const aiDistributeTasks = async (tasks, employees, companyPolicyContext) => {
    try {
        const ai = initializeAI();

        const taskList = tasks.map((t, i) => `${i + 1}. "${t.title}" (effort: ${t.effort}h, priority: ${t.priority})`).join('\n');
        const empList = employees.map(e => `- ${e.fullName} | Workload: ${e.currentWorkload}% | Skills: ${(e.skills || []).join(', ') || 'General'}`).join('\n');

        const prompt = `
You are a smart task distribution engine for a team management platform.

Team members and their current state:
${empList}

Tasks to distribute:
${taskList}

Rules:
1. Balance workload — do not assign more than 2 tasks to the same person if others are available
2. Match skills where possible
3. Higher priority tasks go to lower-workload people
4. Each task must be assigned to exactly one person

Respond ONLY with valid JSON, no markdown:
{
  "assignments": [
    {
      "taskTitle": "exact task title",
      "assigneeName": "exact employee fullName",
      "reason": "1-sentence explanation referencing workload or skill"
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
                model: 'mixtral-8x7b-32768',
                temperature: 0.5,
                max_tokens: 1200,
            });
            response = result.choices[0].message.content;
        }

        const cleaned = response.replace(/```(?:json)?/gi, '').replace(/```/g, '').trim();
        const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
        if (!jsonMatch) throw new Error('Failed to parse AI distribution response');

        return JSON.parse(jsonMatch[0]);
    } catch (error) {
        console.error('AI distribution error:', error);
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
                model: 'mixtral-8x7b-32768',
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

module.exports = {
    detectTaskPriority,
    smartAssignTask,
    generateTaskBreakdown,
    generatePerformanceInsights,
    aiDistributeTasks,
};