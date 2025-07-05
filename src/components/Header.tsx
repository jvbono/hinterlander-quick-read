
const Header = () => {
  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Hinterlander</h1>
            <p className="text-sm text-muted-foreground">Canadian news, clearly organized</p>
          </div>
          <div className="text-xs text-muted-foreground">
            Updated {new Date().toLocaleTimeString('en-CA', { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
