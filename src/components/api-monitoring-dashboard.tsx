'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Activity, 
  Database, 
  Clock, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle,
  RefreshCw,
  Trash2,
  BarChart3
} from 'lucide-react';
import { googleBooksService } from '@/lib/google-books-service';
import { googleBooksCache } from '@/lib/google-books-cache';

export function APIMonitoringDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const refreshStats = () => {
    setIsRefreshing(true);
    try {
      const currentStats = googleBooksService.getMonitoringStats();
      setStats(currentStats);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    refreshStats();
    // Auto-refresh every 30 seconds
    const interval = setInterval(refreshStats, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleClearCache = () => {
    googleBooksCache.clearCache();
    refreshStats();
  };

  const handleClearStats = () => {
    googleBooksService.clearCacheAndStats();
    refreshStats();
  };

  if (!stats) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-6">
          <RefreshCw className="h-6 w-6 animate-spin mr-2" />
          Loading monitoring data...
        </CardContent>
      </Card>
    );
  }

  const getStatusColor = (rate: string) => {
    const percentage = parseFloat(rate);
    if (percentage >= 80) return 'bg-green-500';
    if (percentage >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">API Monitoring Dashboard</h2>
          <p className="text-muted-foreground">
            Monitor Google Books API usage, cache performance, and system health
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={refreshStats}
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleClearCache}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Clear Cache
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={handleClearStats}
          >
            <BarChart3 className="h-4 w-4 mr-2" />
            Reset Stats
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalRequests}</div>
            <p className="text-xs text-muted-foreground">
              {stats.successfulRequests} successful
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.efficiency.successRate}</div>
            <Progress 
              value={parseFloat(stats.efficiency.successRate)} 
              className="mt-2"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cache Hit Rate</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.efficiency.cacheHitRate}</div>
            <Progress 
              value={parseFloat(stats.efficiency.cacheHitRate)} 
              className="mt-2"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Mock Data Usage</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.efficiency.mockDataRate}</div>
            <Progress 
              value={parseFloat(stats.efficiency.mockDataRate)} 
              className="mt-2"
            />
          </CardContent>
        </Card>
      </div>

      {/* Detailed Statistics */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="cache">Cache Stats</TabsTrigger>
          <TabsTrigger value="history">Request History</TabsTrigger>
          <TabsTrigger value="errors">Error Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Request Breakdown</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>API Requests</span>
                  <Badge variant="secondary">
                    {stats.totalRequests - stats.cacheHits - stats.mockDataUsed}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>Cache Hits</span>
                  <Badge variant="outline">{stats.cacheHits}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>Mock Data Used</span>
                  <Badge variant="destructive">{stats.mockDataUsed}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>Failed Requests</span>
                  <Badge variant="destructive">{stats.failedRequests}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>Quota Exceeded</span>
                  <Badge variant="destructive">{stats.quotaExceeded}</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>System Health</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>API Status</span>
                  <Badge variant={stats.failedRequests === 0 ? "default" : "destructive"}>
                    {stats.failedRequests === 0 ? "Healthy" : "Issues Detected"}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>Cache Status</span>
                  <Badge variant="default">Active</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>Last Request</span>
                  <span className="text-sm text-muted-foreground">
                    {stats.lastRequestTime ? new Date(stats.lastRequestTime).toLocaleTimeString() : 'Never'}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="cache" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Search Cache</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.cacheStats.search.total}</div>
                <p className="text-sm text-muted-foreground">
                  {stats.cacheStats.search.valid} valid entries
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Book Cache</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.cacheStats.books.total}</div>
                <p className="text-sm text-muted-foreground">
                  {stats.cacheStats.books.valid} valid entries
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Memory Usage</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.cacheStats.totalMemoryUsage}</div>
                <p className="text-sm text-muted-foreground">
                  Total cache entries
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Requests</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {stats.requestHistory.slice(-20).reverse().map((request: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-2 rounded border">
                    <div className="flex items-center gap-2">
                      <Badge variant={request.success ? "default" : "destructive"}>
                        {request.type}
                      </Badge>
                      <Badge variant="outline">{request.source}</Badge>
                      <span className="text-sm text-muted-foreground">
                        {new Date(request.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    {request.error && (
                      <span className="text-sm text-red-500">{request.error}</span>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="errors" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Error Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.quotaExceeded > 0 && (
                  <div className="p-4 border rounded-lg border-red-200 bg-red-50">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-red-500" />
                      <h3 className="font-semibold text-red-800">Quota Issues Detected</h3>
                    </div>
                    <p className="text-sm text-red-700 mt-2">
                      Your Google Books API quota has been exceeded {stats.quotaExceeded} times. 
                      Consider implementing request throttling or upgrading your quota.
                    </p>
                  </div>
                )}

                {stats.failedRequests > 0 && (
                  <div className="p-4 border rounded-lg border-yellow-200 bg-yellow-50">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-yellow-500" />
                      <h3 className="font-semibold text-yellow-800">API Failures</h3>
                    </div>
                    <p className="text-sm text-yellow-700 mt-2">
                      {stats.failedRequests} API requests have failed. The app is falling back to cached or mock data.
                    </p>
                  </div>
                )}

                {stats.mockDataUsed > 0 && (
                  <div className="p-4 border rounded-lg border-blue-200 bg-blue-50">
                    <div className="flex items-center gap-2">
                      <Database className="h-5 w-5 text-blue-500" />
                      <h3 className="font-semibold text-blue-800">Mock Data Usage</h3>
                    </div>
                    <p className="text-sm text-blue-700 mt-2">
                      Mock data has been used {stats.mockDataUsed} times. This typically happens during development or when the API is unavailable.
                    </p>
                  </div>
                )}

                {stats.failedRequests === 0 && stats.quotaExceeded === 0 && stats.mockDataUsed === 0 && (
                  <div className="p-4 border rounded-lg border-green-200 bg-green-50">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <h3 className="font-semibold text-green-800">All Systems Operational</h3>
                    </div>
                    <p className="text-sm text-green-700 mt-2">
                      No errors detected. API and caching system are working optimally.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
