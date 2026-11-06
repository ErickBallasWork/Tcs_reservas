interface FieldProps {
  label: string;
  error?: string;
  children: React.ReactNode;
}

export function Field({ label, error, children }: FieldProps) {
  return (
    <label className="field-label">
      {label}
      {children}
      {error && (
        <span role="alert" className="text-xs font-semibold text-red-700">
          {error}
        </span>
      )}
    </label>
  );
}
