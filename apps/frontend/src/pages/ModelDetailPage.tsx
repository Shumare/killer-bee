import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { modelsService } from '../services/models.service';
import { ingredientsService } from '../services/ingredients.service';
import ErrorBanner from '../components/ErrorBanner';
import DataTable, { type Column } from '../components/DataTable';
import type { Composition, Process, Property } from '../types';

type ActiveTab = 'compositions' | 'processes' | 'properties';

const ModelDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const modelId = Number(id);
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<ActiveTab>('compositions');
  const [error, setError] = useState<string | null>(null);

  const { data: model, isLoading: modelLoading } = useQuery({
    queryKey: ['models', modelId],
    queryFn: () => modelsService.getById(modelId),
    enabled: !isNaN(modelId),
  });

  const { data: compositions = [], isLoading: compLoading } = useQuery({
    queryKey: ['models', modelId, 'compositions'],
    queryFn: () => modelsService.getCompositions(modelId),
    enabled: !isNaN(modelId),
  });

  const { data: processes = [], isLoading: procLoading } = useQuery({
    queryKey: ['models', modelId, 'processes'],
    queryFn: () => modelsService.getProcesses(modelId),
    enabled: !isNaN(modelId),
  });

  const { data: properties = [], isLoading: propLoading } = useQuery({
    queryKey: ['models', modelId, 'properties'],
    queryFn: () => modelsService.getProperties(modelId),
    enabled: !isNaN(modelId),
  });

  const { data: allIngredients = [] } = useQuery({
    queryKey: ['ingredients'],
    queryFn: ingredientsService.getAll,
  });

  const deleteCompositionMutation = useMutation({
    mutationFn: (compositionId: number) =>
      modelsService.deleteComposition(modelId, compositionId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['models', modelId, 'compositions'] });
    },
    onError: (err) => {
      setError(err instanceof Error ? err.message : 'Erreur lors de la suppression');
    },
  });

  const deletePropertyMutation = useMutation({
    mutationFn: (propertyId: number) =>
      modelsService.deleteProperty(modelId, propertyId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['models', modelId, 'properties'] });
    },
    onError: (err) => {
      setError(err instanceof Error ? err.message : 'Erreur lors de la suppression');
    },
  });

  const compositionColumns: Column<Composition>[] = [
    {
      key: 'ingredientId',
      label: 'Ingredient',
      render: (_value, row) => {
        const ingredient = allIngredients.find((i) => i.id === row.ingredientId);
        return ingredient?.name ?? `ID: ${row.ingredientId}`;
      },
    },
    {
      key: 'grammage',
      label: 'Grammage (g)',
      render: (value) => `${String(value)} g`,
    },
  ];

  const processColumns: Column<Process>[] = [
    { key: 'name', label: 'Nom' },
    { key: 'description', label: 'Description' },
  ];

  const propertyColumns: Column<Property>[] = [
    { key: 'encryptedKey', label: 'Cle (chiffree)' },
    { key: 'encryptedValue', label: 'Valeur (chiffree)' },
  ];

  const tabStyle = (tab: ActiveTab): React.CSSProperties => ({
    padding: '8px 20px',
    border: 'none',
    borderBottom: activeTab === tab ? '2px solid #3b82f6' : '2px solid transparent',
    backgroundColor: 'transparent',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: activeTab === tab ? 600 : 400,
    color: activeTab === tab ? '#3b82f6' : '#6b7280',
    transition: 'color 0.15s',
  });

  if (modelLoading) {
    return <div style={{ padding: '24px', color: '#6b7280' }}>Chargement...</div>;
  }

  if (!model) {
    return (
      <div>
        <ErrorBanner error="Modele introuvable" />
        <Link to="/models" style={{ color: '#3b82f6' }}>
          Retour aux modeles
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <Link
          to="/models"
          style={{ color: '#6b7280', textDecoration: 'none', fontSize: '13px' }}
        >
          ← Retour aux modeles
        </Link>
        <h1
          style={{
            fontSize: '22px',
            fontWeight: 700,
            color: '#1e3a5f',
            marginTop: '8px',
          }}
        >
          {model.name}
        </h1>
        <div
          style={{
            display: 'flex',
            gap: '24px',
            marginTop: '8px',
            fontSize: '14px',
            color: '#6b7280',
          }}
        >
          <span>
            <strong>Gamme:</strong> {model.gamme}
          </span>
          <span>
            <strong>Grammage PU HT:</strong> {model.grammagePUHT} g
          </span>
          <span>
            <strong>Description:</strong> {model.description}
          </span>
        </div>
      </div>

      <ErrorBanner error={error} />

      {/* Tabs */}
      <div
        style={{
          display: 'flex',
          borderBottom: '1px solid #e5e7eb',
          marginBottom: '20px',
        }}
      >
        <button style={tabStyle('compositions')} onClick={() => setActiveTab('compositions')}>
          Ingredients ({compositions.length})
        </button>
        <button style={tabStyle('processes')} onClick={() => setActiveTab('processes')}>
          Procedes ({processes.length})
        </button>
        <button style={tabStyle('properties')} onClick={() => setActiveTab('properties')}>
          Proprietes ({properties.length})
        </button>
      </div>

      {/* Tab content */}
      {activeTab === 'compositions' && (
        <DataTable<Composition>
          data={compositions}
          columns={compositionColumns}
          onDelete={(row) => {
            if (window.confirm('Supprimer cet ingredient de la composition ?')) {
              deleteCompositionMutation.mutate(row.id);
            }
          }}
          isLoading={compLoading}
        />
      )}

      {activeTab === 'processes' && (
        <DataTable<Process>
          data={processes}
          columns={processColumns}
          isLoading={procLoading}
        />
      )}

      {activeTab === 'properties' && (
        <div>
          <div
            style={{
              backgroundColor: '#fef3c7',
              border: '1px solid #fcd34d',
              borderRadius: '4px',
              padding: '12px 16px',
              marginBottom: '16px',
              fontSize: '13px',
              color: '#92400e',
            }}
          >
            Les proprietes sont affichees sous forme chiffree pour des raisons de securite.
          </div>
          <DataTable<Property>
            data={properties}
            columns={propertyColumns}
            onDelete={(row) => {
              if (window.confirm('Supprimer cette propriete ?')) {
                deletePropertyMutation.mutate(row.id);
              }
            }}
            isLoading={propLoading}
          />
        </div>
      )}
    </div>
  );
};

export default ModelDetailPage;
