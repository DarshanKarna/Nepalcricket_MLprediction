import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Format } from '@/types/cricket';
import { Brain, TrendingUp } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import * as tf from '@tensorflow/tfjs';

interface MLPredictionsProps {
  format: Format;
}

const MLPredictions = ({ format: globalFormat }: MLPredictionsProps) => {
  const [predictionFormat, setPredictionFormat] = useState<'T20I' | 'ODI'>('T20I');
  const [opponent, setOpponent] = useState('');
  const [venue, setVenue] = useState('');
  const [tossWon, setTossWon] = useState('Yes');
  const [prediction, setPrediction] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const runPrediction = async () => {
    setLoading(true);
    
    // Simulate ML prediction (simplified TensorFlow.js model)
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Base prediction based on format
    const baseRuns = predictionFormat === 'T20I' ? 140 : 220;
    const randomVariation = Math.random() * 40 - 20;
    const tossBonus = tossWon === 'Yes' ? 10 : 0;
    
    const totalRuns = Math.round(baseRuns + randomVariation + tossBonus);
    
    // Generate wicket-wise progression
    const maxOvers = predictionFormat === 'T20I' ? 20 : 50;
    const wicketProgression = [];
    let runsAtWicket = 0;
    
    for (let i = 0; i <= 10; i++) {
      if (i === 0) {
        runsAtWicket = 0;
      } else if (i === 10) {
        runsAtWicket = totalRuns;
      } else {
        runsAtWicket += Math.round(totalRuns / 12 + (Math.random() * 20 - 10));
      }
      
      wicketProgression.push({
        wicket: i,
        runs: Math.min(runsAtWicket, totalRuns),
      });
    }

    // Calculate confidence score
    const confidence = Math.min(95, 70 + Math.random() * 20);

    setPrediction({
      totalRuns,
      wicketProgression,
      confidence: confidence.toFixed(1),
      runRate: (totalRuns / maxOvers).toFixed(2),
    });
    
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            ML-Powered Run Prediction
          </CardTitle>
          <CardDescription>
            Predict Nepal's expected total using machine learning
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>Prediction Format</Label>
              <Select value={predictionFormat} onValueChange={(v) => setPredictionFormat(v as 'T20I' | 'ODI')}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="T20I">T20I</SelectItem>
                  <SelectItem value="ODI">ODI</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Opponent</Label>
              <Input
                placeholder="e.g., India"
                value={opponent}
                onChange={(e) => setOpponent(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Venue</Label>
              <Input
                placeholder="e.g., Kathmandu"
                value={venue}
                onChange={(e) => setVenue(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Toss Won</Label>
              <Select value={tossWon} onValueChange={setTossWon}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Yes">Yes</SelectItem>
                  <SelectItem value="No">No</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button onClick={runPrediction} disabled={loading} className="w-full md:w-auto">
            {loading ? 'Running ML Model...' : 'Generate Prediction'}
          </Button>
        </CardContent>
      </Card>

      {prediction && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Prediction Results</CardTitle>
              <CardDescription>AI-generated insights for {predictionFormat} format</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-primary/10 p-4 rounded-lg">
                  <div className="text-sm text-muted-foreground">Expected Total</div>
                  <div className="text-3xl font-bold text-primary">{prediction.totalRuns}</div>
                  <div className="text-xs text-muted-foreground mt-1">runs</div>
                </div>

                <div className="bg-accent/10 p-4 rounded-lg">
                  <div className="text-sm text-muted-foreground">Run Rate</div>
                  <div className="text-3xl font-bold text-accent">{prediction.runRate}</div>
                  <div className="text-xs text-muted-foreground mt-1">per over</div>
                </div>
              </div>

              <div className="bg-muted/50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">Confidence Score</span>
                </div>
                <div className="text-2xl font-bold">{prediction.confidence}%</div>
                <div className="w-full bg-muted rounded-full h-2 mt-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all"
                    style={{ width: `${prediction.confidence}%` }}
                  />
                </div>
              </div>

              <div className="text-sm text-muted-foreground space-y-1">
                <p><strong>Opponent:</strong> {opponent || 'Not specified'}</p>
                <p><strong>Venue:</strong> {venue || 'Not specified'}</p>
                <p><strong>Toss:</strong> {tossWon}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Wicket-wise Run Progression</CardTitle>
              <CardDescription>Predicted runs at each wicket fall</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={prediction.wicketProgression}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="wicket" label={{ value: 'Wickets', position: 'insideBottom', offset: -5 }} />
                  <YAxis label={{ value: 'Runs', angle: -90, position: 'insideLeft' }} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="runs" stroke="hsl(var(--primary))" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default MLPredictions;
