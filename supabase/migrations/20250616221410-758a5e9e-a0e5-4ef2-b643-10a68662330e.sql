
-- Drop the existing trigger and function to recreate them properly
DROP TRIGGER IF EXISTS on_deposit_confirmed ON public.crypto_deposits;
DROP FUNCTION IF EXISTS public.credit_confirmed_deposit();

-- Create improved function to credit confirmed deposits
CREATE OR REPLACE FUNCTION public.credit_confirmed_deposit()
RETURNS TRIGGER AS $$
BEGIN
  -- Only credit if status changed to 'confirmed' and not already credited
  IF NEW.status = 'confirmed' AND (OLD.status IS NULL OR OLD.status != 'confirmed') THEN
    -- Update user balance
    UPDATE public.user_balances 
    SET balance = balance + NEW.amount,
        updated_at = NOW()
    WHERE user_id = NEW.user_id;
    
    -- Update deposit status to credited immediately
    NEW.status = 'credited';
    NEW.credited_at = NOW();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger that fires BEFORE UPDATE to modify the row being updated
CREATE TRIGGER on_deposit_confirmed
  BEFORE UPDATE ON public.crypto_deposits
  FOR EACH ROW 
  WHEN (NEW.status = 'confirmed' AND (OLD.status IS NULL OR OLD.status != 'confirmed'))
  EXECUTE FUNCTION public.credit_confirmed_deposit();
