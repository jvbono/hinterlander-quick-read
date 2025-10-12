
import { ChevronDown, X } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import hinterlanderLogo from '../assets/hinterlander-logo.png';

interface HeaderProps {
  onRefresh: () => void;
  isRefreshing: boolean;
  activeFilter: string;
  onFilterChange: (filter: string) => void;
  selectedProvince: string | null;
  onProvinceChange: (province: string | null) => void;
}

const Header = ({ onRefresh, isRefreshing, activeFilter, onFilterChange, selectedProvince, onProvinceChange }: HeaderProps) => {
  const filters = ['All', 'National'];
  
  const regions = [
    'BC', 'Alberta', 'Prairies', 'Ontario', 'Quebec', 'Atlantic', 'North'
  ];

  return (
    <header className="border-b border-gray-200 bg-[#F7F4EC]/95 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Left: Logo */}
          <div className="flex-shrink-0">
            <img 
              src={hinterlanderLogo} 
              alt="The Hinterlander" 
              className="h-14 md:h-16 w-auto"
            />
          </div>
          
          {/* Center: Title and Subtitle */}
          <div className="flex-1 flex flex-col items-center text-center px-4">
            <h1 className="text-lg md:text-xl font-bold text-gray-900 font-headline tracking-wide">The Hinterlander</h1>
            <p className="text-xs md:text-sm text-gray-600 font-medium font-body">One page, fewer solitudes.</p>
            {selectedProvince && (
              <p className="text-xs text-blue-600 mt-1 font-medium font-body">Showing stories from {selectedProvince}</p>
            )}
          </div>
          
          {/* Right: Three-Stack Navigation Controls */}
          <div className="flex flex-col items-end gap-1 flex-shrink-0">
            {/* Top stack: Refresh + Timestamp */}
            <div className="flex items-center gap-3">
              <button
                onClick={onRefresh}
                disabled={isRefreshing}
                className="text-xs text-gray-500 hover:text-gray-700 transition-colors disabled:opacity-50 font-body"
              >
                {isRefreshing ? 'Refreshing...' : 'Refresh'}
              </button>
              <div className="text-xs text-gray-500 font-body">
                {new Date().toLocaleTimeString('en-CA', { 
                  hour: '2-digit', 
                  minute: '2-digit',
                  hour12: true
                })}
              </div>
            </div>
            
            {/* Middle stack: Language Toggle */}
            <div className="flex items-center gap-1">
              <button className="text-xs text-gray-600 hover:text-gray-900 transition-colors font-medium font-body px-1">
                EN
              </button>
              <span className="text-xs text-gray-400">|</span>
              <button className="text-xs text-gray-600 hover:text-gray-900 transition-colors font-medium font-body px-1">
                FR
              </button>
              <span className="text-xs text-gray-400">|</span>
              <button className="text-xs text-gray-600 hover:text-gray-900 transition-colors font-medium font-body px-1">
                All
              </button>
            </div>
            
            {/* Bottom stack: Regional Filters */}
            <div className="flex items-center gap-2">
              {filters.map((filter) => (
                <button
                  key={filter}
                  onClick={() => onFilterChange(filter)}
                  className={`text-xs transition-colors font-medium font-body ${
                    activeFilter === filter
                      ? 'text-gray-900'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {filter}
                </button>
              ))}
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className={`text-xs transition-colors flex items-center gap-1 font-medium font-body ${
                    selectedProvince 
                      ? 'text-gray-900' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}>
                    <span className="hidden sm:inline">By Region</span>
                    <span className="sm:hidden">Region</span>
                    <ChevronDown className="h-3 w-3" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent 
                  align="end" 
                  className="w-48 p-2"
                >
                  {regions.map((region) => (
                    <DropdownMenuItem
                      key={region}
                      onClick={() => onProvinceChange(region)}
                      className={`text-xs cursor-pointer ${
                        selectedProvince === region ? 'bg-accent font-medium' : ''
                      }`}
                    >
                      {region}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
              
              {/* Clear Region Filter */}
              {selectedProvince && (
                <button
                  onClick={() => onProvinceChange(null)}
                  className="text-xs text-gray-600 hover:text-gray-900 transition-colors flex items-center gap-1 font-medium font-body"
                >
                  <X className="h-3 w-3" />
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
