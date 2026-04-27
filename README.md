# 🧠 Smart Employee Pulse - AI-Powered Decision Intelligence & Well-Being System

> A FAANG-level enterprise platform designed to monitor, track, and enhance employee well-being through AI-driven task orchestration and predictive decision intelligence.

![Version](https://img.shields.io/badge/version-2.0.0-blue.svg)
![Status](https://img.shields.io/badge/status-Live%20Development-brightgreen.svg)
![AI-Powered](https://img.shields.io/badge/AI-Gemini%20|%20Groq-purple.svg)

---

## 📋 Table of Contents

- [Project Overview](#project-overview)
- [Key Modules](#key-modules)
- [Technology Stack](#technology-stack)
- [Architecture](#architecture)
- [Weekly Status Updates](#weekly-status-updates)
- [Getting Started](#getting-started)
- [Current Roadmap](#roadmap)

---

## 🎯 Project Overview

**Smart Employee Pulse** has evolved from a simple wellness tracker into a comprehensive **AI-Driven Human Capital Management (HCM) System**. It leverages Large Language Models (LLMs) to bridge the gap between employee well-being and project execution.

### Key Pillars
- **Predictive Well-being**: Detecting burnout before it happens via daily sentiment analysis.
- **AI Orchestration**: Automated project breakdown and intelligent task distribution.
- **Decision Intelligence**: AI-backed conflict resolution and workload balancing for managers.

---

## 🏗️ Key Modules

### 1. Employee Command Center
*   **Hero Decision Band**: Actionable insights delivered in < 5 seconds.
*   **Kanban Board**: Drag-and-drop task lifecycle management (Pending, In-progress, Completed).
*   **Daily Insights**: Personal performance and wellness analytics.
*   **Task Calendar**: Visual schedule for deadline tracking and workload planning.
*   **Wellness Pipeline**: Daily sentiment surveys and mood tracking.

### 2. Manager Command Center
*   **AI Task Manager**: Automated task generation, prioritization, and tracking.
*   **Policy & Rule Engine**: Hybrid deterministic and AI-driven policy validation for team operations.
*   **Task Templates**: Standardized reusable project scaffolding.
*   **Individual Analytics**: Deep-dive insights into each user's performance and wellness trends.
*   **Activity History**: Comprehensive audit logs and task evolution history.
*   **Workload Status**: Granular analytics and capacity heatmaps.

### 3. AI Decision Center (Automation Studio)
*   **Priority Actions**: AI-detected bottlenecks (Workload, Deadline, Skill gaps).
*   **Smart Project Breakdown**: Auto-scaffolding of projects into structured task trees.
*   **Task Assignment Engine**: AI-driven workload balancing and skill-based matching.
*   **Simulation Studio**: Predictive impact analysis of management decisions.

---

## 🛠️ Technology Stack

### Frontend
- **React 19 / Vite** - High-performance UI framework.
- **Tailwind CSS** - Custom design system with glassmorphism and dark mode.
- **Framer Motion** - Premium micro-interactions and transitions.
- **Recharts** - Data visualization and heatmaps.
- **React Router 6** - Robust navigation and state-persistent routing.

### Backend & AI
- **Node.js / Express** - Scalable service layer.
- **MongoDB / Mongoose** - Document-based data orchestration.
- **Groq / Gemini 1.5** - Multi-model AI provider for intelligent features.
- **JWT / Bcrypt** - Secure enterprise-grade authentication.

---

## 📊 Weekly Status Updates

### **WEEK 1: Documentation Phase**
| # | Name | Role | Responsibility |
|---|------|------|-----------------|
| 1 | **Likhith S** | Team Leader | PRS Documentation |
| 2 | **Yaswan** | Marketing | Ppt Document |
| 3 | **Kushal** | Custmer Contact Lead | Project Analysis |
| 4 | **Tharun** | Testing | Problem statement Documentation |
| 5 | **Sulthan** | UI/UX | PRS Documentation |
| 6 | **Sumanth** | Developer | Project Requirements |

### **WEEK 2: Development Foundation**
| # | Name | Role | Responsibility |
|---|------|------|-----------------|
| 1 | **Likhith S** | Team Leader | Employee Dashboard |
| 2 | **Yaswan** | Marketing | Customer Reaching |
| 3 | **Kushal** | Custmer Contact Lead | Marketing(Survey) |
| 4 | **Tharun** | Testing | Customer Reaching |
| 5 | **Sulthan** | UI/UX | UI development |
| 6 | **Sumanth** | Developer | Integration, data flow |

---

### **WEEK 3: Core Infrastructure (Completed)**
*   ✅ **Enterprise Architecture**: Setup React 19 + Vite + Tailwind CSS design tokens.
*   ✅ **Auth Security**: Implementation of JWT-based authentication and secure routing.
*   ✅ **Component Library**: Development of 15+ reusable enterprise-grade UI components.
*   ✅ **State Management**: Context-based global state for user sessions and themes.

### **WEEK 4: Employee Command Center (Completed)**
*   ✅ **Dashboard Hero**: Implementation of the primary employee interface.
*   ✅ **Wellness Survey**: Intelligent survey modal with session-persistence.
*   ✅ **Task Pipeline**: Kanban and List views for employee task management.
*   ✅ **Real-time Metrics**: Integration of Recharts for wellness trend visualization.

### **WEEK 5: Full Stack & AI Integration (Completed)**
*   ✅ **Backend API**: Deployment of Express server with MongoDB integration.
*   ✅ **AI Service Layer**: Implementation of multi-model support (Gemini & Groq).
*   ✅ **Automation Engine**: AI-powered task priority detection and project breakdown.
*   ✅ **Data Sync**: Migration from mock data to real-time database orchestration.

### **WEEK 6: Manager Dashboard & Decision Intelligence (In Progress)**
*   🚀 **AI Decision Center**: Real-time conflict detection and AI-suggested resolutions.
*   🚀 **Workload Analytics**: Advanced heatmap and trend analysis for team management.
*   🚀 **Assignment Studio**: AI-driven task allocation and skill-matching engine.
*   🚀 **System Hardening**: Removal of placeholders and final data-wiring of all dashboards.

---

## 🚀 Getting Started

1. **Clone the repository**
   ```bash
   git clone https://github.com/Likhi2005/smart-employee-pulse.git
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   # Configure .env with MONGODB_URI, GROQ_API_KEY, JWT_SECRET
   npm start
   ```

3. **Frontend Setup**
   ```bash
   cd wellbeing-frontend
   npm install
   npm run dev
   ```

---

## 🛣️ Roadmap (Upcoming)
- [ ] **Advanced Wellness Prediction**: Machine Learning models for burnout risk scoring.
- [ ] **Multi-Department Scoping**: Tenant-based separation for large organizations.
- [ ] **AI Meeting Summarizer**: Integration of meeting notes into task breakdowns.
- [ ] **Mobile Native App**: React Native expansion for well-being on the go.

---
© 2024 Smart Employee Pulse Team. All rights reserved.
