import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  processesService,
  type CreateProcessDto,
} from '../services/processes.service';
import DataTable, { type Column } from '../components/DataTable';
import FormModal, { type FieldConfig } from '../components/FormModal';
import ErrorBanner from '../components/ErrorBanner';
import type { Process, Step } from '../types';

interface ProcessFormData {
  name: string;
  description: string;
  modelId: number;
}

const processColumns: Column<Process>[] = [
  { key: 'name', label: 'Nom' },
  { key: 'description', label: 'Description' },
  { key: 'modelId', label: 'ID Modele' },
];

const processFields: FieldConfig<ProcessFormData>[] = [
  { name: 'name', label: 'Nom', required: true },
  { name: 'description', label: 'Description', required: true },
  { name: 'modelId', label: 'ID Modele', type: 'number', required: true },
];

const stepColumns: Column<Step>[] = [
  { key: 'stepOrder', label: 'Ordre' },
  { key: 'description', label: 'Description' },
];

const ProcessesPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProcess, setEditingProcess] = useState<Process | null>(null);
  const [expandedProcessId, setExpandedProcessId] = useState<number | null>(null);
  const [mutationError, setMutationError] = useState<string | null>(null);

  const { data: processes = [], isLoading, error } = useQuery({
    queryKey: ['processes'],
    queryFn: processesService.getAll,
  });

  const { data: steps = [], isLoading: stepsLoading } = useQuery({
    queryKey: ['processes', expandedProcessId, 'steps'],
    queryFn: () => processesService.getSteps(expandedProcessId!),
    enabled: expandedProcessId !== null,
  });

  const createMutation = useMutation({
    mutationFn: (dto: CreateProcessDto) => processesService.create(dto),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['processes'] });
      setIsModalOpen(false);
      setMutationError(null);
    },
    onError: (err) => {
      setMutationError(err instanceof Error ? err.message : 'Erreur lors de la creation');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, dto }: { id: number; dto: Partial<CreateProcessDto> }) =>
      processesService.update(id, dto),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['processes'] });
      setIsModalOpen(false);
      setEditingProcess(null);
      setMutationError(null);
    },
    onError: (err) => {
      setMutationError(
        err instanceof Error ? err.message : 'Erreur lors de la mise a jour',
      );
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => processesService.delete(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['processes'] });
      if (expandedProcessId !== null) {
        setExpandedProcessId(null);
      }
    },
    onError: (err) => {
      setMutationError(
        err instanceof Error ? err.message : 'Erreur lors de la suppression',
      );
    },
  });

  const handleOpenCreate = () => {
    setEditingProcess(null);
    setMutationError(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (process: Process) => {
    setEditingProcess(process);
    setMutationError(null);
    setIsModalOpen(true);
  };

  const handleDelete = (process: Process) => {
    if (window.confirm(`Supprimer le procede "${process.name}" ?`)) {
      deleteMutation.mutate(process.id);
    }
  };

  const handleToggleSteps = (process: Process) => {
    setExpandedProcessId(expandedProcessId === process.id ? null : process.id);
  };

  const handleSubmit = (formData: ProcessFormData) => {
    const dto: CreateProcessDto = {
      name: formData.name,
      description: formData.description,
      modelId: Number(formData.modelId),
    };

    if (editingProcess) {
      updateMutation.mutate({ id: editingProcess.id, dto });
    } else {
      createMutation.mutate(dto);
    }
  };

  const isMutating = createMutation.isPending || updateMutation.isPending;

  const processColumnsWithActions: Column<Process>[] = [
    ...processColumns,
    {
      key: 'id',
      label: 'Etapes',
      render: (_value, row) => (
        <button
          onClick={() => handleToggleSteps(row)}
          style={{
            padding: '4px 10px',
            backgroundColor: '#f3f4f6',
            border: '1px solid #d1d5db',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '12px',
            color: '#374151',
          }}
        >
          {expandedProcessId === row.id ? 'Masquer etapes' : 'Voir etapes'}
        </button>
      ),
    },
  ];

  return (
    <div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px',
        }}
      >
        <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#1e3a5f' }}>Procedes</h1>
        <button
          onClick={handleOpenCreate}
          style={{
            padding: '8px 18px',
            backgroundColor: '#1e3a5f',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 500,
          }}
        >
          + Nouveau procede
        </button>
      </div>

      <ErrorBanner
        error={error instanceof Error ? error.message : mutationError}
      />

      <DataTable<Process>
        data={processes}
        columns={processColumnsWithActions}
        onEdit={handleOpenEdit}
        onDelete={handleDelete}
        isLoading={isLoading}
      />

      {expandedProcessId !== null && (
        <div
          style={{
            marginTop: '20px',
            padding: '20px',
            backgroundColor: '#f9fafb',
            borderRadius: '6px',
            border: '1px solid #e5e7eb',
          }}
        >
          <h3
            style={{
              fontSize: '15px',
              fontWeight: 600,
              color: '#374151',
              marginBottom: '12px',
            }}
          >
            Etapes du procede
          </h3>
          <DataTable<Step>
            data={steps}
            columns={stepColumns}
            isLoading={stepsLoading}
          />
        </div>
      )}

      <FormModal<ProcessFormData>
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingProcess(null);
        }}
        onSubmit={handleSubmit}
        title={editingProcess ? 'Modifier le procede' : 'Nouveau procede'}
        fields={processFields}
        defaultValues={
          editingProcess
            ? {
                name: editingProcess.name,
                description: editingProcess.description,
                modelId: editingProcess.modelId,
              }
            : undefined
        }
        isLoading={isMutating}
      />
    </div>
  );
};

export default ProcessesPage;
