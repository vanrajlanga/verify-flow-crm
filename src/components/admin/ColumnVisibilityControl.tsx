
import React from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, Eye, EyeOff } from 'lucide-react';

interface ColumnVisibilityControlProps {
  availableColumns: { key: string; label: string }[];
  visibleColumns: string[];
  onColumnToggle: (columnKey: string) => void;
  onShowAll: () => void;
  onHideAll: () => void;
}

const ColumnVisibilityControl: React.FC<ColumnVisibilityControlProps> = ({
  availableColumns,
  visibleColumns,
  onColumnToggle,
  onShowAll,
  onHideAll
}) => {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <Eye className="h-4 w-4" />
          Column Visibility ({visibleColumns.length}/{availableColumns.length})
          <ChevronDown className="h-4 w-4" />
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <Card className="mt-2">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">Show/Hide Columns</CardTitle>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={onShowAll}>
                  <Eye className="h-3 w-3 mr-1" />
                  Show All
                </Button>
                <Button variant="ghost" size="sm" onClick={onHideAll}>
                  <EyeOff className="h-3 w-3 mr-1" />
                  Hide All
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 max-h-60 overflow-y-auto">
              {availableColumns.map((column) => (
                <div key={column.key} className="flex items-center space-x-2">
                  <Checkbox
                    id={`column-${column.key}`}
                    checked={visibleColumns.includes(column.key)}
                    onCheckedChange={() => onColumnToggle(column.key)}
                  />
                  <label 
                    htmlFor={`column-${column.key}`} 
                    className="text-sm cursor-pointer truncate"
                    title={column.label}
                  >
                    {column.label}
                  </label>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </CollapsibleContent>
    </Collapsible>
  );
};

export default ColumnVisibilityControl;
