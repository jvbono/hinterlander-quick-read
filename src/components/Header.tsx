
import { ChevronDown, X } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface HeaderProps {
  onRefresh: () => void;
  isRefreshing: boolean;
  activeFilter: string;
  onFilterChange: (filter: string) => void;
  selectedProvince: string | null;
  onProvinceChange: (province: string | null) => void;
}

const Header = ({ onRefresh, isRefreshing, activeFilter, onFilterChange, selectedProvince, onProvinceChange }: HeaderProps) => {
  const filters = ['All', 'National', 'Provincial', 'Rural'];
  
  const provinces = [
    'Alberta', 'British Columbia', 'Manitoba', 'New Brunswick', 
    'Newfoundland and Labrador', 'Northwest Territories', 'Nova Scotia', 
    'Nunavut', 'Ontario', 'Prince Edward Island', 'Quebec', 'Saskatchewan', 'Yukon'
  ];

  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-foreground">The Hinterlander</h1>
            <p className="text-xs text-muted-foreground">One Page, fewer solitudes.</p>
            {selectedProvince && (
              <p className="text-xs text-primary mt-1">Showing stories from {selectedProvince}</p>
            )}
          </div>
          
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              {filters.map((filter) => (
                <button
                  key={filter}
                  onClick={() => onFilterChange(filter)}
                  className={`text-xs transition-colors ${
                    activeFilter === filter
                      ? 'text-foreground font-medium'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {filter}
                </button>
              ))}
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className={`text-xs transition-colors flex items-center gap-1 ${
                    selectedProvince 
                      ? 'text-foreground font-medium' 
                      : 'text-muted-foreground hover:text-foreground'
                  }`}>
                    By Province
                    <ChevronDown className="h-3 w-3" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent 
                  align="end" 
                  className="w-80 grid grid-cols-2 gap-0 p-2 max-h-80 overflow-y-auto"
                >
                  {provinces.map((province) => (
                    <DropdownMenuItem
                      key={province}
                      onClick={() => onProvinceChange(province)}
                      className={`text-xs cursor-pointer ${
                        selectedProvince === province ? 'bg-accent font-medium' : ''
                      }`}
                    >
                      {province}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            
            {selectedProvince && (
              <button
                onClick={() => onProvinceChange(null)}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
              >
                <X className="h-3 w-3" />
                Clear Filter
              </button>
            )}
            
            <button
              onClick={onRefresh}
              disabled={isRefreshing}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
            >
              {isRefreshing ? 'Refreshing...' : 'Refresh'}
            </button>
            
            <div className="text-xs text-muted-foreground">
              Updated {new Date().toLocaleTimeString('en-CA', { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
