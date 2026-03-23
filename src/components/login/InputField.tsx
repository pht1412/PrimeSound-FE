// src/components/login/InputField.tsx
type Props = {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

export default function InputField({ label, name, type = "text", placeholder, value, onChange }: Props) {
  return (
    <div className="w-full">
      <label className="spotify-input-label">{label}</label>
      <input
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="spotify-input-field"
      />
    </div>
  );
}