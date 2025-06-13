
import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Check, X, Edit2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EditableCellProps {
  value: string | number;
  onSave: (newValue: string | number) => void;
  type?: 'text' | 'number' | 'select';
  options?: { value: string; label: string }[];
  placeholder?: string;
}

const EditableCell: React.FC<EditableCellProps> = ({
  value,
  onSave,
  type = 'text',
  options = [],
  placeholder
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value.toString());

  useEffect(() => {
    setEditValue(value.toString());
  }, [value]);

  const handleSave = () => {
    const newValue = type === 'number' ? parseFloat(editValue) || 0 : editValue;
    onSave(newValue);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditValue(value.toString());
    setIsEditing(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  if (!isEditing) {
    return (
      <div 
        className="group flex items-center gap-2 cursor-pointer hover:bg-muted/50 p-1 rounded"
        onClick={() => setIsEditing(true)}
      >
        <span className="flex-1">{value || placeholder || '-'}</span>
        <Edit2 className="h-3 w-3 opacity-0 group-hover:opacity-50 transition-opacity" />
      </div>
    );
  }

  if (type === 'select') {
    return (
      <div className="flex items-center gap-1">
        <Select value={editValue} onValueChange={setEditValue}>
          <SelectTrigger className="h-8 w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {options.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button variant="ghost" size="sm" onClick={handleSave}>
          <Check className="h-3 w-3" />
        </Button>
        <Button variant="ghost" size="sm" onClick={handleCancel}>
          <X className="h-3 w-3" />
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1">
      <Input
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onKeyDown={handleKeyPress}
        className="h-8"
        type={type}
        autoFocus
        onBlur={handleSave}
      />
      <Button variant="ghost" size="sm" onClick={handleSave}>
        <Check className="h-3 w-3" />
      </Button>
      <Button variant="ghost" size="sm" onClick={handleCancel}>
        <X className="h-3 w-3" />
      </Button>
    </div>
  );
};

export default EditableCell;
