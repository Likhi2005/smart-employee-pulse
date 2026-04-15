'use client';

import { useState } from 'react';
import { Task, TaskPriority } from '@/types/tasks';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Calendar, Clock, Tag } from 'lucide-react';
import { format, addDays } from 'date-fns';

interface TaskCreationFormProps {
    onSubmit: (taskData: Partial<Task>) => void;
    isLoading?: boolean;
}

const DEFAULT_DUE_DATE = format(addDays(new Date(), 7), 'yyyy-MM-dd');

export default function TaskCreationForm({
    onSubmit,
    isLoading = false
}: TaskCreationFormProps) {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        effort: 4,
        priority: 'medium' as TaskPriority,
        dueDate: DEFAULT_DUE_DATE,
        isMandatory: false,
        tags: [] as string[]
    });

    const [currentTag, setCurrentTag] = useState('');

    const handleChange = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleAddTag = () => {
        if (currentTag.trim() && !formData.tags.includes(currentTag)) {
            setFormData(prev => ({
                ...prev,
                tags: [...prev.tags, currentTag]
            }));
            setCurrentTag('');
        }
    };

    const handleRemoveTag = (tag: string) => {
        setFormData(prev => ({
            ...prev,
            tags: prev.tags.filter(t => t !== tag)
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.title.trim()) {
            alert('Task title is required');
            return;
        }

        onSubmit({
            ...formData,
            createdAt: new Date().toISOString(),
            assignedBy: 'current-user', // TODO: get from auth
            status: 'pending'
        });
    };

    return (
        <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-6">
            {/* Title */}
            <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                    Task Title *
                </label>
                <Input
                    placeholder="Enter task title..."
                    value={formData.title}
                    onChange={(e) => handleChange('title', e.target.value)}
                    disabled={isLoading}
                />
            </div>

            {/* Description */}
            <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                    Description
                </label>
                <textarea
                    placeholder="Describe what needs to be done..."
                    value={formData.description}
                    onChange={(e) => handleChange('description', e.target.value)}
                    disabled={isLoading}
                    className="w-full h-24 px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-600 resize-none"
                />
            </div>

            {/* Grid: Effort, Priority, Due Date */}
            <div className="grid grid-cols-3 gap-4">
                {/* Effort */}
                <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                        Effort (hours)
                    </label>
                    <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <Input
                            type="number"
                            min="1"
                            max="100"
                            value={formData.effort}
                            onChange={(e) => handleChange('effort', parseInt(e.target.value))}
                            disabled={isLoading}
                        />
                    </div>
                </div>

                {/* Priority */}
                <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                        Priority
                    </label>
                    <select
                        value={formData.priority}
                        onChange={(e) => handleChange('priority', e.target.value)}
                        disabled={isLoading}
                        className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-blue-600"
                    >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                        <option value="critical">Critical</option>
                    </select>
                </div>

                {/* Due Date */}
                <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                        Due Date
                    </label>
                    <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <Input
                            type="date"
                            value={formData.dueDate}
                            onChange={(e) => handleChange('dueDate', e.target.value)}
                            disabled={isLoading}
                        />
                    </div>
                </div>
            </div>

            {/* Mandatory Checkbox */}
            <div className="flex items-center gap-3">
                <input
                    type="checkbox"
                    checked={formData.isMandatory}
                    onChange={(e) => handleChange('isMandatory', e.target.checked)}
                    disabled={isLoading}
                    className="w-4 h-4 rounded border-neutral-700 text-blue-600 focus:ring-2 focus:ring-blue-600"
                />
                <label className="text-sm text-foreground cursor-pointer">
                    Mark as mandatory task
                </label>
            </div>

            {/* Tags */}
            <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                    Tags
                </label>
                <div className="flex gap-2 mb-3">
                    <div className="flex-1 flex gap-2 items-center">
                        <Tag className="w-4 h-4 text-muted-foreground" />
                        <Input
                            placeholder="Add tag and press button..."
                            value={currentTag}
                            onChange={(e) => setCurrentTag(e.target.value)}
                            onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                    e.preventDefault();
                                    handleAddTag();
                                }
                            }}
                            disabled={isLoading}
                        />
                    </div>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleAddTag}
                        disabled={isLoading || !currentTag.trim()}
                    >
                        Add
                    </Button>
                </div>
                {formData.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                        {formData.tags.map(tag => (
                            <span
                                key={tag}
                                className="px-3 py-1 bg-blue-600/20 text-blue-400 text-sm rounded-full flex items-center gap-2"
                            >
                                {tag}
                                <button
                                    type="button"
                                    onClick={() => handleRemoveTag(tag)}
                                    className="text-blue-400 hover:text-blue-300"
                                >
                                    ×
                                </button>
                            </span>
                        ))}
                    </div>
                )}
            </div>

            <Button
                type="submit"
                disabled={isLoading || !formData.title.trim()}
                className="w-full"
            >
                {isLoading ? 'Generating Suggestions...' : 'Next: Select Employee'}
            </Button>
        </form>
    );
}