'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Calendar, User, Eye, Edit, Trash2, FileX } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ProgramsFilters from './ProgramsFilters';
import { Program, ProgramStatus, ProgramCategory } from '@/types/program';
import { useCoachPrograms } from '@/hooks/useCoachPrograms';
import { useProgramMutations } from '@/hooks/useProgramMutations';
import { Card } from '@/components/ui/card';
import { Frown, Play, Clock, Pencil, Users, PlusCircle } from 'lucide-react';

// Helper function to get status badge
const getStatusBadge = (status: Program['status']) => {
  switch (status) {
    case 'active':
      return <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 min-w-[90px] justify-center"><Play className="h-3 w-3 mr-1" /> Active</Badge>;
    case 'scheduled':
      return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 min-w-[90px] justify-center"><Clock className="h-3 w-3 mr-1" /> Scheduled</Badge>;
    case 'draft':
      return <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100 min-w-[90px] justify-center"><Pencil className="h-3 w-3 mr-1" /> Draft</Badge>;
    default:
      return <Badge variant="secondary" className="min-w-[90px] justify-center">Normal</Badge>;
  }
};

const ProgramsList = () => {
  const [activeStatus, setActiveStatus] = useState<ProgramStatus | 'all'>('all');
  const [activeCategory, setActiveCategory] = useState<ProgramCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const { programs, loading, error, refetch } = useCoachPrograms();
  const { deleteProgram, loading: mutationLoading } = useProgramMutations();

  // Filter programs based on active filters
  const filteredPrograms = useMemo(() => {
    return programs.filter((program) => {
      const matchesStatus = activeStatus === 'all' || program.status === activeStatus;
      const matchesCategory = activeCategory === 'all' || program.category === activeCategory;
      const matchesSearch = program.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           program.description.toLowerCase().includes(searchQuery.toLowerCase());
      
      return matchesStatus && matchesCategory && matchesSearch;
    });
  }, [programs, activeStatus, activeCategory, searchQuery]);

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

  const handleAction = useCallback(async (action: string, program: Program) => {
    switch (action) {
      case 'view':
        navigate(`/coach/programs/view/${program.id}`);
        break;
      case 'edit':
        navigate(`/coach/programs/edit/${program.id}`);
        break;
      case 'delete':
        if (window.confirm(`Are you sure you want to delete "${program.name}"?`)) {
          const ok = await deleteProgram(program.id);
          if (ok) {
            await refetch();
          }
        }
        break;
      default:
        console.log(`Action: ${action} on program:`, program);
    }
  }, [navigate, deleteProgram]);

  return (
    <motion.div
      className="flex flex-col gap-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
    >
      <ProgramsFilters
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        activeStatus={activeStatus}
        setActiveStatus={setActiveStatus}
        activeCategory={activeCategory}
        setActiveCategory={setActiveCategory}
      />

      {loading ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <div className="text-muted-foreground">Loading programs...</div>
        </motion.div>
      ) : error ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <div className="text-red-500">Error loading programs: {error}</div>
        </motion.div>
      ) : filteredPrograms.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center justify-center p-16 text-center border-2 border-dashed rounded-xl"
        >
          <div className="w-20 h-20 rounded-full bg-muted/50 flex items-center justify-center mb-6">
            <FileX className="h-10 w-10 text-muted-foreground" />
          </div>
          <h3 className="font-bold text-2xl mb-2">No programs found</h3>
          <p className="text-muted-foreground text-lg max-w-md mb-6">
            {searchQuery || activeStatus !== 'all' || activeCategory !== 'all'
              ? 'Try adjusting your search terms or filters to find what you\'re looking for.'
              : 'Get started by creating your first program.'
            }
          </p>
          <Button 
            variant="outline" 
            className="mt-6"
            onClick={() => navigate('/coach/programs/create')}
          >
            Create New Program
          </Button>
        </motion.div>
      ) : (
        <motion.div
          className="flex flex-col gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <AnimatePresence>
            <div className="flex flex-col gap-4">
              {/* Table Header for larger screens */}
              <div className="hidden md:grid grid-cols-4 gap-4 p-4 text-sm font-semibold text-muted-foreground border-b-2">
                <div className="col-span-2">Program Name</div>
                <div>Assigned Client</div>
                <div className="text-right">Status</div>
              </div>

              {/* Programs List */}
              {filteredPrograms.map((program, index) => (
                <motion.div
                  key={program.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  layout
                >
                  <Card className="group hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/20 bg-background/50 backdrop-blur-sm">
                    {/* Desktop View */}
                    <div className="hidden md:grid grid-cols-4 items-center gap-4 p-4">
                      {/* Program Name */}
                      <div className="col-span-2 flex flex-col">
                        <span className="font-semibold text-lg group-hover:text-primary transition-colors flex items-center gap-2">
                          {program.name}
                          {program.isAIGenerated && (
                            <Badge variant="secondary" className="text-[10px]">AI</Badge>
                          )}
                        </span>
                        <span className="text-sm text-muted-foreground truncate">{program.description}</span>
                      </div>

                      {/* Client */}
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Users className="h-4 w-4 shrink-0" />
                        <span className="truncate">{getClientName(program.assignedTo)}</span>
                      </div>

                      {/* Status */}
                      <div className="text-right flex items-center justify-end gap-2">
                        {getStatusBadge(program.status)}
                        {/* Actions */}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 opacity-75 hover:opacity-100" disabled={mutationLoading}>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem onClick={() => handleAction('view', program)}>
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleAction('edit', program)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit Program
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleAction('delete', program)} 
                              className="text-destructive focus:text-destructive"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete Program
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>

                    {/* Mobile View */}
                    <div className="md:hidden p-4 flex flex-col gap-2">
                      <div className="flex justify-between items-center">
                        <h3 className="text-xl font-bold group-hover:text-primary flex items-center gap-2">
                          {program.name}
                          {program.isAIGenerated && (
                            <Badge variant="secondary" className="text-[10px]">AI</Badge>
                          )}
                        </h3>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8" disabled={mutationLoading}>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem onClick={() => handleAction('view', program)}>
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleAction('edit', program)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit Program
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleAction('delete', program)} 
                              className="text-destructive focus:text-destructive"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete Program
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      <p className="text-sm text-muted-foreground">{program.description}</p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Users className="h-4 w-4 shrink-0" />
                        <span>Client: {getClientName(program.assignedTo)}</span>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {getStatusBadge(program.status)}
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </AnimatePresence>
        </motion.div>
      )}
    </motion.div>
  );
};

export default ProgramsList;