import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { modelsService, type CreateModelDto } from '../services/models.service';
import DataTable, { type Column } from '../components/DataTable';
import FormModal, { type FieldConfig } from '../components/FormModal';
import ErrorBanner from '../components/ErrorBanner';
import type { Model } from '../types';

interface ModelFormData {
  name: string;
  description: string;
  grammagePUHT: number;
  gamme: string;
}

const modelColumns: Column<Model>[] = [
  { key: 'name', label: 'Nom' },
  { key: 'gamme', label: 'Gamme' },
  {
    key: 'grammagePUHT',
    label: 'Grammage PU HT',
    render: (value) => `${String(value)} g`,
  },
  {
    key: 'id',
    label: 'Detail',
    render: (_value, row) => (
      <Link
        to={`/models/${row.id}`}
        style={{ color: '#3b82f6', textDecoration: 'none', fontSize: '13px' }}
      >
        Voir le detail
      </Link>
    ),
  },
];

const modelFields: FieldConfig<ModelFormData>[] = [
  { name: 'name', label: 'Nom', required: true },
  { name: 'description', label: 'Description', required: true },
  { name: 'grammagePUHT', label: 'Grammage PU HT (g)', type: 'number', required: true },
  { name: 'gamme', label: 'Gamme', required: true },
];

const ModelsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingModel, setEditingModel] = useState<Model | null>(null);
  const [mutationError, setMutationError] = useState<string | null>(null);

  const { data: models = [], isLoading, error } = useQuery({
    queryKey: ['models'],
    queryFn: modelsService.getAll,
  });

  const createMutation = useMutation({
    mutationFn: (dto: CreateModelDto) => modelsService.create(dto),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['models'] });
      setIsModalOpen(false);
      setMutationError(null);
    },
    onError: (err) => {
      setMutationError(err instanceof Error ? err.message : 'Erreur lors de la creation');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, dto }: { id: number; dto: Partial<CreateModelDto> }) =>
      modelsService.update(id, dto),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['models'] });
      setIsModalOpen(false);
      setEditingModel(null);
      setMutationError(null);
    },
    onError: (err) => {
      setMutationError(
        err instanceof Error ? err.message : 'Erreur lors de la mise a jour',
      );
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => modelsService.delete(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['models'] });
    },
    onError: (err) => {
      setMutationError(
        err instanceof Error ? err.message : 'Erreur lors de la suppression',
      );
    },
  });

  const handleOpenCreate = () => {
    setEditingModel(null);
    setMutationError(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (model: Model) => {
    setEditingModel(model);
    setMutationError(null);
    setIsModalOpen(true);
  };

  const handleDelete = (model: Model) => {
    if (window.confirm(`Supprimer le modele "${model.name}" ?`)) {
      deleteMutation.mutate(model.id);
    }
  };

  const handleSubmit = (formData: ModelFormData) => {
    const dto: CreateModelDto = {
      name: formData.name,
      description: formData.description,
      grammagePUHT: Number(formData.grammagePUHT),
      gamme: formData.gamme,
    };

    if (editingModel) {
      updateMutation.mutate({ id: editingModel.id, dto });
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
        <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#1e3a5f' }}>Modeles</h1>
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
          + Nouveau modele
        </button>
      </div>

      <ErrorBanner
        error={
          error instanceof Error ? error.message : mutationError
        }
      />

      <DataTable<Model>
        data={models}
        columns={modelColumns}
        onEdit={handleOpenEdit}
        onDelete={handleDelete}
        isLoading={isLoading}
      />

      <FormModal<ModelFormData>
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingModel(null);
        }}
        onSubmit={handleSubmit}
        title={editingModel ? 'Modifier le modele' : 'Nouveau modele'}
        fields={modelFields}
        defaultValues={
          editingModel
            ? {
                name: editingModel.name,
                description: editingModel.description,
                grammagePUHT: editingModel.grammagePUHT,
                gamme: editingModel.gamme,
              }
            : undefined
        }
        isLoading={isMutating}
      />
    </div>
  );
};

export default ModelsPage;
