import React from 'react';
import { motion } from 'framer-motion';
import { Building2 } from 'lucide-react';

const companies = [
    { id: 1, name: 'TechCorp', initials: 'TC' },
    { id: 2, name: 'InnovateLabs', initials: 'IL' },
    { id: 3, name: 'DataDrive', initials: 'DD' },
    { id: 4, name: 'CloudSync', initials: 'CS' },
    { id: 5, name: 'StreamFlow', initials: 'SF' },
    { id: 6, name: 'NexusCore', initials: 'NC' },
];

const getGradient = (index) => {
    const gradients = [
        'from-blue-500 to-blue-600',
        'from-purple-500 to-purple-600',
        'from-pink-500 to-pink-600',
        'from-green-500 to-green-600',
        'from-orange-500 to-orange-600',
        'from-indigo-500 to-indigo-600',
    ];
    return gradients[index % gradients.length];
};

export const TrustedBy = () => {
    return (
        <div className="space-y-8">
            <div className="text-center">
                <p className="text-sm font-semibold text-slate-500 uppercase tracking-wide">
                    Trusted by leading companies
                </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {companies.map((company, index) => (
                    <motion.div
                        key={company.id}
                        className="flex items-center justify-center"
                        whileHover={{ scale: 1.08, y: -4 }}
                        transition={{ duration: 0.3 }}
                    >
                        <div className="w-full aspect-square rounded-lg bg-slate-50 border border-slate-200 flex flex-col items-center justify-center cursor-pointer hover:shadow-md transition-shadow">
                            <div
                                className={`w-12 h-12 rounded-lg bg-gradient-to-br ${getGradient(
                                    index
                                )} flex items-center justify-center mb-2`}
                            >
                                <span className="text-white font-bold text-sm">
                                    {company.initials}
                                </span>
                            </div>
                            <span className="text-xs font-medium text-slate-700 text-center px-2">
                                {company.name}
                            </span>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};