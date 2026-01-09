import React from 'react';
import { Recipe } from '../types';
import { Clock, Users, ChefHat } from 'lucide-react';

interface RecipeCardProps {
  recipe: Recipe;
}

const RecipeCard: React.FC<RecipeCardProps> = ({ recipe }) => {
  return (
    <div className="bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-200 rounded-xl p-5 shadow-sm">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <ChefHat size={20} className="text-orange-600" />
          <h3 className="font-bold text-lg text-gray-800">{recipe.name}</h3>
        </div>
      </div>
      
      {(recipe.prepTime || recipe.servings) && (
        <div className="flex gap-4 mb-4 text-sm text-gray-600">
          {recipe.prepTime && (
            <div className="flex items-center gap-1">
              <Clock size={14} />
              <span>{recipe.prepTime}</span>
            </div>
          )}
          {recipe.servings && (
            <div className="flex items-center gap-1">
              <Users size={14} />
              <span>{recipe.servings} porzioni</span>
            </div>
          )}
        </div>
      )}

      <div className="mb-4">
        <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Ingredienti</h4>
        <ul className="space-y-1">
          {recipe.ingredients.map((ingredient, idx) => (
            <li key={idx} className="text-sm text-gray-700 flex items-start gap-2">
              <span className="text-orange-500 mt-1">•</span>
              <span>{ingredient}</span>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Procedimento</h4>
        <ol className="space-y-2">
          {recipe.instructions.map((step, idx) => (
            <li key={idx} className="text-sm text-gray-700 flex gap-2">
              <span className="font-bold text-orange-600 min-w-[20px]">{idx + 1}.</span>
              <span>{step}</span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
};

export default RecipeCard;





