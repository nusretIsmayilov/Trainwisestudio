'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Edit, Calendar, User, Clock, Play, Pencil } from 'lucide-react';
import { useProgramMutations } from '@/hooks/useProgramMutations';
import { Program } from '@/types/program';
import ProgramPlanViewer from '@/components/coach/programs/ProgramPlanViewer';

const ProgramViewPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getProgramById, loading } = useProgramMutations();
  const [program, setProgram] = useState<Program | null>(null);

  useEffect(() => {
    const loadProgram = async () => {
      if (id) {
        const programData = await getProgramById(id);
        if (programData) {
          setProgram(programData);
        }
      }
    };
    loadProgram();
  }, [id, getProgramById]);

  const getStatusBadge = (status: Program['status']) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100"><Play className="h-3 w-3 mr-1" /> Active</Badge>;
      case 'scheduled':
        return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100"><Clock className="h-3 w-3 mr-1" /> Scheduled</Badge>;
      case 'draft':
        return <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100"><Pencil className="h-3 w-3 mr-1" /> Draft</Badge>;
      default:
        return <Badge variant="secondary">Normal</Badge>;
    }
  };

  const getClientName = (clientId: string | null) => {
    if (!clientId) return 'Unassigned';
    // TODO: Replace with real client data from database
    const mockClients = [
      { id: 'client-1', name: 'John Doe' },
      { id: 'client-2', name: 'Jane Smith' },
      { id: 'client-3', name: 'Alex Johnson' },
      { id: 'client-4', name: 'Sarah Williams' },
    ];
    const client = mockClients.find(c => c.id === clientId);
    return client?.name || 'Unknown Client';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-muted-foreground">Loading program...</div>
        </div>
      </div>
    );
  }

  if (!program) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-red-500">Program not found</div>
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={() => navigate('/coach/programs')}
          >
            Back to Programs
          </Button>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="container mx-auto p-4 md:p-6 max-w-4xl"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/coach/programs')}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{program.name}</h1>
            <p className="text-muted-foreground">{program.description}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {getStatusBadge(program.status)}
          <Button
            onClick={() => navigate(`/coach/programs/edit/${program.id}`)}
            className="gap-2"
          >
            <Edit className="h-4 w-4" />
            Edit Program
          </Button>
        </div>
      </div>

      {/* Program Details */}
      <div className="grid gap-6">
        {/* Basic Info */}
        <Card>
          <CardHeader>
            <CardTitle>Program Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Assigned Client:</span>
                <span>{getClientName(program.assignedTo)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Scheduled Date:</span>
                <span>{program.scheduledDate ? new Date(program.scheduledDate).toLocaleDateString() : 'Not scheduled'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Category:</span>
                <Badge variant="outline">{program.category}</Badge>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium">AI Generated:</span>
                <Badge variant={program.isAIGenerated ? "default" : "secondary"}>
                  {program.isAIGenerated ? 'Yes' : 'No'}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Program Plan */}
        {program.plan && (
          <Card>
            <CardHeader>
              <CardTitle>Program Plan</CardTitle>
            </CardHeader>
            <CardContent>
              <ProgramPlanViewer plan={program.plan} category={program.category} />
            </CardContent>
          </Card>
        )}

        {/* Program Description */}
        {program.description && (
          <Card>
            <CardHeader>
              <CardTitle>Program Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{program.description}</p>
            </CardContent>
          </Card>
        )}
      </div>
    </motion.div>
  );
};

export default ProgramViewPage;
