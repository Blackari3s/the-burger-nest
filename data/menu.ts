export type Lang = "en" | "es";

export type Localized = { en: string; es: string };

export type MenuOption = {
  id: string;
  name: Localized;
  /** Extra cents added to the item price. */
  price: number;
  isDefault?: boolean;
};

export type MenuGroup = {
  id: string;
  name: Localized;
  hint?: Localized;
  min: number;
  max: number;
  showWhen?: { groupId: string; optionId: string };
  options: MenuOption[];
};

export type MenuItem = {
  id: string;
  category: string;
  name: Localized;
  description: Localized;
  /** Omitted when the truck has no photo of this item. */
  image?: string;
  imageAlt: Localized;
  /** Lowest price a guest can check out at, in cents. */
  fromPrice: number;
  /** Price before modifiers, in cents. */
  price: number;
  groups: MenuGroup[];
};

export type Category = {
  id: string;
  name: Localized;
  blurb: Localized;
};

const t = (en: string, es: string): Localized => ({ en, es });

const drinks: MenuOption[] = [
  { id: "coke", name: t("Coke", "Coca-Cola"), price: 0 },
  { id: "coke-zero", name: t("Coke Zero", "Coca-Cola Zero"), price: 0 },
  { id: "sprite", name: t("Sprite", "Sprite"), price: 0 },
  { id: "fanta", name: t("Fanta", "Fanta"), price: 0 },
  { id: "lemonade", name: t("Lemonade", "Limonada"), price: 0 },
  { id: "dr-pepper", name: t("Dr Pepper", "Dr Pepper"), price: 0 },
  { id: "pepsi", name: t("Pepsi", "Pepsi"), price: 0 },
  { id: "water", name: t("Water", "Agua"), price: 0 },
  { id: "jupina", name: t("Jupiña", "Jupiña"), price: 0 },
  { id: "kola", name: t("Kola Champagne", "Kola Champagne"), price: 0 },
  { id: "mango", name: t("Mango juice", "Jugo de mango"), price: 0 },
  { id: "guava", name: t("Guava juice", "Jugo de guayaba"), price: 0 },
];

const sauceOptions: MenuOption[] = [
  { id: "mango", name: t("Mango habanero", "Mango habanero"), price: 0 },
  { id: "buffalo", name: t("Buffalo", "Buffalo"), price: 0 },
  { id: "lemon", name: t("Lemon pepper", "Lemon pepper"), price: 0 },
  { id: "bbq", name: t("BBQ", "BBQ"), price: 0 },
  { id: "ranch", name: t("Ranch", "Ranch"), price: 0 },
];

const toppings: MenuGroup = {
  id: "toppings",
  name: t("Toppings", "Ingredientes"),
  hint: t(
    "Onions, tomato, pickles, lettuce, and grilled peppers are included.",
    "Cebolla, tomate, pepinillos, lechuga y pimientos asados van incluidos.",
  ),
  min: 0,
  max: 8,
  options: [
    { id: "onions", name: t("Onions", "Cebolla"), price: 0 },
    { id: "tomato", name: t("Tomato", "Tomate"), price: 0 },
    { id: "pickles", name: t("Pickles", "Pepinillos"), price: 0 },
    { id: "lettuce", name: t("Lettuce", "Lechuga"), price: 0 },
    { id: "peppers", name: t("Grilled peppers", "Pimientos asados"), price: 0 },
    { id: "pineapple", name: t("Pineapple", "Piña"), price: 75 },
    { id: "jalapeno", name: t("Jalapeños", "Jalapeños"), price: 75 },
    { id: "egg", name: t("Fried egg", "Huevo frito"), price: 100 },
  ],
};

const burgerCheese: MenuGroup = {
  id: "cheese",
  name: t("Cheese", "Queso"),
  min: 1,
  max: 1,
  options: [
    { id: "cheddar", name: t("Cheddar", "Cheddar"), price: 0, isDefault: true },
    { id: "american", name: t("American", "Americano"), price: 0 },
    { id: "none", name: t("No cheese", "Sin queso"), price: 0 },
  ],
};

const baconChoice: MenuGroup = {
  id: "bacon",
  name: t("Bacon", "Tocino"),
  hint: t("Bacon comes on the burger.", "La hamburguesa trae tocino."),
  min: 0,
  max: 1,
  options: [{ id: "no-bacon", name: t("No bacon", "Sin tocino"), price: 0 }],
};

const extras: MenuGroup = {
  id: "extras",
  name: t("Extras", "Extras"),
  min: 0,
  max: 1,
  options: [
    { id: "extra-bacon", name: t("Extra bacon", "Tocino extra"), price: 150 },
    { id: "extra-cheese", name: t("Extra cheese", "Queso extra"), price: 100 },
  ],
};

const patty: MenuGroup = {
  id: "patty",
  name: t("Add a patty", "Agrega una carne"),
  min: 0,
  max: 1,
  options: [{ id: "patty", name: t("Extra patty", "Carne extra"), price: 299 }],
};

const optionalSauces: MenuGroup = {
  id: "sauces",
  name: t("Sauce", "Salsa"),
  min: 0,
  max: 5,
  options: sauceOptions,
};

function fries(showWhen?: MenuGroup["showWhen"]): MenuGroup {
  return {
    id: "fries",
    name: t("Fries", "Papas fritas"),
    min: 1,
    max: 1,
    showWhen,
    options: [
      {
        id: "regular",
        name: t("Regular fries", "Papas regulares"),
        price: 0,
        isDefault: true,
      },
      {
        id: "loaded",
        name: t("Cheese & bacon fries", "Papas con queso y tocino"),
        price: 399,
      },
    ],
  };
}

function drink(showWhen?: MenuGroup["showWhen"]): MenuGroup {
  return {
    id: "drink",
    name: t("Drink", "Bebida"),
    min: 1,
    max: 1,
    showWhen,
    options: drinks,
  };
}

function serving(
  only: Localized,
  comboCents: number,
): MenuGroup {
  return {
    id: "serving",
    name: t("Style", "Estilo"),
    min: 1,
    max: 1,
    options: [
      { id: "only", name: only, price: 0, isDefault: true },
      {
        id: "combo",
        name: t("Combo · fries and a drink", "Combo · papas y bebida"),
        price: comboCents,
      },
    ],
  };
}

const comboOnly = { groupId: "serving", optionId: "combo" };

function burgerGroups(comboCents: number, only: Localized): MenuGroup[] {
  return [
    serving(only, comboCents),
    burgerCheese,
    toppings,
    baconChoice,
    extras,
    patty,
    optionalSauces,
    drink(comboOnly),
    fries(comboOnly),
  ];
}

const rice: MenuGroup = {
  id: "rice",
  name: t("Rice", "Arroz"),
  min: 1,
  max: 1,
  options: [
    {
      id: "beans",
      name: t("White rice and black beans", "Arroz blanco y frijoles negros"),
      price: 0,
      isDefault: true,
    },
    { id: "congri", name: t("Congrí rice", "Arroz congrí"), price: 0 },
  ],
};

const phillyCheese: MenuGroup = {
  id: "cheese",
  name: t("Cheese", "Queso"),
  min: 1,
  max: 1,
  options: [
    {
      id: "white",
      name: t("White cheese", "Queso blanco"),
      price: 0,
      isDefault: true,
    },
    { id: "yellow", name: t("Yellow cheese", "Queso amarillo"), price: 0 },
    { id: "none", name: t("No cheese", "Sin queso"), price: 0 },
  ],
};

const phillyHold: MenuGroup = {
  id: "hold",
  name: t("On the Philly", "En el Philly"),
  min: 0,
  max: 2,
  options: [
    { id: "no-peppers", name: t("No peppers", "Sin pimientos"), price: 0 },
    { id: "no-onions", name: t("No onions", "Sin cebolla"), price: 0 },
  ],
};

const phillyBacon: MenuGroup = {
  id: "bacon",
  name: t("Bacon", "Tocino"),
  min: 0,
  max: 1,
  options: [{ id: "add-bacon", name: t("Add bacon", "Agregar tocino"), price: 199 }],
};

function phillyGroups(): MenuGroup[] {
  return [phillyCheese, phillyHold, phillyBacon, toppings, extras, drink(), fries()];
}

const wingPrep: MenuGroup = {
  id: "prep",
  name: t("Sauce", "Salsa"),
  min: 1,
  max: 1,
  options: [
    {
      id: "tossed",
      name: t("Tossed in sauce", "Bañadas en salsa"),
      price: 0,
      isDefault: true,
    },
    { id: "side", name: t("Sauce on the side", "Salsa al lado"), price: 0 },
  ],
};

const wingSauces: MenuGroup = {
  id: "sauces",
  name: t("Flavor", "Sabor"),
  min: 1,
  max: 5,
  options: sauceOptions,
};

function wingGroups(comboCents: number): MenuGroup[] {
  return [
    serving(t("Wings only", "Solo alitas"), comboCents),
    wingPrep,
    wingSauces,
    drink(comboOnly),
    fries(comboOnly),
  ];
}

export const categories: Category[] = [
  {
    id: "burgers",
    name: t("Burgers", "Hamburguesas"),
    blurb: t(
      "Bacon is already on the burger. Pick American or cheddar. A combo adds crispy fries and a drink.",
      "La hamburguesa ya trae tocino. Elige americano o cheddar. El combo agrega papas fritas y una bebida.",
    ),
  },
  {
    id: "cheesesteaks",
    name: t("Cheesesteaks", "Cheesesteaks"),
    blurb: t(
      "Ten inches, grilled onions and peppers, white or yellow cheese, fries, and a drink.",
      "Diez pulgadas, cebolla y pimientos a la parrilla, queso blanco o amarillo, papas y una bebida.",
    ),
  },
  {
    id: "wings",
    name: t("Wings", "Alitas"),
    blurb: t(
      "Mango habanero, buffalo, lemon pepper, BBQ, or ranch. Tossed, or on the side.",
      "Mango habanero, buffalo, lemon pepper, BBQ o ranch. Bañadas, o con la salsa al lado.",
    ),
  },
  {
    id: "plates",
    name: t("Cuban plates", "Platos"),
    blurb: t(
      "Fries, a fresh salad, and a drink. Rice is white with black beans, or congrí.",
      "Papas, ensalada fresca y una bebida. Arroz blanco con frijoles negros, o congrí.",
    ),
  },
  {
    id: "sides",
    name: t("Sides", "Acompañantes"),
    blurb: t(
      "Fries on their own, or the loaded Papas Locas.",
      "Papas solas, o las Papas Locas cargadas.",
    ),
  },
  {
    id: "drinks",
    name: t("Drinks", "Bebidas"),
    blurb: t(
      "Water, sodas, and the juices we pour at the truck.",
      "Agua, refrescos y los jugos que servimos en el truck.",
    ),
  },
];

export const signatureIds = ["onion", "philly-steak", "papas", "wings-10"] as const;

export const menu: MenuItem[] = [
  {
    id: "single",
    category: "burgers",
    name: t("Single hamburger", "Hamburguesa de res"),
    description: t(
      "One beef patty, bacon, and your choice of cheese. Build the toppings.",
      "Una carne de res, tocino y el queso que elijas. Arma los ingredientes.",
    ),
    image: "/menu/burger-combo.jpeg",
    imageAlt: t(
      "Cheeseburger with bacon, lettuce, and tomato beside fries",
      "Hamburguesa con queso, tocino, lechuga y tomate, con papas",
    ),
    fromPrice: 1200,
    price: 1200,
    groups: burgerGroups(300, t("Burger only", "Solo la hamburguesa")),
  },
  {
    id: "double",
    category: "burgers",
    name: t("Double hamburger", "Doble hamburguesa de res"),
    description: t(
      "Two beef patties, bacon, and melted cheese. The stacked one.",
      "Dos carnes de res, tocino y queso derretido. La doble.",
    ),
    image: "/menu/double-combo.jpeg",
    imageAlt: t(
      "Double cheeseburger with bacon in a basket of fries",
      "Hamburguesa doble con queso y tocino en una canasta de papas",
    ),
    fromPrice: 1400,
    price: 1400,
    groups: burgerGroups(300, t("Burger only", "Solo la hamburguesa")),
  },
  {
    id: "onion",
    category: "burgers",
    name: t("Onion-wrapped burger", "Hamburguesa envuelta en cebolla"),
    description: t(
      "Grilled onions wrapped around the patty, plus bacon and cheese.",
      "Cebolla a la parrilla envolviendo la carne, más tocino y queso.",
    ),
    image: "/menu/burger-only.jpeg",
    imageAlt: t(
      "Beef burger with melted cheese and grilled onions",
      "Hamburguesa de res con queso derretido y cebolla a la parrilla",
    ),
    fromPrice: 1200,
    price: 1200,
    groups: burgerGroups(200, t("Burger only", "Solo la hamburguesa")),
  },
  {
    id: "pork-sandwich",
    category: "burgers",
    name: t("Pork steak sandwich", "Pan con bistec de puerco"),
    description: t(
      "Pork steak on bread with the toppings you want.",
      "Bistec de puerco en pan, con los ingredientes que quieras.",
    ),
    image: "/menu/cuban-plate.jpeg",
    imageAlt: t(
      "Grilled steak with onions, rice, fries, and tomato",
      "Bistec a la parrilla con cebolla, arroz, papas y tomate",
    ),
    fromPrice: 1000,
    price: 1000,
    groups: [
      serving(t("Sandwich only", "Solo el sándwich"), 300),
      toppings,
      optionalSauces,
      drink(comboOnly),
      fries(comboOnly),
    ],
  },
  {
    id: "philly-steak",
    category: "cheesesteaks",
    name: t("Steak cheesesteak", "Cheesesteak de carne"),
    description: t(
      "Chopped steak, grilled onions, and grilled peppers. Fries and a drink included.",
      "Carne picada, cebolla y pimientos a la parrilla. Incluye papas y bebida.",
    ),
    image: "/menu/philly-steak.jpeg",
    imageAlt: t(
      "Steak cheesesteak cut in half with peppers, onions, and fries",
      "Cheesesteak de carne partido por la mitad, con pimientos, cebolla y papas",
    ),
    fromPrice: 1600,
    price: 1600,
    groups: phillyGroups(),
  },
  {
    id: "philly-chicken",
    category: "cheesesteaks",
    name: t("Chicken cheesesteak", "Cheesesteak de pollo"),
    description: t(
      "The same 10-inch roll, built with chicken. Fries and a drink included.",
      "El mismo pan de 10 pulgadas, con pollo. Incluye papas y bebida.",
    ),
    image: "/menu/philly-chicken.jpeg",
    imageAlt: t(
      "Chicken cheesesteak with grilled peppers and fries",
      "Cheesesteak de pollo con pimientos a la parrilla y papas",
    ),
    fromPrice: 1400,
    price: 1400,
    groups: phillyGroups(),
  },
  {
    id: "wings-8",
    category: "wings",
    name: t("8 wings", "8 alitas"),
    description: t(
      "Eight wings. The combo adds fries and a drink.",
      "Ocho alitas. El combo agrega papas y una bebida.",
    ),
    image: "/menu/wings-8.jpeg",
    imageAlt: t(
      "Sauced chicken wings with fries",
      "Alitas con salsa y papas fritas",
    ),
    fromPrice: 1000,
    price: 1000,
    groups: wingGroups(300),
  },
  {
    id: "wings-10",
    category: "wings",
    name: t("10 wings", "10 alitas"),
    description: t(
      "Ten wings. The combo adds fries and a drink.",
      "Diez alitas. El combo agrega papas y una bebida.",
    ),
    image: "/menu/wings-10.jpeg",
    imageAlt: t(
      "Glazed wings in a tray with fries and two sauces",
      "Alitas glaseadas con papas y dos salsas",
    ),
    fromPrice: 1300,
    price: 1300,
    groups: wingGroups(200),
  },
  {
    id: "wings-12",
    category: "wings",
    name: t("12 wings", "12 alitas"),
    description: t(
      "Twelve wings. The combo adds fries and a drink.",
      "Doce alitas. El combo agrega papas y una bebida.",
    ),
    image: "/menu/wings-12.jpeg",
    imageAlt: t(
      "A larger order of sauced chicken wings with fries",
      "Una orden grande de alitas con salsa y papas",
    ),
    fromPrice: 1500,
    price: 1500,
    groups: wingGroups(200),
  },
  {
    id: "pork-plate",
    category: "plates",
    name: t("Pork steak plate", "Plato de cerdo"),
    description: t(
      "Pork steak with fries, salad, rice, and a drink.",
      "Bistec de cerdo con papas, ensalada, arroz y una bebida.",
    ),
    image: "/menu/cuban-plate.jpeg",
    imageAlt: t(
      "Pork steak plate with rice, fries, onions, and tomato",
      "Plato de bistec de cerdo con arroz, papas, cebolla y tomate",
    ),
    fromPrice: 1500,
    price: 1500,
    groups: [rice, drink(), fries()],
  },
  {
    id: "chicken-plate",
    category: "plates",
    name: t("Chicken breast plate", "Pechuga de pollo"),
    description: t(
      "Chicken breast with fries, salad, rice, and a drink.",
      "Pechuga de pollo con papas, ensalada, arroz y una bebida.",
    ),
    image: "/menu/fajitas.jpeg",
    imageAlt: t(
      "Sliced grilled chicken with rice, black beans, fries, and tomato",
      "Pollo a la parrilla con arroz, frijoles negros, papas y tomate",
    ),
    fromPrice: 1500,
    price: 1500,
    groups: [rice, drink(), fries()],
  },
  {
    id: "fajitas",
    category: "plates",
    name: t("Chicken fajitas", "Fajitas de pollo"),
    description: t(
      "Chicken with grilled onions and peppers, plus fries, salad, rice, and a drink.",
      "Pollo con cebolla y pimientos a la parrilla, más papas, ensalada, arroz y una bebida.",
    ),
    image: "/menu/fajitas.jpeg",
    imageAlt: t(
      "Chicken fajitas with grilled onions, peppers, rice, and fries",
      "Fajitas de pollo con cebolla, pimientos, arroz y papas",
    ),
    fromPrice: 1500,
    price: 1500,
    groups: [rice, drink(), fries()],
  },
  {
    id: "ny-steak",
    category: "plates",
    name: t("12 oz New York steak", "Bistec New York de 12 oz"),
    description: t(
      "A 12-ounce New York steak with fries, salad, rice, and a drink.",
      "Bistec New York de 12 onzas con papas, ensalada, arroz y una bebida.",
    ),
    image: "/menu/ny-steak.jpeg",
    imageAlt: t(
      "Sliced New York steak with white rice, fries, and tomato salad",
      "Bistec New York en tiras con arroz blanco, papas y ensalada de tomate",
    ),
    fromPrice: 2500,
    price: 2500,
    groups: [rice, drink(), fries()],
  },
  {
    id: "papas",
    category: "sides",
    name: t("Papas Locas", "Papas Locas"),
    description: t(
      "Fries loaded with ham, steak, chicken, cheese, mayo-ketchup, and bacon.",
      "Papas cargadas con jamón, carne, pollo, queso, mayo-ketchup y tocino.",
    ),
    image: "/menu/papas-locas.jpeg",
    imageAlt: t(
      "Fries covered in chopped steak, ham, bacon, and cheese sauce",
      "Papas cubiertas de carne, jamón, tocino y salsa de queso",
    ),
    fromPrice: 1500,
    price: 1500,
    groups: [],
  },
  {
    id: "fries",
    category: "sides",
    name: t("Fries", "Papas fritas"),
    description: t("A side of crispy fries.", "Una orden de papas fritas."),
    image: "/menu/fries.jpg",
    imageAlt: t("A side of crispy french fries", "Una orden de papas fritas crujientes"),
    fromPrice: 700,
    price: 700,
    groups: [optionalSauces],
  },
  {
    id: "loaded-fries",
    category: "sides",
    name: t("Cheese and bacon fries", "Papas con queso y tocino"),
    description: t(
      "Fries with cheese and bacon.",
      "Papas con queso y tocino.",
    ),
    image: "/menu/fries.jpg",
    imageAlt: t(
      "Crispy french fries, the side that gets cheese and bacon",
      "Papas fritas crujientes, la orden con queso y tocino",
    ),
    fromPrice: 1000,
    price: 1000,
    groups: [optionalSauces],
  },
  {
    id: "water",
    category: "drinks",
    name: t("Water", "Agua"),
    description: t("A bottle of water.", "Una botella de agua."),
    imageAlt: t("Water", "Agua"),
    fromPrice: 200,
    price: 200,
    groups: [],
  },
  {
    id: "soda",
    category: "drinks",
    name: t("Soda or juice", "Refresco o jugo"),
    description: t(
      "Coke, Sprite, Fanta, lemonade, Dr Pepper, Pepsi, Jupiña, Kola Champagne, mango, or guava.",
      "Coca-Cola, Sprite, Fanta, limonada, Dr Pepper, Pepsi, Jupiña, Kola Champagne, mango o guayaba.",
    ),
    imageAlt: t("Soda or juice", "Refresco o jugo"),
    fromPrice: 300,
    price: 300,
    groups: [
      {
        id: "flavor",
        name: t("Flavor", "Sabor"),
        min: 1,
        max: 1,
        options: drinks.filter((drinkOption) => drinkOption.id !== "water"),
      },
    ],
  },
];

export function getItem(id: string) {
  const item = menu.find((entry) => entry.id === id);
  if (!item) throw new Error(`Unknown menu item: ${id}`);
  return item;
}
