-- 식단 플래너 테이블
CREATE TABLE IF NOT EXISTS public.meal_plans (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid REFERENCES public.profiles ON DELETE CASCADE NOT NULL,
  date date NOT NULL,
  meal_type text NOT NULL CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack')),
  title text NOT NULL,
  ingredients jsonb DEFAULT '[]',
  memo text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, date, meal_type)
);

CREATE INDEX idx_meal_plans_user_date ON public.meal_plans(user_id, date);

ALTER TABLE public.meal_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own meal plans"
  ON public.meal_plans FOR ALL USING (auth.uid() = user_id);
