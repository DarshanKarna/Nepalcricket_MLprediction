import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Format } from '@/types/cricket';
import DataOverview from '@/components/DataOverview';
import MLPredictions from '@/components/MLPredictions';
import OppositionAnalysis from '@/components/OppositionAnalysis';
import BestPlayingXI from '@/components/BestPlayingXI';
import PlayerComparison from '@/components/PlayerComparison';
import { Trophy } from 'lucide-react';

const Dashboard = () => {
  const [selectedFormat, setSelectedFormat] = useState<Format>('Both');

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="gradient-cricket text-white py-8 px-4 shadow-lg">
        <div className="container mx-auto">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <Trophy className="h-10 w-10" />
              <div>
                <h1 className="text-3xl md:text-4xl font-bold">Nepal Cricket Analytics</h1>
                <p className="text-white/90 mt-1">Powered by AI & Machine Learning</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <label className="text-white font-medium">Format:</label>
              <Select value={selectedFormat} onValueChange={(value) => setSelectedFormat(value as Format)}>
                <SelectTrigger className="w-[140px] bg-white/20 border-white/30 text-white backdrop-blur-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="T20I">T20I</SelectItem>
                  <SelectItem value="ODI">ODI</SelectItem>
                  <SelectItem value="Both">Both Formats</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5 mb-8">
            <TabsTrigger value="overview">Data Overview</TabsTrigger>
            <TabsTrigger value="predictions">ML Predictions</TabsTrigger>
            <TabsTrigger value="opposition">Opposition Analysis</TabsTrigger>
            <TabsTrigger value="playingxi">Best Playing XI</TabsTrigger>
            <TabsTrigger value="comparison">Player Comparison</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <DataOverview format={selectedFormat} />
          </TabsContent>

          <TabsContent value="predictions">
            <MLPredictions format={selectedFormat} />
          </TabsContent>

          <TabsContent value="opposition">
            <OppositionAnalysis format={selectedFormat} />
          </TabsContent>

          <TabsContent value="playingxi">
            <BestPlayingXI format={selectedFormat} />
          </TabsContent>

          <TabsContent value="comparison">
            <PlayerComparison format={selectedFormat} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;
