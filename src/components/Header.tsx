
interface HeaderProps {
  onRefresh: () => void;
  isRefreshing: boolean;
  activeFilter: string;
  onFilterChange: (filter: string) => void;
}

const Header = ({ onRefresh, isRefreshing, activeFilter, onFilterChange }: HeaderProps) => {
  const filters = ['All', 'National', 'Provincial', 'Rural'];

  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-foreground">The Hinterlander</h1>
            <p className="text-xs text-muted-foreground">One Page, fewer solitudes.</p>
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
            </div>
            
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
