
-- Create user profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (id)
);

-- Create crypto deposits table
CREATE TABLE public.crypto_deposits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  address TEXT NOT NULL,
  amount DECIMAL(20,8) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'BTC',
  tx_hash TEXT UNIQUE,
  confirmations INTEGER DEFAULT 0,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'credited')),
  block_height INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  confirmed_at TIMESTAMP WITH TIME ZONE,
  credited_at TIMESTAMP WITH TIME ZONE
);

-- Create user balances table
CREATE TABLE public.user_balances (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  balance DECIMAL(20,8) DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crypto_deposits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_balances ENABLE ROW LEVEL SECURITY;

-- RLS policies for profiles
CREATE POLICY "Users can view their own profile" 
  ON public.profiles FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
  ON public.profiles FOR UPDATE 
  USING (auth.uid() = id);

-- RLS policies for crypto_deposits
CREATE POLICY "Users can view their own deposits" 
  ON public.crypto_deposits FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own deposits" 
  ON public.crypto_deposits FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- RLS policies for user_balances
CREATE POLICY "Users can view their own balance" 
  ON public.user_balances FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own balance" 
  ON public.user_balances FOR UPDATE 
  USING (auth.uid() = user_id);

-- Function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (NEW.id, NEW.email);
  
  INSERT INTO public.user_balances (user_id, balance)
  VALUES (NEW.id, 0);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user registration
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update balance after confirmed deposit
CREATE OR REPLACE FUNCTION public.credit_confirmed_deposit()
RETURNS TRIGGER AS $$
BEGIN
  -- Only credit if status changed to 'confirmed' and not already credited
  IF NEW.status = 'confirmed' AND OLD.status != 'confirmed' THEN
    UPDATE public.user_balances 
    SET balance = balance + NEW.amount,
        updated_at = NOW()
    WHERE user_id = NEW.user_id;
    
    -- Update deposit status to credited
    UPDATE public.crypto_deposits 
    SET status = 'credited',
        credited_at = NOW()
    WHERE id = NEW.id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for crediting confirmed deposits
CREATE TRIGGER on_deposit_confirmed
  AFTER UPDATE ON public.crypto_deposits
  FOR EACH ROW EXECUTE FUNCTION public.credit_confirmed_deposit();
