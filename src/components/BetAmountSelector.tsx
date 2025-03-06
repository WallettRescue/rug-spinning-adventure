
import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Coins, AlertCircle, Info } from 'lucide-react';
import { motion } from 'framer-motion';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger 
} from '@/components/ui/tooltip';

interface BetAmountSelectorProps {
  defaultValue: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  contractMinBet?: number;
  contractMaxBet?: number;
  contractState?: 'loading' | 'ready' | 'paused' | 'error';
}

const BetAmountSelector = ({
  defaultValue = 1, // Changed default to 1 SOL
  onChange,
  min = 0.01,
  max = 10,
  step = 0.01,
  disabled = false,
  contractMinBet,
  contractMaxBet,
  contractState = 'ready'
}: BetAmountSelectorProps) => {
  // Use contract limits if provided, otherwise use props
  const effectiveMin = contractMinBet !== undefined ? contractMinBet : min;
  const effectiveMax = contractMaxBet !== undefined ? contractMaxBet : max;
  
  // Initialize with default value, but ensure it's within effective bounds
  const initialValue = Math.min(Math.max(defaultValue, effectiveMin), effectiveMax);
  const [betAmount, setBetAmount] = useState(initialValue);
  
  // Sync bet amount when contract limits change
  useEffect(() => {
    if (contractMinBet !== undefined || contractMaxBet !== undefined) {
      setBetAmount(prevAmount => {
        const newAmount = Math.min(Math.max(prevAmount, effectiveMin), effectiveMax);
        // Only trigger onChange if the value actually changed
        if (newAmount !== prevAmount) {
          onChange(newAmount);
        }
        return newAmount;
      });
    }
  }, [contractMinBet, contractMaxBet, effectiveMin, effectiveMax, onChange]);
  
  const handleSliderChange = (newValue: number[]) => {
    const value = newValue[0];
    setBetAmount(value);
    onChange(value);
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = parseFloat(e.target.value);
    
    if (isNaN(value)) {
      value = effectiveMin;
    } else {
      value = Math.min(Math.max(value, effectiveMin), effectiveMax);
    }
    
    setBetAmount(value);
    onChange(value);
  };

  // Predefined quick selection amounts - updated for more sensible values
  const quickAmounts = [0.1, 1, 2, 5, 10];
  
  // Get contract status display info
  const getContractStatusInfo = () => {
    switch (contractState) {
      case 'loading':
        return { color: 'bg-yellow-500/20 text-yellow-400', text: 'Connecting to contract...' };
      case 'paused':
        return { color: 'bg-orange-500/20 text-orange-400', text: 'Contract paused' };
      case 'error':
        return { color: 'bg-red-500/20 text-red-400', text: 'Contract error' };
      case 'ready':
      default:
        return { color: 'bg-green-500/20 text-green-400', text: 'Contract ready' };
    }
  };
  
  const contractStatus = getContractStatusInfo();
  
  return (
    <div className="space-y-3 w-full">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <span className="text-sm text-muted-foreground">Bet Amount</span>
          
          {/* Contract status indicator */}
          {contractState && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className={`ml-2 px-2 py-0.5 text-xs rounded-full ${contractStatus.color} flex items-center`}>
                    {contractState === 'ready' ? (
                      <div className="h-1.5 w-1.5 rounded-full bg-green-500 mr-1.5 animate-pulse"></div>
                    ) : (
                      <AlertCircle className="h-3 w-3 mr-1" />
                    )}
                    Live
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{contractStatus.text}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
        
        <div className="flex items-center bg-background/20 px-2 py-1 rounded border border-white/10">
          <Coins className="h-3.5 w-3.5 mr-1.5 text-roulette-gold" />
          <span className="text-sm font-medium">{betAmount.toFixed(2)} SOL</span>
        </div>
      </div>
      
      <div className="px-1">
        <Slider
          defaultValue={[initialValue]}
          min={effectiveMin}
          max={effectiveMax}
          step={step}
          value={[betAmount]}
          onValueChange={handleSliderChange}
          className="my-5"
          disabled={disabled}
        />
      </div>
      
      <div className="flex space-x-1.5 justify-between">
        {quickAmounts.map((amount) => (
          <motion.button
            key={amount}
            onClick={() => {
              if (!disabled && amount >= effectiveMin && amount <= effectiveMax) {
                setBetAmount(amount);
                onChange(amount);
              }
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`relative flex-1 py-1 text-xs rounded border transition-colors duration-200 ${
              disabled 
                ? 'opacity-50 cursor-not-allowed bg-background/20 border-white/10 text-muted-foreground' 
                : amount < effectiveMin || amount > effectiveMax
                  ? 'opacity-50 cursor-not-allowed bg-background/20 border-white/10 text-muted-foreground'
                  : Math.abs(betAmount - amount) < 0.001 
                    ? 'bg-roulette-gold/20 border-roulette-gold text-white' 
                    : 'bg-background/20 border-white/10 text-muted-foreground hover:text-white hover:border-white/30'
            } font-medium`}
            disabled={disabled || amount < effectiveMin || amount > effectiveMax}
          >
            {amount} SOL
          </motion.button>
        ))}
      </div>
      
      <div className="flex items-center space-x-2">
        <Input
          type="number"
          value={betAmount}
          onChange={handleInputChange}
          min={effectiveMin}
          max={effectiveMax}
          step={step}
          disabled={disabled}
          className="flex-1 bg-background/20 border-white/10 font-medium text-center"
        />
        <div className="flex items-center">
          <span className="text-sm font-medium">SOL</span>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button className="ml-1.5 text-muted-foreground hover:text-white transition-colors">
                  <Info className="h-3.5 w-3.5" />
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Min bet: {effectiveMin} SOL</p>
                <p>Max bet: {effectiveMax} SOL</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
      
      {/* Bets from contract */}
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>Minimum: {effectiveMin} SOL</span>
        <span>Maximum: {effectiveMax} SOL</span>
      </div>
    </div>
  );
};

export default BetAmountSelector;
