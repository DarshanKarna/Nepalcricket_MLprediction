import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Format, Player } from '@/types/cricket';
import { loadBatsmen, loadBowlers } from '@/utils/csvParser';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { Badge } from '@/components/ui/badge';
import { GitCompare } from 'lucide-react';

interface PlayerComparisonProps {
  format: Format;
}

const PlayerComparison = ({ format }: PlayerComparisonProps) => {
  const [allPlayers, setAllPlayers] = useState<Player[]>([]);
  const [selectedPlayers, setSelectedPlayers] = useState<string[]>(['', '']);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [batsmenData, bowlersData] = await Promise.all([
          loadBatsmen('Both'),
          loadBowlers('Both'),
        ]);
        
        // Merge players, prioritizing batsmen for duplicates
        const playerMap = new Map<string, Player>();
        batsmenData.forEach(p => playerMap.set(p.Player, p));
        bowlersData.forEach(p => {
          if (!playerMap.has(p.Player)) {
            playerMap.set(p.Player, p);
          }
        });
        
        setAllPlayers(Array.from(playerMap.values()));
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-muted-foreground">Loading data...</div>
      </div>
    );
  }

  const getPlayerData = (playerName: string) => {
    return allPlayers.find(p => p.Player === playerName);
  };

  const compareData = selectedPlayers.map(name => getPlayerData(name)).filter(Boolean) as Player[];

  const prepareRadarData = () => {
    if (compareData.length === 0) return [];

    const metrics = ['Batting Avg', 'Strike Rate', 'Runs', 'Wickets', 'Economy'];
    
    return metrics.map(metric => {
      const data: any = { metric };
      compareData.forEach(player => {
        let value = 0;
        switch(metric) {
          case 'Batting Avg':
            value = Math.min(100, player.Average * 2);
            break;
          case 'Strike Rate':
            value = Math.min(100, player['Strike Rate'] * 0.5);
            break;
          case 'Runs':
            value = Math.min(100, (player.Runs || 0) / 50);
            break;
          case 'Wickets':
            value = Math.min(100, (player.Wickets || 0) * 0.5);
            break;
          case 'Economy':
            value = player.Economy ? Math.min(100, (10 - player.Economy) * 10) : 0;
            break;
        }
        data[player.Player] = value;
      });
      return data;
    });
  };

  const prepareBarData = () => {
    return compareData.map(player => ({
      name: player.Player.split(' ').pop(),
      runs: player.Runs || 0,
      wickets: (player.Wickets || 0) * 10,
      matches: player.Matches,
    }));
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GitCompare className="h-5 w-5 text-primary" />
            Player Comparison Tool
          </CardTitle>
          <CardDescription>
            Compare up to 3 players across T20I and ODI formats
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[0, 1, 2].map((idx) => (
              <div key={idx} className="space-y-2">
                <label className="text-sm font-medium">Player {idx + 1}</label>
                <Select
                  value={selectedPlayers[idx] || ''}
                  onValueChange={(value) => {
                    const newSelected = [...selectedPlayers];
                    newSelected[idx] = value;
                    setSelectedPlayers(newSelected);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={`Select player ${idx + 1}`} />
                  </SelectTrigger>
                  <SelectContent>
                    {allPlayers.map((player) => (
                      <SelectItem key={player.Player} value={player.Player}>
                        {player.Player}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {compareData.length >= 2 && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Performance Radar</CardTitle>
                <CardDescription>Multi-dimensional performance comparison</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <RadarChart data={prepareRadarData()}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="metric" />
                    <PolarRadiusAxis angle={90} domain={[0, 100]} />
                    {compareData.map((player, idx) => (
                      <Radar
                        key={player.Player}
                        name={player.Player}
                        dataKey={player.Player}
                        stroke={`hsl(var(--chart-${idx + 1}))`}
                        fill={`hsl(var(--chart-${idx + 1}))`}
                        fillOpacity={0.3}
                      />
                    ))}
                    <Legend />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Statistical Comparison</CardTitle>
                <CardDescription>Runs, wickets, and matches played</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={prepareBarData()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="runs" fill="hsl(var(--chart-1))" name="Runs" />
                    <Bar dataKey="wickets" fill="hsl(var(--chart-2))" name="Wickets (x10)" />
                    <Bar dataKey="matches" fill="hsl(var(--chart-3))" name="Matches" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {compareData.map((player, idx) => (
              <Card key={idx}>
                <CardHeader>
                  <CardTitle className="text-lg">{player.Player}</CardTitle>
                  <CardDescription>Complete Statistics</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex gap-2">
                    <Badge variant="outline">
                      T20I: {player['T20I Matches']} matches
                    </Badge>
                    <Badge variant="outline">
                      ODI: {player['ODI Matches']} matches
                    </Badge>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between border-b pb-1">
                      <span className="text-muted-foreground">Total Runs:</span>
                      <span className="font-semibold">{player.Runs || 0}</span>
                    </div>
                    <div className="flex justify-between border-b pb-1">
                      <span className="text-muted-foreground">Batting Avg:</span>
                      <span className="font-semibold">{player.Average?.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between border-b pb-1">
                      <span className="text-muted-foreground">Strike Rate:</span>
                      <span className="font-semibold">{player['Strike Rate']?.toFixed(2)}</span>
                    </div>
                    {player.Wickets && (
                      <>
                        <div className="flex justify-between border-b pb-1">
                          <span className="text-muted-foreground">Wickets:</span>
                          <span className="font-semibold">{player.Wickets}</span>
                        </div>
                        {player.Economy && (
                          <div className="flex justify-between border-b pb-1">
                            <span className="text-muted-foreground">Economy:</span>
                            <span className="font-semibold">{player.Economy.toFixed(2)}</span>
                          </div>
                        )}
                      </>
                    )}
                    {player['100s'] !== undefined && (
                      <div className="flex justify-between border-b pb-1">
                        <span className="text-muted-foreground">100s/50s:</span>
                        <span className="font-semibold">{player['100s']}/{player['50s']}</span>
                      </div>
                    )}
                    {player['Highest Score'] && (
                      <div className="flex justify-between border-b pb-1">
                        <span className="text-muted-foreground">Highest:</span>
                        <span className="font-semibold">{player['Highest Score']}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default PlayerComparison;
