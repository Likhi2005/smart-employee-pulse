import React, { useState } from 'react';
import { AlertCircle } from 'lucide-react';
import { useAssignmentHistory } from '../../../../hooks/useAssignmentHistory';
import HistoryFilters from './HistoryFilters';
import HistoryTable from './HistoryTable';
import AssignmentDetailsModal from './AssignmentDetailsModal';
import HistoryStats from './HistoryStats';
import { AssignmentRecord } from '../../../../hooks/useAssignmentHistory';

export default function HistoryView() {
    const { records, isLoading, error, filters, updateFilters, clearFilters, getAssigneeStats } =
        useAssignmentHistory();
    const [selectedRecord, setSelectedRecord] = useState<AssignmentRecord | null>(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);

    const handleRecordClick = (record: AssignmentRecord) => {
        setSelectedRecord(record);
        setShowDetailsModal(true);
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-96 p-6 bg-background">
                <div className="text-muted-foreground">Loading assignment history...</div>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-6 p-6 h-full bg-background">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-semibold text-foreground">Assignment History</h1>
                <p className="text-sm text-muted-foreground mt-1">
                    Complete audit trail of all task assignments and status changes
                </p>
            </div>

            {/* Error Alert */}
            {error && (
                <div className="flex items-start gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <div>
                        <h3 className="font-medium text-red-600">Error</h3>
                        <p className="text-sm text-red-600 mt-1">{error}</p>
                    </div>
                </div>
            )}

            {/* Statistics */}
            <div>
                <HistoryStats records={records} assigneeStats={getAssigneeStats()} />
            </div>

            {/* Filters */}
            <div>
                <HistoryFilters filters={filters} onUpdateFilters={updateFilters} onClearFilters={clearFilters} />
            </div>

            {/* Results */}
            {records.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                    <p className="font-medium">No assignment records found</p>
                    <p className="text-sm mt-1">Try adjusting your filters</p>
                </div>
            ) : (
                <div className="flex-1 overflow-auto">
                    <HistoryTable records={records} onRecordClick={handleRecordClick} />
                </div>
            )}

            {/* Details Modal */}
            {showDetailsModal && selectedRecord && (
                <AssignmentDetailsModal
                    record={selectedRecord}
                    onClose={() => setShowDetailsModal(false)}
                />
            )}
        </div>
    );
}