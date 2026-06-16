import { useState, useEffect } from 'react';
import { Plus, X, ChevronDown, ChevronUp, ChefHat, EyeOff, Eye, Trash2, Share2, Search, Settings, Heart, ShoppingCart } from 'lucide-react';
import { supabase } from './supabaseClient';
import Legal from './Legal';

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

function cleanIngredient(raw) {
  let words = raw.trim().toLowerCase().split(/\s+/).filter(Boolean);
  while (words.length > 1) {
    let w = words[0];
    if (/^[\d.\/-]+$/.test(w)) { words.shift(); continue; }
    const numMatch = w.match(/^[\d.\/]+(.+)$/);
    if (numMatch) w = numMatch[1];
    const singular = w.endsWith('s') ? w.slice(0, -1) : w;
    if (UNIT_WORDS.has(w) || UNIT_WORDS.has(singular) || SKIP_WORDS.has(w)) { words.shift(); continue; }
    break;
  }
  return words.join(' ');
}

const RECIPES = [
  {
    id: 1, name: 'Veggie omelette', emoji: '🍳',
    ingredients: ['eggs', 'milk', 'onion', 'bell pepper', 'cheddar cheese', 'butter', 'salt', 'pepper'],
    measurements: {
      eggs: '4 eggs', milk: '2 tbsp / 30 ml milk', onion: '½ cup chopped / 50 g onion',
      'bell pepper': '½ cup chopped / 60 g bell pepper', 'cheddar cheese': '½ cup grated / 50 g cheddar cheese',
      butter: '2 tsp / 10 g butter', salt: '½ tsp / 2 g salt', pepper: '¼ tsp / 1 g pepper',
    },
    steps: [
      'Whisk the eggs with the milk, salt and pepper.',
      'Sauté the onion and bell pepper in butter until soft.',
      'Pour in the eggs and cook over low heat until just set.',
      'Sprinkle cheese over half, fold, and serve.',
    ],
  },
  {
    id: 2, name: 'Garlic butter pasta', emoji: '🍝',
    ingredients: ['pasta', 'butter', 'garlic', 'parmesan', 'parsley', 'salt'],
    measurements: {
      pasta: '7 oz / 200 g pasta', butter: '3 tbsp / 40 g butter', garlic: '3 cloves garlic',
      parmesan: '⅓ cup grated / 30 g parmesan', parsley: '1 tbsp chopped / 5 g parsley', salt: '½ tsp / 2 g salt',
    },
    steps: [
      'Boil the pasta in salted water until al dente.',
      'Melt the butter and gently sauté the garlic.',
      'Toss the drained pasta through the garlic butter.',
      'Finish with parmesan and chopped parsley.',
    ],
  },
  {
    id: 3, name: 'Chicken stir fry', emoji: '🥢',
    ingredients: ['chicken breast', 'soy sauce', 'garlic', 'ginger', 'bell pepper', 'rice', 'oil'],
    measurements: {
      'chicken breast': '10½ oz / 300 g chicken breast', 'soy sauce': '2 tbsp / 30 ml soy sauce', garlic: '2 cloves garlic',
      ginger: '2 tsp grated / 10 g ginger', 'bell pepper': '¾ cup sliced / 100 g bell pepper',
      rice: '¾ cup / 150 g rice', oil: '1 tbsp / 15 ml oil',
    },
    steps: [
      'Cook the rice and set aside.',
      'Slice the chicken and stir-fry in oil until browned.',
      'Add garlic, ginger and bell pepper, cook 2-3 minutes.',
      'Stir in soy sauce and serve over the rice.',
    ],
  },
  {
    id: 4, name: 'Tomato rice', emoji: '🍚',
    ingredients: ['rice', 'tomato', 'onion', 'garlic', 'oil', 'salt'],
    measurements: {
      rice: '¾ cup / 150 g rice', tomato: '1¼ cups chopped / 200 g tomato', onion: '⅔ cup chopped / 80 g onion',
      garlic: '2 cloves garlic', oil: '1 tbsp / 15 ml oil', salt: '½ tsp / 2 g salt',
    },
    steps: [
      'Sauté the onion and garlic in oil until fragrant.',
      'Add the chopped tomato and cook until it breaks down.',
      'Stir in the cooked rice and salt.',
      'Simmer for 5 minutes, stirring occasionally.',
    ],
  },
  {
    id: 5, name: 'Tuna sandwich', emoji: '🥪',
    ingredients: ['bread', 'tuna', 'mayonnaise', 'lettuce', 'pepper'],
    measurements: {
      bread: '2 slices bread', tuna: '1 small can / 100 g tuna', mayonnaise: '4 tsp / 20 g mayonnaise',
      lettuce: '⅓ cup shredded / 20 g lettuce', pepper: '¼ tsp / 1 g pepper',
    },
    steps: [
      'Mix the tuna with mayonnaise and pepper.',
      'Layer lettuce and the tuna mix between bread slices.',
      'Slice and serve.',
    ],
  },
  {
    id: 6, name: 'Bean quesadilla', emoji: '🌮',
    ingredients: ['tortilla', 'beans', 'cheddar cheese', 'salsa'],
    measurements: {
      tortilla: '1 (10 in) / 60 g tortilla', beans: '½ cup / 100 g beans',
      'cheddar cheese': '⅓ cup grated / 40 g cheddar cheese', salsa: '2 tbsp / 30 g salsa',
    },
    steps: [
      'Spread beans and cheese over a tortilla, fold in half.',
      'Toast in a dry pan until golden and the cheese melts.',
      'Cut into wedges and serve with salsa.',
    ],
  },
  {
    id: 7, name: 'Banana pancakes', emoji: '🥞',
    ingredients: ['flour', 'banana', 'eggs', 'milk', 'sugar', 'butter'],
    measurements: {
      flour: '1 cup / 120 g flour', banana: '1 medium / 120 g banana', eggs: '2 eggs',
      milk: '⅔ cup / 150 ml milk', sugar: '1 tbsp / 15 g sugar', butter: '1 tbsp / 15 g butter',
    },
    steps: [
      'Mash the banana and whisk with eggs, milk and sugar.',
      'Stir in the flour until just combined.',
      'Cook spoonfuls in a buttered pan until golden on both sides.',
    ],
  },
  {
    id: 8, name: 'Lentil soup', emoji: '🍲',
    ingredients: ['lentils', 'onion', 'carrot', 'garlic', 'vegetable stock', 'salt'],
    measurements: {
      lentils: '1 cup / 200 g lentils', onion: '¾ cup chopped / 100 g onion', carrot: '1 cup chopped / 100 g carrot',
      garlic: '2 cloves garlic', 'vegetable stock': '4 cups / 1 L vegetable stock', salt: '½ tsp / 3 g salt',
    },
    steps: [
      'Sauté the onion, carrot and garlic until softened.',
      'Add the lentils and vegetable stock.',
      'Simmer until the lentils are tender, then season with salt.',
    ],
  },
  {
    id: 9, name: 'Grilled cheese', emoji: '🧀',
    ingredients: ['bread', 'cheddar cheese', 'butter'],
    measurements: {
      bread: '2 slices bread', 'cheddar cheese': '½ cup grated / 50 g cheddar cheese', butter: '2 tsp / 10 g butter',
    },
    steps: [
      'Butter the outside of two bread slices.',
      'Place cheese between the slices.',
      'Grill in a pan until golden and the cheese melts.',
    ],
  },
  {
    id: 10, name: 'Chicken caesar salad', emoji: '🥗',
    ingredients: ['chicken breast', 'lettuce', 'parmesan', 'croutons', 'caesar dressing', 'oil'],
    measurements: {
      'chicken breast': '9 oz / 250 g chicken breast', lettuce: '2½ cups chopped / 150 g lettuce', parmesan: '⅓ cup grated / 30 g parmesan',
      croutons: '1 cup / 40 g croutons', 'caesar dressing': '3 tbsp / 40 ml caesar dressing', oil: '2 tsp / 10 ml oil',
    },
    steps: [
      'Season the chicken and pan-fry in oil until cooked through.',
      'Slice the chicken.',
      'Toss lettuce with caesar dressing.',
      'Top with chicken, parmesan and croutons.',
    ],
  },
  {
    id: 11, name: 'Vegetable curry', emoji: '🍛',
    ingredients: ['potato', 'carrot', 'onion', 'garlic', 'coconut milk', 'curry powder', 'rice', 'oil'],
    measurements: {
      potato: '2 cups chopped / 300 g potato', carrot: '1½ cups chopped / 150 g carrot', onion: '¾ cup chopped / 100 g onion',
      garlic: '2 cloves garlic', 'coconut milk': '1⅔ cups / 400 ml coconut milk', 'curry powder': '1 tbsp / 15 g curry powder',
      rice: '1 cup / 200 g rice', oil: '1 tbsp / 15 ml oil',
    },
    steps: [
      'Cook the rice and set aside.',
      'Sauté the onion and garlic in oil, then add curry powder.',
      'Add potato and carrot, then pour in the coconut milk.',
      'Simmer until the vegetables are tender, and serve over rice.',
    ],
  },
  {
    id: 12, name: 'Egg fried rice', emoji: '🍳',
    ingredients: ['rice', 'eggs', 'soy sauce', 'onion', 'peas', 'oil'],
    measurements: {
      rice: '1½ cups cooked / 300 g rice', eggs: '2 eggs', 'soy sauce': '2 tbsp / 30 ml soy sauce',
      onion: '⅓ cup chopped / 50 g onion', peas: '½ cup / 80 g peas', oil: '1 tbsp / 15 ml oil',
    },
    steps: [
      'Scramble the eggs in a little oil and set aside.',
      'Sauté the onion and peas.',
      'Add the cooked rice and soy sauce, stir-frying until hot.',
      'Mix the egg back in and serve.',
    ],
  },
  {
    id: 13, name: 'Pasta aglio e olio', emoji: '🧄',
    ingredients: ['pasta', 'garlic', 'oil', 'chili flakes', 'parsley', 'salt'],
    measurements: {
      pasta: '7 oz / 200 g pasta', garlic: '4 cloves garlic', oil: '¼ cup / 60 ml oil',
      'chili flakes': '½ tsp / 2 g chili flakes', parsley: '1 tbsp chopped / 5 g parsley', salt: '½ tsp / 2 g salt',
    },
    steps: [
      'Boil the pasta in salted water until al dente.',
      'Gently fry the garlic and chili flakes in oil until fragrant.',
      'Toss the drained pasta through the garlic oil.',
      'Finish with chopped parsley.',
    ],
  },
  {
    id: 14, name: 'Cheese quesadilla', emoji: '🌯',
    ingredients: ['tortilla', 'cheddar cheese'],
    measurements: {
      tortilla: '1 (10 in) / 60 g tortilla', 'cheddar cheese': '½ cup grated / 50 g cheddar cheese',
    },
    steps: [
      'Sprinkle cheese over a tortilla and fold in half.',
      'Toast in a dry pan until the cheese melts and the tortilla is crisp.',
    ],
  },
  {
    id: 15, name: 'Avocado toast', emoji: '🥑',
    ingredients: ['bread', 'avocado', 'lemon', 'salt', 'pepper'],
    measurements: {
      bread: '2 slices bread', avocado: '1 medium / 150 g avocado', lemon: '1 tsp juice / 5 ml lemon',
      salt: '¼ tsp / 1 g salt', pepper: '¼ tsp / 1 g pepper',
    },
    steps: [
      'Toast the bread.',
      'Mash the avocado with a squeeze of lemon, salt and pepper.',
      'Spread over the toast and serve.',
    ],
  },
];

export default function RecipeFinder({ user, tier, onSignOut, onOpenAccount, onUpgrade }) {
  const [ingredients, setIngredients] = useState([]);
  const [input, setInput] = useState('');
  const [search, setSearch] = useState('');
  const [hasStaples, setHasStaples] = useState(true);
  const [expanded, setExpanded] = useState(null);
  const [excluded, setExcluded] = useState([]);
  const [view, setView] = useState('finder');

  // Custom recipes
  const [customRecipes, setCustomRecipes] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmoji, setNewEmoji] = useState('🍽️');
  const [newIngredients, setNewIngredients] = useState('');
  const [newSteps, setNewSteps] = useState('');
  const [newTags, setNewTags] = useState('');
  const [activeTag, setActiveTag] = useState(null);

  // Favourites
  const [favourites, setFavourites] = useState(new Set());
  const [showFavOnly, setShowFavOnly] = useState(false);

  // Shopping list
  const [listRecipeIds, setListRecipeIds] = useState(new Set());
  const [showShoppingList, setShowShoppingList] = useState(false);
  const [listCopied, setListCopied] = useState(false);

  // UI
  const [legalDoc, setLegalDoc] = useState(null);
  const [shareMsg, setShareMsg] = useState('');

  const isPaid = ['monthly', 'annual', 'beta'].includes(tier);

  useEffect(() => {
    supabase
      .from('custom_recipes')
      .select('*')
      .order('created_at', { ascending: true })
      .then(({ data, error }) => {
        if (!error && data) setCustomRecipes(data.map(r => ({ ...r, custom: true })));
      });
    supabase
      .from('favourites')
      .select('recipe_id')
      .then(({ data }) => {
        if (data) setFavourites(new Set(data.map(f => String(f.recipe_id))));
      });
  }, [user]);

  const addIngredient = (raw) => {
    const name = raw.trim().toLowerCase();
    if (!name || ingredients.includes(name)) { setInput(''); return; }
    setIngredients([...ingredients, name]);
    setInput('');
  };

  const removeIngredient = (name) => setIngredients(ingredients.filter(i => i !== name));

  const toggleExclude = (id) => {
    setExcluded(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
    setExpanded(prev => (prev === id ? null : prev));
  };

  const toggleFav = async (recipeId) => {
    const id = String(recipeId);
    if (favourites.has(id)) {
      await supabase.from('favourites').delete().eq('user_id', user.id).eq('recipe_id', id);
      setFavourites(prev => { const n = new Set(prev); n.delete(id); return n; });
    } else {
      await supabase.from('favourites').insert({ user_id: user.id, recipe_id: id });
      setFavourites(prev => new Set([...prev, id]));
    }
  };

  const toggleListRecipe = (id) => {
    setListRecipeIds(prev => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id); else n.add(id);
      return n;
    });
  };

  const saveRecipe = async () => {
    const name = newName.trim();
    const ings = newIngredients.split(',').map(cleanIngredient).filter(Boolean);
    const steps = newSteps.split('\n').map(s => s.trim()).filter(Boolean);
    const tags = newTags.split(',').map(t => t.trim().toLowerCase()).filter(Boolean);
    if (!name || ings.length === 0 || steps.length === 0) return;

    const { data, error } = await supabase
      .from('custom_recipes')
      .insert({ user_id: user.id, name, emoji: newEmoji.trim() || '🍽️', ingredients: ings, steps, tags })
      .select()
      .single();

    if (!error && data) setCustomRecipes(prev => [...prev, { ...data, custom: true }]);
    setNewName(''); setNewEmoji('🍽️'); setNewIngredients(''); setNewSteps(''); setNewTags('');
    setShowAddForm(false);
  };

  const deleteRecipe = async (id) => {
    await supabase.from('custom_recipes').delete().eq('id', id);
    setCustomRecipes(prev => prev.filter(r => r.id !== id));
    setExpanded(prev => (prev === id ? null : prev));
  };

  const shareRecipe = async (recipe) => {
    const text = `${recipe.emoji} ${recipe.name}\n\nIngredients:\n${recipe.ingredients.map(i => `• ${i}`).join('\n')}\n\nSteps:\n${recipe.steps.map((s, i) => `${i + 1}. ${s}`).join('\n')}\n\nShared via Pantry to Plate`;
    if (navigator.share) {
      await navigator.share({ title: recipe.name, text }).catch(() => {});
    } else {
      await navigator.clipboard.writeText(text).catch(() => {});
      setShareMsg(recipe.id);
      setTimeout(() => setShareMsg(''), 2000);
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

  const visible = scored
    .filter(r => !excluded.includes(r.id))
    .filter(r => !showFavOnly || favourites.has(String(r.id)))
    .filter(r => !search || r.name.toLowerCase().includes(search.toLowerCase()) || r.ingredients.some(i => i.toLowerCase().includes(search.toLowerCase())));

  const hidden = allRecipes.filter(r => excluded.includes(r.id));

  const ingredientCounts = {};
  allRecipes.forEach(r => {
    r.ingredients.forEach(ing => {
      if (!STAPLES.includes(ing)) ingredientCounts[ing] = (ingredientCounts[ing] || 0) + 1;
    });
  });
  const allIngredients = Object.keys(ingredientCounts).sort((a, b) => {
    const diff = ingredientCounts[b] - ingredientCounts[a];
    return diff !== 0 ? diff : a.localeCompare(b);
  });
  const suggestions = allIngredients.filter(s => !ingredients.includes(s)).slice(0, 14);

  const allTags = [...new Set(customRecipes.flatMap(r => r.tags || []))].sort();
  const filteredCustom = activeTag ? customRecipes.filter(r => r.tags?.includes(activeTag)) : customRecipes;

  // Shopping list computation
  const getShoppingData = () => {
    const selected = allRecipes.filter(r => listRecipeIds.has(r.id));
    const seen = {};
    selected.forEach(recipe => {
      recipe.ingredients.forEach(ing => {
        if (!seen[ing]) seen[ing] = { measurement: recipe.measurements?.[ing] ?? ing, inKitchen: isAvailable(ing) };
      });
    });
    const toBuy = Object.values(seen).filter(v => !v.inKitchen);
    const have = Object.values(seen).filter(v => v.inKitchen);
    return { selected, toBuy, have };
  };

  const shareShoppingList = async () => {
    const { selected, toBuy } = getShoppingData();
    const text = `Shopping List\n\nFor: ${selected.map(r => r.name).join(', ')}\n\n${toBuy.map(v => `• ${v.measurement}`).join('\n')}\n\nGenerated by Pantry to Plate`;
    if (navigator.share) {
      await navigator.share({ title: 'Shopping List', text }).catch(() => {});
    } else {
      await navigator.clipboard.writeText(text).catch(() => {});
      setListCopied(true);
      setTimeout(() => setListCopied(false), 2000);
    }
  };

  const { selected: listSelected, toBuy, have: listHave } = showShoppingList ? getShoppingData() : { selected: [], toBuy: [], have: [] };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white min-h-screen flex flex-col">
      {legalDoc && <Legal doc={legalDoc} onClose={() => setLegalDoc(null)} />}

      {/* Shopping list modal */}
      {showShoppingList && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-end justify-center p-4" onClick={e => e.target === e.currentTarget && setShowShoppingList(false)}>
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl overflow-hidden max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between px-5 py-4 border-b border-stone-100">
              <div>
                <h2 className="font-serif font-semibold text-stone-800">Shopping list</h2>
                <p className="text-xs text-stone-400 mt-0.5">For: {listSelected.map(r => r.name).join(', ')}</p>
              </div>
              <button onClick={() => setShowShoppingList(false)} className="text-stone-400 hover:text-stone-600"><X size={20} /></button>
            </div>
            <div className="overflow-y-auto flex-1 px-5 py-4">
              {toBuy.length > 0 && (
                <div className="mb-4">
                  <div className="text-xs font-semibold uppercase tracking-wide text-stone-400 mb-2">To buy ({toBuy.length})</div>
                  <ul className="space-y-1.5">
                    {toBuy.map((v, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-stone-700">
                        <span className="w-2 h-2 rounded-full bg-yellow-400 shrink-0" />
                        {v.measurement}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {listHave.length > 0 && (
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wide text-stone-400 mb-2">Already have ({listHave.length})</div>
                  <ul className="space-y-1.5">
                    {listHave.map((v, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-stone-400 line-through">
                        <span className="w-2 h-2 rounded-full bg-stone-200 shrink-0" />
                        {v.measurement}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            <div className="px-5 py-4 border-t border-stone-100 flex gap-3">
              <button
                onClick={shareShoppingList}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-yellow-400 text-stone-800 font-semibold hover:bg-yellow-500 text-sm"
              >
                <Share2 size={15} />
                {listCopied ? 'Copied!' : 'Share list'}
              </button>
              <button
                onClick={() => { setListRecipeIds(new Set()); setShowShoppingList(false); }}
                className="px-4 py-2.5 rounded-xl border border-stone-200 text-stone-500 text-sm hover:border-stone-300"
              >
                Clear
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sticky shopping list bar */}
      {listRecipeIds.size > 0 && !showShoppingList && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-stone-800 text-white px-5 py-3 rounded-full shadow-xl flex items-center gap-3">
          <ShoppingCart size={16} className="text-yellow-400" />
          <span className="text-sm font-medium">{listRecipeIds.size} {listRecipeIds.size === 1 ? 'recipe' : 'recipes'}</span>
          <button onClick={() => setShowShoppingList(true)} className="text-yellow-400 text-sm font-semibold">View list →</button>
          <button onClick={() => setListRecipeIds(new Set())} className="text-stone-400 hover:text-white ml-1"><X size={14} /></button>
        </div>
      )}

      <div className="text-center mb-6 relative">
        <div className="absolute right-0 top-0 flex items-center gap-3">
          <button onClick={onOpenAccount} className="flex items-center gap-1 text-xs text-stone-400 hover:text-stone-600">
            <Settings size={13} /> Manage account
          </button>
          <button onClick={onSignOut} className="text-xs text-stone-400 hover:text-stone-600">
            Sign out
          </button>
        </div>
        <div className="text-xs font-semibold tracking-widest text-yellow-600 uppercase mb-2">Pantry to Plate</div>
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-yellow-400 text-stone-800 mb-3">
          <ChefHat size={24} />
        </div>
        <h1 className="text-3xl font-serif font-bold text-stone-800">What's Cooking?</h1>
        <p className="text-stone-500 mt-1">
          {user?.user_metadata?.full_name
            ? `Welcome, ${user.user_metadata.full_name}! Add what's in your kitchen and discover what to make.`
            : "Add what's in your kitchen and discover what to make."}
        </p>
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
                <span key={i} className="flex items-center gap-1 text-sm px-3 py-1 rounded-full bg-white text-black border border-yellow-400">
                  {i}
                  <button onClick={() => removeIngredient(i)} className="hover:text-yellow-700"><X size={14} /></button>
                </span>
              ))}
              <button
                onClick={() => setIngredients([])}
                className="flex items-center gap-1 text-sm px-4 py-2 rounded-lg bg-transparent border border-black text-black hover:bg-stone-100"
              >
                <Trash2 size={14} /> Clear all
              </button>
            </div>
          )}

          <label className="flex items-center gap-2 text-sm text-stone-500 mb-4 cursor-pointer">
            <input
              type="checkbox"
              checked={hasStaples}
              onChange={e => setHasStaples(e.target.checked)}
              className="rounded border-stone-300 accent-yellow-400 focus:ring-yellow-400"
            />
            Assume I always have salt, pepper, oil and butter
          </label>

          {ingredients.length > 0 && (
            <div className="flex gap-2 mb-4">
              <div className="relative flex-1">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search by name or ingredient…"
                  className="w-full pl-9 pr-4 py-2 rounded-lg border border-stone-300 bg-white focus:outline-none focus:ring-2 focus:ring-yellow-400 text-stone-800 text-sm"
                />
                {search && (
                  <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600">
                    <X size={14} />
                  </button>
                )}
              </div>
              <button
                onClick={() => setShowFavOnly(v => !v)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border text-sm font-medium transition-colors ${
                  showFavOnly ? 'bg-red-50 border-red-300 text-red-500' : 'border-stone-300 text-stone-500 hover:border-red-300 hover:text-red-400'
                }`}
              >
                <Heart size={14} className={showFavOnly ? 'fill-red-400 text-red-400' : ''} />
                Favourites
              </button>
            </div>
          )}

          {ingredients.length === 0 ? (
            <p className="text-center text-stone-400 italic mt-10">Add a few ingredients to see what you can make.</p>
          ) : visible.length === 0 && showFavOnly ? (
            <p className="text-center text-stone-400 italic mt-10">No favourited recipes match your ingredients.</p>
          ) : (
            <div className="space-y-3">
              {visible.map(r => {
                const pct = r.haveCount / r.total;
                const isOpen = expanded === r.id;
                const isFav = favourites.has(String(r.id));
                const inList = listRecipeIds.has(r.id);
                return (
                  <div key={r.id} className="bg-white rounded-xl border border-stone-200 overflow-hidden">
                    <div
                      onClick={() => setExpanded(isOpen ? null : r.id)}
                      className={`w-full flex items-center justify-between p-4 text-left cursor-pointer ${isOpen ? 'bg-yellow-400' : ''}`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="text-2xl shrink-0">{r.emoji}</span>
                        <div className="min-w-0">
                          <div className="font-serif font-semibold text-stone-800">
                            {r.name}
                            {r.custom && (
                              <span className={`ml-2 text-xs font-sans font-normal align-middle ${isOpen ? 'text-stone-700' : 'text-stone-400'}`}>· yours</span>
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
                      <div className="flex items-center gap-2 shrink-0 ml-3">
                        {pct === 1 ? (
                          <span className={`text-xs font-medium px-2 py-1 rounded-full ${isOpen ? 'bg-white text-yellow-700' : 'bg-yellow-100 text-yellow-700'}`}>
                            Ready
                          </span>
                        ) : (
                          <span className={`text-xs ${isOpen ? 'text-stone-800' : 'text-stone-500'}`}>{r.haveCount}/{r.total}</span>
                        )}
                        <button
                          onClick={e => { e.stopPropagation(); toggleListRecipe(r.id); }}
                          title="Add to shopping list"
                          className={`p-1.5 -m-1 transition-colors ${inList ? 'text-yellow-600' : isOpen ? 'text-stone-600 hover:text-stone-800' : 'text-stone-300 hover:text-stone-500'}`}
                        >
                          <ShoppingCart size={15} className={inList ? 'fill-yellow-200' : ''} />
                        </button>
                        <button
                          onClick={e => { e.stopPropagation(); toggleFav(r.id); }}
                          title={isFav ? 'Remove from favourites' : 'Save as favourite'}
                          className="p-1.5 -m-1 transition-colors"
                        >
                          <Heart size={15} className={isFav ? 'fill-red-500 text-red-500' : isOpen ? 'text-stone-600 hover:text-red-400' : 'text-stone-300 hover:text-red-400'} />
                        </button>
                        <button
                          onClick={e => { e.stopPropagation(); toggleExclude(r.id); }}
                          title="Don't suggest this meal"
                          className={`p-1.5 -m-1 ${isOpen ? 'text-stone-600 hover:text-stone-800' : 'text-stone-300 hover:text-stone-500'}`}
                        >
                          <EyeOff size={15} />
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
                                <span className={`w-2 h-2 rounded-full shrink-0 ${isAvailable(ing) ? 'bg-black' : 'bg-stone-300'}`} />
                                {r.measurements?.[ing] ?? ing}{!isAvailable(ing) && ' (missing)'}
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
                            onClick={e => { e.stopPropagation(); deleteRecipe(r.id); }}
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
                    <Eye size={14} /> {r.emoji} {r.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {view === 'mine' && (
        <>
          {!isPaid ? (
            <div className="text-center py-12 px-4">
              <div className="text-4xl mb-4">🔒</div>
              <h3 className="font-serif font-bold text-stone-800 text-xl mb-2">Upgrade to unlock your recipe repository</h3>
              <p className="text-stone-500 text-sm mb-6">Save and manage your own recipes — including categories, tags, and shopping lists — with any paid plan.</p>
              <button onClick={onUpgrade} className="px-6 py-2.5 rounded-xl bg-yellow-400 text-stone-800 font-semibold hover:bg-yellow-500">
                View plans
              </button>
            </div>
          ) : (
            <>
              <div className="mb-4">
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
                      <p className="text-xs text-stone-400 mt-1">Names only, separated by commas — no quantities needed.</p>
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
                    </div>
                    <div>
                      <label className="text-sm font-medium text-stone-600 mb-1 block">Categories / tags <span className="font-normal text-stone-400">(optional)</span></label>
                      <input
                        value={newTags}
                        onChange={e => setNewTags(e.target.value)}
                        placeholder="e.g. quick, vegetarian, lunch"
                        className="w-full px-4 py-2 rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-yellow-400 text-stone-800"
                      />
                      <p className="text-xs text-stone-400 mt-1">Comma-separated tags to categorise your recipe.</p>
                    </div>
                    <div className="flex gap-2 justify-end">
                      <button onClick={() => setShowAddForm(false)} className="px-4 py-2 rounded-lg text-stone-500 hover:text-stone-700">Cancel</button>
                      <button onClick={saveRecipe} className="px-4 py-2 rounded-lg bg-yellow-400 text-stone-800 hover:bg-yellow-500">Save recipe</button>
                    </div>
                  </div>
                )}
              </div>

              {allTags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  <button
                    onClick={() => setActiveTag(null)}
                    className={`text-xs px-3 py-1 rounded-full border transition-colors ${!activeTag ? 'bg-stone-800 text-white border-stone-800' : 'border-stone-300 text-stone-500 hover:border-stone-400'}`}
                  >
                    All
                  </button>
                  {allTags.map(tag => (
                    <button
                      key={tag}
                      onClick={() => setActiveTag(activeTag === tag ? null : tag)}
                      className={`text-xs px-3 py-1 rounded-full border transition-colors ${activeTag === tag ? 'bg-yellow-400 border-yellow-400 text-stone-800' : 'border-stone-300 text-stone-500 hover:border-yellow-400 hover:text-yellow-600'}`}
                    >
                      #{tag}
                    </button>
                  ))}
                </div>
              )}

              {filteredCustom.length > 0 ? (
                <div className="space-y-3">
                  {filteredCustom.map(r => {
                    const isOpen = expanded === r.id;
                    return (
                      <div key={r.id} className="bg-white rounded-xl border border-stone-200 overflow-hidden">
                        <div
                          onClick={() => setExpanded(isOpen ? null : r.id)}
                          className={`w-full flex items-center justify-between p-4 text-left cursor-pointer ${isOpen ? 'bg-yellow-400' : ''}`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <span className="text-2xl shrink-0">{r.emoji}</span>
                            <div className="min-w-0">
                              <div className="font-serif font-semibold text-stone-800">{r.name}</div>
                              {r.tags && r.tags.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {r.tags.map(tag => (
                                    <span key={tag} className={`text-xs px-1.5 py-0.5 rounded-full ${isOpen ? 'bg-yellow-300 text-stone-700' : 'bg-stone-100 text-stone-500'}`}>#{tag}</span>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                          {isOpen ? <ChevronUp size={18} className="text-stone-800 shrink-0" /> : <ChevronDown size={18} className="text-stone-400 shrink-0" />}
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
                            <div className="mt-3 flex items-center gap-3">
                              <button
                                onClick={e => { e.stopPropagation(); shareRecipe(r); }}
                                className="flex items-center gap-1 text-sm text-stone-400 hover:text-stone-700"
                              >
                                <Share2 size={14} />
                                {shareMsg === r.id ? 'Copied!' : 'Share'}
                              </button>
                              <button
                                onClick={e => { e.stopPropagation(); deleteRecipe(r.id); }}
                                className="flex items-center gap-1 text-sm text-stone-400 hover:text-stone-700"
                              >
                                <Trash2 size={14} /> Remove
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-center text-stone-400 italic mt-10">
                  {activeTag ? `No recipes tagged #${activeTag}.` : "You haven't added any recipes yet."}
                </p>
              )}
            </>
          )}
        </>
      )}

      <footer className="mt-auto pt-10 pb-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-stone-400">
        <span>© 2026 Pantry to Plate. All rights reserved.</span>
        <button onClick={() => setLegalDoc('terms')} className="hover:text-stone-600 underline underline-offset-2">Terms &amp; Conditions</button>
        <button onClick={() => setLegalDoc('privacy')} className="hover:text-stone-600 underline underline-offset-2">Privacy Policy</button>
      </footer>
    </div>
  );
}
