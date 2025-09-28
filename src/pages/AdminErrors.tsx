import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useFeedErrorSummary } from "@/hooks/useFeedErrors";
import { format } from "date-fns";
import { AlertTriangle, ExternalLink, Clock, AlertCircle } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export default function AdminErrors() {
  const { data: errorSummary, isLoading, error } = useFeedErrorSummary();
  const [expandedSources, setExpandedSources] = useState<Set<string>>(new Set());

  const toggleExpanded = (sourceId: string) => {
    const newExpanded = new Set(expandedSources);
    if (newExpanded.has(sourceId)) {
      newExpanded.delete(sourceId);
    } else {
      newExpanded.add(sourceId);
    }
    setExpandedSources(newExpanded);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center gap-2 mb-6">
          <AlertTriangle className="h-6 w-6 text-orange-500" />
          <h1 className="text-2xl font-bold">RSS Feed Error Monitor</h1>
        </div>
        <div className="text-center py-8">Loading error reports...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center gap-2 mb-6">
          <AlertTriangle className="h-6 w-6 text-orange-500" />
          <h1 className="text-2xl font-bold">RSS Feed Error Monitor</h1>
        </div>
        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="text-red-600">Error Loading Data</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{error.message}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const totalErrors = errorSummary?.reduce((sum, source) => sum + source.total_errors, 0) || 0;
  const failingSources = errorSummary?.length || 0;

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center gap-2 mb-6">
        <AlertTriangle className="h-6 w-6 text-orange-500" />
        <h1 className="text-2xl font-bold">RSS Feed Error Monitor</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Errors</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{totalErrors}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Failing Sources</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{failingSources}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Last Updated</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {format(new Date(), 'PPp')}
            </div>
          </CardContent>
        </Card>
      </div>

      {!errorSummary || errorSummary.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <div className="text-green-600 mb-2">
              <AlertCircle className="h-8 w-8 mx-auto mb-2" />
              No RSS feed errors found!
            </div>
            <p className="text-muted-foreground">All feeds are processing successfully.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {errorSummary.map((source) => (
            <Card key={source.source_id} className="border-red-200">
              <Collapsible>
                <CollapsibleTrigger asChild>
                  <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <AlertTriangle className="h-5 w-5 text-red-500" />
                          {source.source_name}
                          <Badge variant="destructive" className="ml-2">
                            {source.total_errors} errors
                          </Badge>
                        </CardTitle>
                        <CardDescription className="mt-2">
                          <div className="flex items-center gap-2 text-sm">
                            <ExternalLink className="h-4 w-4" />
                            <span className="font-mono text-xs bg-muted px-2 py-1 rounded">
                              {source.rss_feed_url}
                            </span>
                          </div>
                          <div className="mt-2 text-red-600">
                            Latest: {source.latest_error}
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {format(new Date(source.latest_timestamp), 'PPp')}
                          </div>
                        </CardDescription>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => toggleExpanded(source.source_id)}
                      >
                        {expandedSources.has(source.source_id) ? 'Hide' : 'Show'} Details
                      </Button>
                    </div>
                  </CardHeader>
                </CollapsibleTrigger>
                
                <CollapsibleContent>
                  <CardContent className="pt-0">
                    <div className="space-y-3">
                      <h4 className="font-medium text-sm">Recent Errors:</h4>
                      {source.recent_errors.slice(0, 5).map((error) => (
                        <div key={error.id} className="border-l-2 border-red-200 pl-4 py-2">
                          <div className="text-sm font-medium text-red-700">
                            {error.error_message}
                          </div>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                            <span>{format(new Date(error.timestamp), 'PPp')}</span>
                            {error.http_status && (
                              <Badge variant="outline" className="text-xs">
                                HTTP {error.http_status}
                              </Badge>
                            )}
                            {error.run_id && (
                              <span className="font-mono">Run: {error.run_id.slice(0, 8)}</span>
                            )}
                          </div>
                        </div>
                      ))}
                      {source.recent_errors.length > 5 && (
                        <div className="text-xs text-muted-foreground">
                          ... and {source.recent_errors.length - 5} more errors
                        </div>
                      )}
                    </div>
                  </CardContent>
                </CollapsibleContent>
              </Collapsible>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}