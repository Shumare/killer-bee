import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { testsService, type CreateTestDto } from '../services/tests.service';
import DataTable, { type Column } from '../components/DataTable';
import FormModal, { type FieldConfig } from '../components/FormModal';
import ErrorBanner from '../components/ErrorBanner';
import type { Test } from '../types';

interface TestFormData {
  processId: number;
  description: string;
  criteria: string;
}

const testColumns: Column<Test>[] = [
  { key: 'processId', label: 'ID Procede' },
  { key: 'description', label: 'Description' },
  { key: 'criteria', label: 'Critere' },
];

const testFields: FieldConfig<TestFormData>[] = [
  { name: 'processId', label: 'ID Procede', type: 'number', required: true },
  { name: 'description', label: 'Description', required: true },
  { name: 'criteria', label: 'Critere de validation', required: true },
];

const TestsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTest, setEditingTest] = useState<Test | null>(null);
  const [mutationError, setMutationError] = useState<string | null>(null);

  const { data: tests = [], isLoading, error } = useQuery({
    queryKey: ['tests'],
    queryFn: testsService.getAll,
  });

  const createMutation = useMutation({
    mutationFn: (dto: CreateTestDto) => testsService.create(dto),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['tests'] });
      setIsModalOpen(false);
      setMutationError(null);
    },
    onError: (err) => {
      setMutationError(err instanceof Error ? err.message : 'Erreur lors de la creation');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, dto }: { id: number; dto: Partial<CreateTestDto> }) =>
      testsService.update(id, dto),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['tests'] });
      setIsModalOpen(false);
      setEditingTest(null);
      setMutationError(null);
    },
    onError: (err) => {
      setMutationError(
        err instanceof Error ? err.message : 'Erreur lors de la mise a jour',
      );
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => testsService.delete(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['tests'] });
    },
    onError: (err) => {
      setMutationError(
        err instanceof Error ? err.message : 'Erreur lors de la suppression',
      );
    },
  });

  const handleOpenCreate = () => {
    setEditingTest(null);
    setMutationError(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (test: Test) => {
    setEditingTest(test);
    setMutationError(null);
    setIsModalOpen(true);
  };

  const handleDelete = (test: Test) => {
    if (window.confirm(`Supprimer le test "${test.description}" ?`)) {
      deleteMutation.mutate(test.id);
    }
  };

  const handleSubmit = (formData: TestFormData) => {
    const dto: CreateTestDto = {
      processId: Number(formData.processId),
      description: formData.description,
      criteria: formData.criteria,
    };

    if (editingTest) {
      updateMutation.mutate({ id: editingTest.id, dto });
    } else {
      createMutation.mutate(dto);
    }
  };

  const isMutating = createMutation.isPending || updateMutation.isPending;

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
        <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#1e3a5f' }}>Tests</h1>
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
          + Nouveau test
        </button>
      </div>

      <ErrorBanner
        error={error instanceof Error ? error.message : mutationError}
      />

      <DataTable<Test>
        data={tests}
        columns={testColumns}
        onEdit={handleOpenEdit}
        onDelete={handleDelete}
        isLoading={isLoading}
      />

      <FormModal<TestFormData>
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingTest(null);
        }}
        onSubmit={handleSubmit}
        title={editingTest ? 'Modifier le test' : 'Nouveau test'}
        fields={testFields}
        defaultValues={
          editingTest
            ? {
                processId: editingTest.processId,
                description: editingTest.description,
                criteria: editingTest.criteria,
              }
            : undefined
        }
        isLoading={isMutating}
      />
    </div>
  );
};

export default TestsPage;
