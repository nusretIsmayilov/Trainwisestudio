// src/components/customer/coaches/ExplorerTab.tsx
import ModernCoachExplorer from './ModernCoachExplorer';

interface ExplorerTabProps {
    onNewCoachRequestSent: (coachName: string) => void;
}

const ExplorerTab: React.FC<ExplorerTabProps> = ({ onNewCoachRequestSent }) => {
    return (
        <ModernCoachExplorer onNewCoachRequestSent={onNewCoachRequestSent} />
    );
};

export default ExplorerTab;
