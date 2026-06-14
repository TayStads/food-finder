import { useState, useEffect } from 'react';
import { Plus, X, ChevronDown, ChevronUp, ChefHat, EyeOff, Eye, Trash2 } from 'lucide-react';

const STAPLES = ['salt', 'pepper', 'oil', 'butter'];

const UNIT_WORDS = new Set([
  'cup', 'cups', 'tbsp', 'tablespoon', 'tablespoons', 'tsp', 'teaspoon', 'teaspoons',
  'g', 'gram', 'grams', 'kg', 'kilogram', 'kilograms', 'ml', 'milliliter', 'milliliters',
  'l', 'liter', 'liters', 'litre', 'litres', 'oz', 'ounce', 'ounces', 'lb', 'lbs',
  'pound', 'pounds', 'clove', 'cloves', 'slice', 'slices', 'can', 'cans', 'pinch',
  'pinches', 'bunch', 'bunches', 'head', 'heads', 'stick', 'sticks', 'piece', 'pieces',
  'sprig', 'sprigs', 'dash', 'handful', 'handfuls',
]);
const SKIP_WORDS = new Set(['a', 'an', 'of', 'the']);

// Strips leading quantities and units so "2 cups rice" or "3 cloves garlic"
// becomes "rice" / "garlic" - matching how the built-in recipes are written.
function cleanIngredient(raw) {
  let words = raw.trim().toLowerCase().split(/\s+/).filter(Boolean);
  while (words.length > 1) {
    let w = words[0];
    if (/^[\d.\/-]+$/.test(w)) {
      words.shift();
      continue;
    }
    const numMatch = w.match(/^[\d.\/]+(.+)$/);
    if (numMatch) w = numMatch[1];
    const singular = w.endsWith('s') ? w.slice(0, -1) : w;
    if (UNIT_WORDS.has(w) || UNIT_WORDS.has(singular) || SKIP_WORDS.has(w)) {
      words.shift();
      continue;
    }
    break;
  }
  return words.join(' ');
}

const RECIPES = [
  {
    id: 1, name: 'Veggie omelette', emoji: '🍳',
    ingredients: ['eggs', 'milk', 'onion', 'bell pepper', 'cheddar cheese', 'butter', 'salt', 'pepper'],
    steps: [
      'Whisk the eggs with the milk, salt and pepper.',
      'Sauté the onion and bell pepper in butter until soft.',
      'Pour in the eggs and cook over low heat until just set.',
      'Sprinkle cheese over half, fold, and serve.'
    ]
  },
  {
    id: 2, name: 'Garlic butter pasta', emoji: '🍝',
    ingredients: ['pasta', 'butter', 'garlic', 'parmesan', 'parsley', 'salt'],
    steps: [
      'Boil the pasta in salted water until al dente.',
      'Melt the butter and gently sauté the garlic.',
      'Toss the drained pasta through the garlic butter.',
      'Finish with parmesan and chopped parsley.'
    ]
  },
  {
    id: 3, name: 'Chicken stir fry', emoji: '🥢',
    ingredients: ['chicken breast', 'soy sauce', 'garlic', 'ginger', 'bell pepper', 'rice', 'oil'],
    steps: [
      'Cook the rice and set aside.',
      'Slice the chicken and stir-fry in oil until browned.',
      'Add garlic, ginger and bell pepper, cook 2-3 minutes.',
      'Stir in soy sauce and serve over the rice.'
    ]
  },
  {
    id: 4, name: 'Tomato rice', emoji: '🍚',
    ingredients: ['rice', 'tomato', 'onion', 'garlic', 'oil', 'salt'],
    steps: [
      'Sauté the onion and garlic in oil until fragrant.',
      'Add the chopped tomato and cook until it breaks down.',
      'Stir in the cooked rice and salt.',
      'Simmer for 5 minutes, stirring occasionally.'
    ]
  },
  {
    id: 5, name: 'Tuna sandwich', emoji: '🥪',
    ingredients: ['bread', 'tuna', 'mayonnaise', 'lettuce', 'pepper'],
    steps: [
      'Mix the tuna with mayonnaise and pepper.',
      'Layer lettuce and the tuna mix between bread slices.',
      'Slice and serve.'
    ]
  },
  {
    id: 6, name: 'Bean quesadilla', emoji: '🌮',
    ingredients: ['tortilla', 'beans', 'cheddar cheese', 'salsa'],
    steps: [
      'Spread beans and cheese over a tortilla, fold in half.',
      'Toast in a dry pan until golden and the cheese melts.',
      'Cut into wedges and serve with salsa.'
    ]
  },
  {
    id: 7, name: 'Banana pancakes', emoji: '🥞',
    ingredients: ['flour', 'banana', 'eggs', 'milk', 'sugar', 'butter'],
    steps: [
      'Mash the banana and whisk with eggs, milk and sugar.',
      'Stir in the flour until just combined.',
      'Cook spoonfuls in a buttered pan until golden on both sides.'
    ]
  },
  {
    id: 8, name: 'Lentil soup', emoji: '🍲',
    ingredients: ['lentils', 'onion', 'carrot', 'garlic', 'vegetable stock', 'salt'],
    steps: [
      'Sauté the onion, carrot and garlic until softened.',
      'Add the lentils and vegetable stock.',
      'Simmer until the lentils are tender, then season with salt.'
    ]
  },
  {
    id: 9, name: 'Grilled cheese', emoji: '🧀',
    ingredients: ['bread', 'cheddar cheese', 'butter'],
    steps: [
      'Butter the outside of two bread slices.',
      'Place cheese between the slices.',
      'Grill in a pan until golden and the cheese melts.'
    ]
  },
  {
    id: 10, name: 'Chicken caesar salad', emoji: '🥗',
    ingredients: ['chicken breast', 'lettuce', 'parmesan', 'croutons', 'caesar dressing', 'oil'],
    steps: [
      'Season the chicken and pan-fry in oil until cooked through.',
      'Slice the chicken.',
      'Toss lettuce with caesar dressing.',
      'Top with chicken, parmesan and croutons.'
    ]
  },
  {
    id: 11, name: 'Vegetable curry', emoji: '🍛',
    ingredients: ['potato', 'carrot', 'onion', 'garlic', 'coconut milk', 'curry powder', 'rice', 'oil'],
    steps: [
      'Cook the rice and set aside.',
      'Sauté the onion and garlic in oil, then add curry powder.',
      'Add potato and carrot, then pour in the coconut milk.',
      'Simmer until the vegetables are tender, and serve over rice.'
    ]
  },
  {
    id: 12, name: 'Egg fried rice', emoji: '🍳',
    ingredients: ['rice', 'eggs', 'soy sauce', 'onion', 'peas', 'oil'],
    steps: [
      'Scramble the eggs in a little oil and set aside.',
      'Sauté the onion and peas.',
      'Add the cooked rice and soy sauce, stir-frying until hot.',
      'Mix the egg back in and serve.'
    ]
  },
  {
    id: 13, name: 'Pasta aglio e olio', emoji: '🧄',
    ingredients: ['pasta', 'garlic', 'oil', 'chili flakes', 'parsley', 'salt'],
    steps: [
      'Boil the pasta in salted water until al dente.',
      'Gently fry the garlic and chili flakes in oil until fragrant.',
      'Toss the drained pasta through the garlic oil.',
      'Finish with chopped parsley.'
    ]
  },
  {
    id: 14, name: 'Cheese quesadilla', emoji: '🌯',
    ingredients: ['tortilla', 'cheddar cheese'],
    steps: [
      'Sprinkle cheese over a tortilla and fold in half.',
      'Toast in a dry pan until the cheese melts and the tortilla is crisp.'
    ]
  },
  {
    id: 15, name: 'Avocado toast', emoji: '🥑',
    ingredients: ['bread', 'avocado', 'lemon', 'salt', 'pepper'],
    steps: [
      'Toast the bread.',
      'Mash the avocado with a squeeze of lemon, salt and pepper.',
      'Spread over the toast and serve.'
    ]
  },
];

export default function RecipeFinder() {
  const [ingredients, setIngredients] = useState([]);
  const [input, setInput] = useState('');
  const [hasStaples, setHasStaples] = useState(true);
  const [expanded, setExpanded] = useState(null);
  const [excluded, setExcluded] = useState([]);
  const [view, setView] = useState('finder');
  const [customRecipes, setCustomRecipes] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmoji, setNewEmoji] = useState('🍽️');
  const [newIngredients, setNewIngredients] = useState('');
  const [newSteps, setNewSteps] = useState('');

  useEffect(() => {
    try {
      const saved = localStorage.getItem('custom-recipes');
      if (saved) {
        setCustomRecipes(JSON.parse(saved));
      }
    } catch {
      // no saved recipes yet, or storage unavailable
    }
  }, []);

  const addIngredient = (raw) => {
    const name = raw.trim().toLowerCase();
    if (!name || ingredients.includes(name)) {
      setInput('');
      return;
    }
    setIngredients([...ingredients, name]);
    setInput('');
  };

  const removeIngredient = (name) => setIngredients(ingredients.filter(i => i !== name));

  const toggleExclude = (id) => {
    setExcluded(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
    setExpanded(prev => (prev === id ? null : prev));
  };

  const saveRecipe = () => {
    const name = newName.trim();
    const ings = newIngredients.split(',').map(cleanIngredient).filter(Boolean);
    const steps = newSteps.split('\n').map(s => s.trim()).filter(Boolean);
    if (!name || ings.length === 0 || steps.length === 0) return;

    const recipe = {
      id: `custom-${Date.now()}`,
      name,
      emoji: newEmoji.trim() || '🍽️',
      ingredients: ings,
      steps,
      custom: true,
    };

    const updated = [...customRecipes, recipe];
    setCustomRecipes(updated);
    try {
      localStorage.setItem('custom-recipes', JSON.stringify(updated));
    } catch {
      // saving failed, but the recipe still works for this session
    }

    setNewName('');
    setNewEmoji('🍽️');
    setNewIngredients('');
    setNewSteps('');
    setShowAddForm(false);
  };

  const deleteRecipe = (id) => {
    const updated = customRecipes.filter(r => r.id !== id);
    setCustomRecipes(updated);
    setExpanded(prev => (prev === id ? null : prev));
    try {
      localStorage.setItem('custom-recipes', JSON.stringify(updated));
    } catch {
      // saving failed, but the recipe is still removed for this session
    }
  };

  const isAvailable = (ing) => ingredients.includes(ing) || (hasStaples && STAPLES.includes(ing));

  const allRecipes = [...RECIPES, ...customRecipes];

  const scored = allRecipes
    .map(r => {
      const have = r.ingredients.filter(isAvailable);
      const missing = r.ingredients.filter(i => !isAvailable(i));
      return { ...r, haveCount: have.length, total: r.ingredients.length, missing };
    })
    .sort((a, b) => {
      const pctA = a.haveCount / a.total;
      const pctB = b.haveCount / b.total;
      if (pctB !== pctA) return pctB - pctA;
      return a.missing.length - b.missing.length;
    });

  const visible = scored.filter(r => !excluded.includes(r.id));
  const hidden = allRecipes.filter(r => excluded.includes(r.id));

  const ingredientCounts = {};
  allRecipes.forEach(r => {
    r.ingredients.forEach(ing => {
      if (!STAPLES.includes(ing)) {
        ingredientCounts[ing] = (ingredientCounts[ing] || 0) + 1;
      }
    });
  });

  const allIngredients = Object.keys(ingredientCounts).sort((a, b) => {
    const diff = ingredientCounts[b] - ingredientCounts[a];
    return diff !== 0 ? diff : a.localeCompare(b);
  });

  const suggestions = allIngredients.filter(s => !ingredients.includes(s)).slice(0, 14);

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white min-h-screen">
      <div className="text-center mb-6">
        <div className="text-xs font-semibold tracking-widest text-yellow-600 uppercase mb-2">Food Finder</div>
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-yellow-400 text-stone-800 mb-3">
          <ChefHat size={24} />
        </div>
        <h1 className="text-3xl font-serif font-bold text-stone-800">What's for Dinner?</h1>
        <p className="text-stone-500 mt-1">Add what's in your kitchen and find out what you can cook.</p>
      </div>

      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setView('finder')}
          className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium ${view === 'finder' ? 'bg-yellow-400 text-stone-800' : 'border border-stone-300 text-stone-500 hover:border-yellow-400 hover:text-yellow-600'}`}
        >
          Find a meal
        </button>
        <button
          onClick={() => setView('mine')}
          className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium ${view === 'mine' ? 'bg-yellow-400 text-stone-800' : 'border border-stone-300 text-stone-500 hover:border-yellow-400 hover:text-yellow-600'}`}
        >
          My recipes{customRecipes.length > 0 ? ` (${customRecipes.length})` : ''}
        </button>
      </div>

      {view === 'finder' && (
      <>
      <div className="flex gap-2 mb-3">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && addIngredient(input)}
          placeholder="e.g. chicken breast"
          className="flex-1 px-4 py-2 rounded-lg border border-stone-300 bg-white focus:outline-none focus:ring-2 focus:ring-yellow-400 text-stone-800"
        />
        <button
          onClick={() => addIngredient(input)}
          className="px-4 py-2 rounded-lg bg-yellow-400 text-stone-800 flex items-center gap-1 hover:bg-yellow-500"
        >
          <Plus size={18} /> Add
        </button>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {suggestions.map(s => (
          <button
            key={s}
            onClick={() => addIngredient(s)}
            className="text-sm px-3 py-1 rounded-full border border-stone-300 text-stone-600 bg-white hover:border-yellow-400 hover:text-yellow-600"
          >
            + {s}
          </button>
        ))}
      </div>

      {ingredients.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 mb-4">
          {ingredients.map(i => (
            <span
              key={i}
              className="flex items-center gap-1 text-sm px-3 py-1 rounded-full bg-white text-black border border-yellow-400"
            >
              {i}
              <button onClick={() => removeIngredient(i)} className="hover:text-yellow-700">
                <X size={14} />
              </button>
            </span>
          ))}
          <button
            onClick={() => setIngredients([])}
            className="flex items-center gap-1 text-sm px-4 py-2 rounded-lg bg-transparent border border-black text-black hover:bg-stone-100"
          >
            <Trash2 size={14} />
            Clear all
          </button>
        </div>
      )}

      <label className="flex items-center gap-2 text-sm text-stone-500 mb-6 cursor-pointer">
        <input
          type="checkbox"
          checked={hasStaples}
          onChange={e => setHasStaples(e.target.checked)}
          className="rounded border-stone-300 accent-yellow-400 focus:ring-yellow-400"
        />
        Assume I always have salt, pepper, oil and butter
      </label>


      {ingredients.length === 0 ? (
        <p className="text-center text-stone-400 italic mt-10">Add a few ingredients to see what you can make.</p>
      ) : (
        <div className="space-y-3">
          {visible.map(r => {
            const pct = r.haveCount / r.total;
            const isOpen = expanded === r.id;
            return (
              <div key={r.id} className="bg-white rounded-xl border border-stone-200 overflow-hidden">
                <div
                  onClick={() => setExpanded(isOpen ? null : r.id)}
                  className={`w-full flex items-center justify-between p-4 text-left cursor-pointer ${isOpen ? 'bg-yellow-400' : ''}`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{r.emoji}</span>
                    <div>
                      <div className="font-serif font-semibold text-stone-800">
                        {r.name}
                        {r.custom && (
                          <span className={`ml-2 text-xs font-sans font-normal align-middle ${isOpen ? 'text-stone-700' : 'text-stone-400'}`}>
                            · yours
                          </span>
                        )}
                      </div>
                      <div className="flex gap-1 mt-1.5">
                        {r.ingredients.map((ing, idx) => (
                          <span
                            key={idx}
                            className={`w-2.5 h-2.5 rounded-sm ${
                              isOpen
                                ? (isAvailable(ing) ? 'bg-black' : 'bg-white')
                                : (isAvailable(ing) ? 'bg-yellow-400' : 'bg-stone-200')
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0 ml-3">
                    {pct === 1 ? (
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${isOpen ? 'bg-white text-yellow-700' : 'bg-yellow-100 text-yellow-700'}`}>
                        Ready to cook
                      </span>
                    ) : (
                      <span className={`text-xs ${isOpen ? 'text-stone-800' : 'text-stone-500'}`}>{r.haveCount}/{r.total} on hand</span>
                    )}
                    <button
                      onClick={(e) => { e.stopPropagation(); toggleExclude(r.id); }}
                      title="Don't suggest this meal"
                      className={`p-1.5 -m-1.5 ${isOpen ? 'text-yellow-700 hover:text-stone-800' : 'text-stone-300 hover:text-stone-500'}`}
                    >
                      <EyeOff size={16} />
                    </button>
                    {isOpen ? <ChevronUp size={18} className="text-stone-800" /> : <ChevronDown size={18} className="text-stone-400" />}
                  </div>
                </div>
                {isOpen && (
                  <div className="px-4 pb-4 border-t border-stone-100 pt-3">
                    <div className="mb-3">
                      <div className="text-sm font-medium text-stone-600 mb-1">Ingredients</div>
                      <ul className="text-sm text-stone-600 space-y-1">
                        {r.ingredients.map((ing, idx) => (
                          <li key={idx} className={`flex items-center gap-2 ${isAvailable(ing) ? '' : 'text-stone-400'}`}>
                            <span className={`w-2 h-2 rounded-full ${isAvailable(ing) ? 'bg-black' : 'bg-stone-300'}`} />
                            {ing}{!isAvailable(ing) && ' (missing)'}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-stone-600 mb-1">Steps</div>
                      <ol className="text-sm text-stone-600 list-decimal list-inside space-y-1">
                        {r.steps.map((step, idx) => <li key={idx}>{step}</li>)}
                      </ol>
                    </div>
                    {r.custom && (
                      <button
                        onClick={(e) => { e.stopPropagation(); deleteRecipe(r.id); }}
                        className="mt-3 flex items-center gap-1 text-sm text-stone-400 hover:text-stone-700"
                      >
                        <Trash2 size={14} /> Remove this recipe
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {hidden.length > 0 && (
        <div className="mt-6 pt-4 border-t border-stone-200">
          <div className="text-sm text-stone-400 mb-2">Hidden meals ({hidden.length})</div>
          <div className="flex flex-wrap gap-2">
            {hidden.map(r => (
              <button
                key={r.id}
                onClick={() => toggleExclude(r.id)}
                className="flex items-center gap-1.5 text-sm px-3 py-1 rounded-full border border-stone-200 text-stone-400 bg-white hover:border-yellow-400 hover:text-yellow-600"
              >
                <Eye size={14} />
                {r.emoji} {r.name}
              </button>
            ))}
          </div>
        </div>
      )}
      </>
      )}

      {view === 'mine' && (
        <>
          <div className="mb-6">
            {!showAddForm ? (
              <button
                onClick={() => setShowAddForm(true)}
                className="w-full flex items-center justify-center gap-1 text-sm px-4 py-2 rounded-lg border border-dashed border-stone-300 text-stone-500 hover:border-yellow-400 hover:text-yellow-600"
              >
                <Plus size={16} /> Add your own recipe
              </button>
            ) : (
              <div className="border border-stone-200 rounded-xl p-4 space-y-3">
                <div className="flex gap-2">
                  <input
                    value={newEmoji}
                    onChange={e => setNewEmoji(e.target.value)}
                    placeholder="🍽️"
                    className="w-14 px-2 py-2 rounded-lg border border-stone-300 text-center text-xl focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  />
                  <input
                    value={newName}
                    onChange={e => setNewName(e.target.value)}
                    placeholder="Recipe name"
                    className="flex-1 px-4 py-2 rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-yellow-400 text-stone-800"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-stone-600 mb-1 block">Ingredients</label>
                  <input
                    value={newIngredients}
                    onChange={e => setNewIngredients(e.target.value)}
                    placeholder="e.g. chicken breast, rice, soy sauce"
                    className="w-full px-4 py-2 rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-yellow-400 text-stone-800"
                  />
                  <p className="text-xs text-stone-400 mt-1">Just the ingredient names, separated by commas - no need for quantities (e.g. "rice, garlic" not "2 cups rice, 3 cloves garlic").</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-stone-600 mb-1 block">Steps</label>
                  <textarea
                    value={newSteps}
                    onChange={e => setNewSteps(e.target.value)}
                    placeholder="One step per line"
                    rows={4}
                    className="w-full px-4 py-2 rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-yellow-400 text-stone-800"
                  />
                  <p className="text-xs text-stone-400 mt-1">One step per line.</p>
                </div>
                <div className="flex gap-2 justify-end">
                  <button
                    onClick={() => setShowAddForm(false)}
                    className="px-4 py-2 rounded-lg text-stone-500 hover:text-stone-700"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={saveRecipe}
                    className="px-4 py-2 rounded-lg bg-yellow-400 text-stone-800 hover:bg-yellow-500"
                  >
                    Save recipe
                  </button>
                </div>
              </div>
            )}
          </div>

          {customRecipes.length === 0 ? (
            <p className="text-center text-stone-400 italic mt-10">You haven't added any recipes yet.</p>
          ) : (
            <div className="space-y-3">
              {customRecipes.map(r => {
                const isOpen = expanded === r.id;
                return (
                  <div key={r.id} className="bg-white rounded-xl border border-stone-200 overflow-hidden">
                    <div
                      onClick={() => setExpanded(isOpen ? null : r.id)}
                      className={`w-full flex items-center justify-between p-4 text-left cursor-pointer ${isOpen ? 'bg-yellow-400' : ''}`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{r.emoji}</span>
                        <div className="font-serif font-semibold text-stone-800">{r.name}</div>
                      </div>
                      {isOpen ? <ChevronUp size={18} className="text-stone-800" /> : <ChevronDown size={18} className="text-stone-400" />}
                    </div>
                    {isOpen && (
                      <div className="px-4 pb-4 border-t border-stone-100 pt-3">
                        <div className="mb-3">
                          <div className="text-sm font-medium text-stone-600 mb-1">Ingredients</div>
                          <ul className="text-sm text-stone-600 list-disc list-inside space-y-1">
                            {r.ingredients.map((ing, idx) => <li key={idx}>{ing}</li>)}
                          </ul>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-stone-600 mb-1">Steps</div>
                          <ol className="text-sm text-stone-600 list-decimal list-inside space-y-1">
                            {r.steps.map((step, idx) => <li key={idx}>{step}</li>)}
                          </ol>
                        </div>
                        <button
                          onClick={(e) => { e.stopPropagation(); deleteRecipe(r.id); }}
                          className="mt-3 flex items-center gap-1 text-sm text-stone-400 hover:text-stone-700"
                        >
                          <Trash2 size={14} /> Remove this recipe
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}
