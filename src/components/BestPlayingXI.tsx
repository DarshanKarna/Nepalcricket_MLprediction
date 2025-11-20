import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Format, Player } from '@/types/cricket';
import { loadBatsmen, loadBowlers } from '@/utils/csvParser';
import { Users, Star, Shield } from 'lucide-react';

interface BestPlayingXIProps {
  format: Format;
}

const BestPlayingXI = ({ format }: BestPlayingXIProps) => {
  const [batsmen, setBatsmen] = useState<Player[]>([]);
  const [bowlers, setBowlers] = useState<Player[]>([]);
  const [selectedXI, setSelectedXI] = useState<Player[]>([]);
  const [manualFormat, setManualFormat] = useState<'T20I' | 'ODI'>('T20I');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [batsmenData, bowlersData] = await Promise.all([
          loadBatsmen('Both'),
          loadBowlers('Both'),
        ]);
        setBatsmen(batsmenData);
        setBowlers(bowlersData);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const generateAutoXI = (selectedFormat: 'T20I' | 'ODI') => {
    // Calculate player scores
    const scorePlayers = (players: Player[], isBatsman: boolean) => {
      return players.map(p => {
        let score = 0;
        if (isBatsman) {
          const runs = selectedFormat === 'T20I' ? (p['T20I Runs'] || 0) : (p['ODI Runs'] || 0);
          score = runs * 0.4 + p.Average * 5 + p['Strike Rate'] * 2;
          if (p['100s']) score += p['100s'] * 50;
          if (p['50s']) score += p['50s'] * 20;
        } else {
          const wickets = selectedFormat === 'T20I' ? (p['T20I Wickets'] || 0) : (p['ODI Wickets'] || 0);
          score = wickets * 10 + (p.Average ? (50 - p.Average) * 2 : 0);
          if (p.Economy) score += (10 - p.Economy) * 5;
          if (p['4W']) score += p['4W'] * 30;
          if (p['5W']) score += p['5W'] * 50;
        }
        return { ...p, score };
      });
    };

    const scoredBatsmen = scorePlayers(batsmen, true).sort((a, b) => b.score - a.score);
    const scoredBowlers = scorePlayers(bowlers, false).sort((a, b) => b.score - a.score);

    // Find all-rounders (players who both bat and bowl)
    const allRounders = scoredBatsmen.filter(b => {
      const bowlerVersion = scoredBowlers.find(bw => bw.Player === b.Player);
      return bowlerVersion && bowlerVersion.score > 100;
    }).slice(0, 2);

    // Select keeper (assuming Aasif Sheikh is keeper)
    const keeper = scoredBatsmen.find(b => b.Player.includes('Aasif Sheikh')) || scoredBatsmen[0];

    // Build XI
    const xi: Player[] = [];
    
    // Add keeper
    xi.push(keeper);

    // Add top batsmen (excluding keeper and all-rounders)
    const pureBatsmen = scoredBatsmen
      .filter(b => b.Player !== keeper.Player && !allRounders.find(ar => ar.Player === b.Player))
      .slice(0, 4);
    xi.push(...pureBatsmen);

    // Add all-rounders
    xi.push(...allRounders);

    // Add bowlers (excluding those already selected)
    const pureBowlers = scoredBowlers
      .filter(b => !xi.find(p => p.Player === b.Player))
      .slice(0, 4);
    xi.push(...pureBowlers);

    setSelectedXI(xi);
  };

  const calculateTeamRating = (team: Player[]) => {
    if (team.length === 0) return 0;
    const totalScore = team.reduce((sum, p) => sum + ((p as any).score || 0), 0);
    return Math.min(100, (totalScore / team.length / 10)).toFixed(1);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-muted-foreground">Loading data...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="auto">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="auto">Auto Suggested XI</TabsTrigger>
          <TabsTrigger value="manual">Manual XI Builder</TabsTrigger>
        </TabsList>

        <TabsContent value="auto" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5 text-primary" />
                AI-Generated Best Playing XI
              </CardTitle>
              <CardDescription>
                Algorithm-based selection using batting average, strike rate, wickets, economy, and recent form
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4">
                <Select value={manualFormat} onValueChange={(v) => setManualFormat(v as 'T20I' | 'ODI')}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="T20I">T20I Format</SelectItem>
                    <SelectItem value="ODI">ODI Format</SelectItem>
                  </SelectContent>
                </Select>
                <Button onClick={() => generateAutoXI(manualFormat)}>
                  <Users className="h-4 w-4 mr-2" />
                  Generate Best XI
                </Button>
              </div>

              {selectedXI.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-primary/10 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Shield className="h-5 w-5 text-primary" />
                      <span className="font-semibold">Team Rating</span>
                    </div>
                    <div className="text-2xl font-bold text-primary">
                      {calculateTeamRating(selectedXI)}/10
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {selectedXI.map((player, idx) => {
                      const isBowler = bowlers.find(b => b.Player === player.Player);
                      const isBatsman = batsmen.find(b => b.Player === player.Player);
                      const isAllRounder = isBowler && isBatsman;
                      const isKeeper = player.Player.includes('Aasif Sheikh');

                      return (
                        <Card key={idx} className="overflow-hidden">
                          <CardHeader className="pb-3">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <CardTitle className="text-base">{player.Player}</CardTitle>
                                <CardDescription className="text-xs">
                                  {player.Matches} matches
                                </CardDescription>
                              </div>
                              <Badge variant={isKeeper ? "default" : isAllRounder ? "secondary" : "outline"}>
                                {isKeeper ? 'WK' : isAllRounder ? 'AR' : isBowler ? 'Bowler' : 'Batsman'}
                              </Badge>
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-2">
                            {isBatsman && player.Runs && (
                              <div className="text-sm">
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Runs:</span>
                                  <span className="font-semibold">{player.Runs}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Avg:</span>
                                  <span className="font-semibold">{player.Average.toFixed(1)}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">SR:</span>
                                  <span className="font-semibold">{player['Strike Rate'].toFixed(1)}</span>
                                </div>
                              </div>
                            )}
                            {isBowler && player.Wickets && (
                              <div className="text-sm">
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Wickets:</span>
                                  <span className="font-semibold">{player.Wickets}</span>
                                </div>
                                {player.Economy && (
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">Econ:</span>
                                    <span className="font-semibold">{player.Economy.toFixed(2)}</span>
                                  </div>
                                )}
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="manual">
          <Card>
            <CardHeader>
              <CardTitle>Manual XI Builder</CardTitle>
              <CardDescription>
                Select your own playing XI and see the team rating
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center text-muted-foreground py-12">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Manual selection feature - Select 11 players from dropdowns</p>
                <p className="text-sm mt-2">Coming soon with individual player selectors</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BestPlayingXI;
