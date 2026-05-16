import { useEffect } from 'react';
import { useForm, type FieldValues, type Path, type DefaultValues, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

export interface FieldConfig<T> {
  name: keyof T;
  label: string;
  type?: string;
  required?: boolean;
}

interface Props<T extends FieldValues> {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: T) => void;
  title: string;
  fields: FieldConfig<T>[];
  defaultValues?: Partial<T>;
  isLoading?: boolean;
}

function FormModal<T extends FieldValues>({
  isOpen,
  onClose,
  onSubmit,
  title,
  fields,
  defaultValues,
  isLoading = false,
}: Props<T>) {
  // Build a dynamic Zod schema based on fields
  const schemaShape: Record<string, z.ZodTypeAny> = {};
  for (const field of fields) {
    if (field.type === 'number') {
      schemaShape[String(field.name)] = field.required
        ? z.coerce.number({ required_error: `${field.label} est requis` })
        : z.coerce.number().optional();
    } else {
      schemaShape[String(field.name)] = field.required
        ? z.string().min(1, `${field.label} est requis`)
        : z.string().optional();
    }
  }
  const schema = z.object(schemaShape);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<T>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(schema) as any,
    defaultValues: defaultValues as DefaultValues<T>,
  });

  useEffect(() => {
    if (isOpen) {
      reset(defaultValues as DefaultValues<T>);
    }
  }, [isOpen, defaultValues, reset]);

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          backgroundColor: '#fff',
          borderRadius: '8px',
          padding: '24px',
          width: '100%',
          maxWidth: '480px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '20px',
          }}
        >
          <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#111' }}>{title}</h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '20px',
              cursor: 'pointer',
              color: '#6b7280',
              lineHeight: 1,
            }}
          >
            x
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit as SubmitHandler<T>)}>
          {fields.map((field) => {
            const fieldName = String(field.name) as Path<T>;
            const error = errors[String(field.name)];
            return (
              <div key={String(field.name)} style={{ marginBottom: '16px' }}>
                <label
                  htmlFor={String(field.name)}
                  style={{
                    display: 'block',
                    marginBottom: '6px',
                    fontSize: '14px',
                    fontWeight: 500,
                    color: '#374151',
                  }}
                >
                  {field.label}
                  {field.required && (
                    <span style={{ color: '#ef4444', marginLeft: '2px' }}>*</span>
                  )}
                </label>
                <input
                  id={String(field.name)}
                  type={field.type ?? 'text'}
                  {...register(fieldName)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: error ? '1px solid #ef4444' : '1px solid #d1d5db',
                    borderRadius: '4px',
                    fontSize: '14px',
                    outline: 'none',
                    color: '#111',
                  }}
                />
                {error && (
                  <p style={{ marginTop: '4px', fontSize: '12px', color: '#ef4444' }}>
                    {String(error.message)}
                  </p>
                )}
              </div>
            );
          })}

          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '12px',
              marginTop: '24px',
            }}
          >
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '8px 20px',
                border: '1px solid #d1d5db',
                borderRadius: '4px',
                backgroundColor: '#fff',
                cursor: 'pointer',
                fontSize: '14px',
                color: '#374151',
              }}
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isLoading}
              style={{
                padding: '8px 20px',
                border: 'none',
                borderRadius: '4px',
                backgroundColor: isLoading ? '#93c5fd' : '#3b82f6',
                color: '#fff',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                fontSize: '14px',
                fontWeight: 500,
              }}
            >
              {isLoading ? 'Enregistrement...' : 'Enregistrer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default FormModal;
