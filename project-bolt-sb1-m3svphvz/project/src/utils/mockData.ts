// Mock data for ingredient analysis

interface Ingredient {
  name: string;
  safe: boolean;
  concerns: string | null;
}

interface ScanResult {
  totalIngredients: number;
  flaggedCount: number;
  ingredients: Ingredient[];
  summary: string;
  tags: string[];
}

export const mockScan = (ingredientText: string): ScanResult => {
  // Parse ingredients from text
  const ingredientsList = ingredientText
    .split(',')
    .map(item => item.trim())
    .filter(item => item.length > 0);
  
  // Mock database of problematic ingredients
  const problematicIngredients: Record<string, string> = {
    'palm oil': 'High in saturated fats, linked to heart disease and environmental concerns',
    'high fructose corn syrup': 'May contribute to obesity and metabolic disorders',
    'msg': 'May cause headaches in sensitive individuals',
    'artificial color': 'May cause hyperactivity in children',
    'sodium nitrite': 'Linked to increased cancer risk in some studies',
    'bht': 'Potential endocrine disruptor',
    'hydrogenated oil': 'Contains trans fats linked to heart disease',
    'aspartame': 'May cause headaches in sensitive individuals',
    'sodium benzoate': 'May cause allergic reactions in some people',
    'carrageenan': 'May cause digestive issues',
    'e211': 'May trigger allergies in aspirin-sensitive individuals',
    'e102': 'May cause hyperactivity in children',
    'e471': 'Contains trans fats linked to heart disease',
    'partially hydrogenated': 'Contains trans fats linked to heart disease',
  };
  
  // Process ingredients
  const analyzedIngredients: Ingredient[] = ingredientsList.map(ingredient => {
    const lowerCaseIngredient = ingredient.toLowerCase();
    
    // Check if this ingredient is in our problematic list
    let isFlagged = false;
    let concernText = null;
    
    for (const [key, concern] of Object.entries(problematicIngredients)) {
      if (lowerCaseIngredient.includes(key)) {
        isFlagged = true;
        concernText = concern;
        break;
      }
    }
    
    return {
      name: ingredient,
      safe: !isFlagged,
      concerns: concernText,
    };
  });
  
  // Count flagged ingredients
  const flaggedIngredients = analyzedIngredients.filter(i => !i.safe);
  
  // Generate tags based on ingredients
  const tags: string[] = [];
  if (analyzedIngredients.some(i => i.name.toLowerCase().includes('sugar') || 
      i.name.toLowerCase().includes('fructose'))) {
    tags.push('High Sugar');
  }
  
  if (analyzedIngredients.some(i => i.name.toLowerCase().includes('oil') || 
      i.name.toLowerCase().includes('fat'))) {
    tags.push('Contains Oils/Fats');
  }
  
  if (analyzedIngredients.some(i => i.name.toLowerCase().includes('artificial') || 
      i.name.toLowerCase().includes('color') || 
      i.name.toLowerCase().includes('flavour'))) {
    tags.push('Artificial Additives');
  }
  
  if (analyzedIngredients.some(i => i.name.toLowerCase().includes('preservative') || 
      i.name.toLowerCase().includes('benzoate') || 
      i.name.toLowerCase().includes('nitrite'))) {
    tags.push('Contains Preservatives');
  }
  
  // Generate summary
  let summary = '';
  if (flaggedIngredients.length === 0) {
    summary = 'This product appears to be generally safe based on the ingredients provided. No major concerning ingredients were detected.';
  } else if (flaggedIngredients.length <= 2) {
    summary = `This product contains a few ingredients of potential concern. Consider your personal health needs when deciding whether to consume.`;
  } else {
    summary = `This product contains several ingredients that may be concerning for your health. Review the detailed analysis and consider alternatives if these ingredients are problematic for you.`;
  }
  
  return {
    totalIngredients: ingredientsList.length,
    flaggedCount: flaggedIngredients.length,
    ingredients: analyzedIngredients,
    summary,
    tags: tags.length > 0 ? tags : ['No specific concerns'],
  };
};