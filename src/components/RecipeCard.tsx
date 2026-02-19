import { SavedRecipe } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, ChefHat } from 'lucide-react';

export default function RecipeCard({ recipe }: { recipe: SavedRecipe }) {
  return (
    <Card className="cursor-pointer transition-shadow hover:shadow-lg">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg">{recipe.title}</CardTitle>
          <Badge variant="secondary" className="text-xs">
            {recipe.source === 'ai' ? 'AI 추천' : '레시피'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-3 flex gap-3 text-sm text-gray-500">
          {recipe.content.time && (
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" /> {recipe.content.time}
            </span>
          )}
          {recipe.content.difficulty && (
            <span className="flex items-center gap-1">
              <ChefHat className="h-3.5 w-3.5" /> {recipe.content.difficulty}
            </span>
          )}
        </div>
        <div className="flex flex-wrap gap-1.5">
          {recipe.content.ingredients.map((ing, i) => (
            <span key={i} className="rounded-full bg-gray-100 px-2.5 py-1 text-xs text-gray-600">
              {ing.name}
            </span>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
