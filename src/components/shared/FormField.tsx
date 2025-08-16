import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';

interface BaseFieldProps {
  label: string;
  id: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  description?: string;
}

interface InputFieldProps extends BaseFieldProps {
  type: 'text' | 'email' | 'password' | 'tel' | 'url';
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

interface TextareaFieldProps extends BaseFieldProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
}

interface SelectFieldProps extends BaseFieldProps {
  value: string;
  onValueChange: (value: string) => void;
  options: { value: string; label: string; description?: string }[];
  placeholder?: string;
}

interface SwitchFieldProps extends BaseFieldProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}

export const FormField: React.FC<InputFieldProps | TextareaFieldProps | SelectFieldProps | SwitchFieldProps> = (props) => {
  const { label, id, required, disabled, className, description } = props;

  const renderField = () => {
    if ('type' in props) {
      const inputProps = props as InputFieldProps;
      return (
        <Input
          id={id}
          type={inputProps.type}
          value={inputProps.value}
          onChange={(e) => inputProps.onChange(e.target.value)}
          placeholder={inputProps.placeholder}
          disabled={disabled}
          className={className}
        />
      );
    }

    if ('rows' in props) {
      const textareaProps = props as TextareaFieldProps;
      return (
        <Textarea
          id={id}
          value={textareaProps.value}
          onChange={(e) => textareaProps.onChange(e.target.value)}
          placeholder={textareaProps.placeholder}
          rows={textareaProps.rows || 3}
          disabled={disabled}
          className={className}
        />
      );
    }

    if ('options' in props) {
      const selectProps = props as SelectFieldProps;
      return (
        <Select
          value={selectProps.value}
          onValueChange={selectProps.onValueChange}
          disabled={disabled}
        >
          <SelectTrigger className={className}>
            <SelectValue placeholder={selectProps.placeholder} />
          </SelectTrigger>
          <SelectContent position="popper" side="bottom" align="start">
            {selectProps.options.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                <div className="flex flex-col">
                  <span className="font-medium">{option.label}</span>
                  {option.description && (
                    <span className="text-xs text-muted-foreground">
                      {option.description}
                    </span>
                  )}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    }

    if ('checked' in props) {
      const switchProps = props as SwitchFieldProps;
      return (
        <Switch
          id={id}
          checked={switchProps.checked}
          onCheckedChange={switchProps.onCheckedChange}
          disabled={disabled}
        />
      );
    }

    return null;
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label htmlFor={id} className="text-sm font-medium">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </Label>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
      </div>
      {renderField()}
    </div>
  );
};

// Specialized field components for common use cases
export const InputField: React.FC<InputFieldProps> = (props) => (
  <FormField {...props} />
);

export const TextareaField: React.FC<TextareaFieldProps> = (props) => (
  <FormField {...props} />
);

export const SelectField: React.FC<SelectFieldProps> = (props) => (
  <FormField {...props} />
);

export const SwitchField: React.FC<SwitchFieldProps> = (props) => (
  <FormField {...props} />
);
