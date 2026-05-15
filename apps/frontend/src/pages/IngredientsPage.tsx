import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ingredientsService,
  type CreateIngredientDto,
} from '../services/ingredients.service';
import DataTable, { type Column } from '../components/DataTable';
import FormModal, { type FieldConfig } from '../components/FormModal';
import ErrorBanner from '../components/ErrorBanner';
import type { Ingredient } from '../types';

interface IngredientFormData {
  name: string;
  description: string;
}

const ingredientColumns: Column<Ingredient>[] = [
  { key: 'name', label: 'Nom' },
  { key: 'description', label: 'Description' },
];

const ingredientFields: FieldConfig<IngredientFormData>[] = [
  { name: 'name', label: 'Nom', required: true },
  { name: 'description', label: 'Description', required: true },
];

const IngredientsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingIngredient, setEditingIngredient] = useState<Ingredient | null>(null);
  const [mutationError, setMutationError] = useState<string | null>(null);

  const { data: ingredients = [], isLoading, error } = useQuery({
    queryKey: ['ingredients'],
    queryFn: ingredientsService.getAll,
  });

  const createMutation = useMutation({
    mutationFn: (dto: CreateIngredientDto) => ingredientsService.create(dto),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['ingredients'] });
      setIsModalOpen(false);
      setMutationError(null);
    },
    onError: (err) => {
      setMutationError(err instanceof Error ? err.message : 'Erreur lors de la creation');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, dto }: { id: number; dto: Partial<CreateIngredientDto> }) =>
      ingredientsService.update(id, dto),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['ingredients'] });
      setIsModalOpen(false);
      setEditingIngredient(null);
      setMutationError(null);
    },
    onError: (err) => {
      setMutationError(
        err instanceof Error ? err.message : 'Erreur lors de la mise a jour',
      );
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => ingredientsService.delete(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['ingredients'] });
    },
    onError: (err) => {
      setMutationError(
        err instanceof Error ? err.message : 'Erreur lors de la suppression',
      );
    },
  });

  const handleOpenCreate = () => {
    setEditingIngredient(null);
    setMutationError(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (ingredient: Ingredient) => {
    setEditingIngredient(ingredient);
    setMutationError(null);
    setIsModalOpen(true);
  };

  const handleDelete = (ingredient: Ingredient) => {
    if (window.confirm(`Supprimer l'ingredient "${ingredient.name}" ?`)) {
      deleteMutation.mutate(ingredient.id);
    }
  };

  const handleSubmit = (formData: IngredientFormData) => {
    const dto: CreateIngredientDto = {
      name: formData.name,
      description: formData.description,
    };

    if (editingIngredient) {
      updateMutation.mutate({ id: editingIngredient.id, dto });
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
        <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#1e3a5f' }}>
          Ingredients
        </h1>
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
          + Nouvel ingredient
        </button>
      </div>

      <ErrorBanner
        error={error instanceof Error ? error.message : mutationError}
      />

      <DataTable<Ingredient>
        data={ingredients}
        columns={ingredientColumns}
        onEdit={handleOpenEdit}
        onDelete={handleDelete}
        isLoading={isLoading}
      />

      <FormModal<IngredientFormData>
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingIngredient(null);
        }}
        onSubmit={handleSubmit}
        title={editingIngredient ? "Modifier l'ingredient" : 'Nouvel ingredient'}
        fields={ingredientFields}
        defaultValues={
          editingIngredient
            ? {
                name: editingIngredient.name,
                description: editingIngredient.description,
              }
            : undefined
        }
        isLoading={isMutating}
      />
    </div>
  );
};

export default IngredientsPage;
