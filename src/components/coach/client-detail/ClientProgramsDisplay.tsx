import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, Play, Pencil, Eye } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

interface ClientProgramsDisplayProps {
  programs: any[];
  clientId: string;
}

const ClientProgramsDisplay: React.FC<ClientProgramsDisplayProps> = ({ programs, clientId }) => {
  const navigate = useNavigate();

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100"><Play className="h-3 w-3 mr-1" /> Active</Badge>;
      case 'scheduled':
        return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100"><Clock className="h-3 w-3 mr-1" /> Scheduled</Badge>;
      case 'draft':
        return <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100"><Pencil className="h-3 w-3 mr-1" /> Draft</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'fitness':
        return '💪';
      case 'nutrition':
        return '🥗';
      case 'mental health':
        return '🧘‍♂️';
      default:
        return '📋';
    }
  };

  if (!programs || programs.length === 0) {
    return (
      <Card className="shadow-lg rounded-xl">
        <CardHeader>
          <CardTitle>Programs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="text-6xl mb-4">📋</div>
            <h3 className="text-lg font-semibold text-muted-foreground mb-2">No Programs Assigned</h3>
            <p className="text-muted-foreground mb-4">
              This client doesn't have any programs assigned yet.
            </p>
            <Button 
              onClick={() => navigate('/coach/programs/create')}
              className="gap-2"
            >
              <Pencil className="h-4 w-4" />
              Create New Program
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg rounded-xl">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Assigned Programs</span>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => navigate('/coach/programs/create')}
            className="gap-2"
          >
            <Pencil className="h-4 w-4" />
            Create New
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {programs.map((program, index) => (
            <motion.div
              key={program.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Card className="border-l-4 border-l-primary hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-2xl">{getCategoryIcon(program.category)}</span>
                        <div>
                          <h4 className="font-semibold text-lg">{program.name}</h4>
                          <p className="text-sm text-muted-foreground">{program.description}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4 mt-3">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{program.category}</Badge>
                          {getStatusBadge(program.status)}
                        </div>
                        
                        {program.scheduledDate && (
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Calendar className="h-4 w-4" />
                            <span>Starts: {new Date(program.scheduledDate).toLocaleDateString()}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/coach/programs/view/${program.id}`)}
                        className="gap-2"
                      >
                        <Eye className="h-4 w-4" />
                        View
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/coach/programs/edit/${program.id}`)}
                        className="gap-2"
                      >
                        <Pencil className="h-4 w-4" />
                        Edit
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ClientProgramsDisplay;
