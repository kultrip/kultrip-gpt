export const storyDestinations = {
  'London': [
    { story: 'Harry Potter', description: 'Visit Platform 9¾, Warner Bros Studio Tour, and magical London locations' },
    { story: 'Sherlock Holmes', description: 'Explore 221B Baker Street, Scotland Yard, and Victorian London' },
    { story: 'Bridgerton', description: 'Discover Regency-era ballrooms, Bath, and aristocratic England' },
    { story: 'The Crown', description: 'Tour Buckingham Palace, royal residences, and British history' },
    { story: 'Paddington', description: 'Follow the bear through London\'s most charming neighborhoods' },
  ],
  'Paris': [
    { story: 'Emily in Paris', description: 'Chic cafés, fashion districts, and Instagram-perfect spots' },
    { story: 'The Da Vinci Code', description: 'Louvre mysteries, cryptic symbols, and historical churches' },
    { story: 'Amélie', description: 'Montmartre charm, quirky cafés, and romantic Paris' },
    { story: 'Midnight in Paris', description: 'Literary haunts, vintage bookshops, and artistic neighborhoods' },
  ],
  'New Zealand': [
    { story: 'Lord of the Rings', description: 'Middle-earth landscapes, Hobbiton, and epic filming locations' },
    { story: 'The Hobbit', description: 'Shire adventures, mountain ranges, and fantasy realms' },
  ],
  'Mexico': [
    { story: 'Frida Kahlo', description: 'Casa Azul, artistic Mexico City, and Frida\'s colorful world' },
    { story: 'Coco', description: 'Day of the Dead traditions, vibrant culture, and family heritage' },
  ],
  'Verona': [
    { story: 'Romeo & Juliet', description: 'Juliet\'s balcony, romantic squares, and Renaissance beauty' },
  ],
  'Iceland': [
    { story: 'Game of Thrones', description: 'Beyond the Wall locations, dramatic landscapes, and Nordic wilderness' },
  ],
  'Madrid': [
    { story: 'Money Heist', description: 'Royal Mint, Bank of Spain, and heist filming locations' },
  ],
  'Spain': [
    { story: 'Money Heist', description: 'Barcelona, Madrid, and iconic Spanish heist locations' },
  ],
  'Colombia': [
    { story: 'Narcos', description: 'Medellín transformation, history tours, and modern Colombia' },
    { story: 'Encanto', description: 'Colorful colonial towns, magical realism, and vibrant culture' },
  ],
  'Norway': [
    { story: 'Vikings', description: 'Viking heritage sites, fjords, and Norse mythology' },
    { story: 'Frozen', description: 'Arendelle-inspired landscapes and winter wonderland' },
  ],
  'Germany': [
    { story: 'Dark', description: 'Winden-like towns, mysterious forests, and time-bending locations' },
  ],
  'Indiana': [
    { story: 'Stranger Things', description: 'Small-town America, retro diners, and 80s nostalgia' },
  ],
  'Albuquerque': [
    { story: 'Breaking Bad', description: 'Walter White\'s house, Los Pollos Hermanos, and desert locations' },
  ],
  'New York': [
    { story: 'Friends', description: 'Central Perk, apartments, and iconic NYC locations' },
    { story: 'Gossip Girl', description: 'Upper East Side luxury, Met steps, and Manhattan glamour' },
    { story: 'Sex and the City', description: 'Carrie\'s stoop, trendy restaurants, and fashionable NYC' },
  ],
  'Scotland': [
    { story: 'Outlander', description: 'Highland landscapes, castles, and time-travel romance' },
    { story: 'Brave', description: 'Scottish castles, wild landscapes, and Celtic heritage' },
  ],
  'Italy': [
    { story: 'The Godfather', description: 'Sicily, Corleone village, and Italian-American heritage' },
    { story: 'Roman Holiday', description: 'Rome\'s iconic sites, Vespa rides, and classic romance' },
    { story: 'Call Me By Your Name', description: 'Northern Italy summer, villa life, and romantic landscapes' },
  ],
  'Ireland': [
    { story: 'Game of Thrones', description: 'Winterfell locations, Dark Hedges, and Irish filming sites' },
  ],
  'Japan': [
    { story: 'Lost in Translation', description: 'Tokyo\'s neon nights, quiet moments, and modern Japan' },
    { story: 'Spirited Away', description: 'Traditional bathhouses, temples, and magical Japan' },
  ],
  'Greece': [
    { story: 'Mamma Mia!', description: 'Skopelos island, beautiful beaches, and ABBA musical magic' },
  ],
  'Croatia': [
    { story: 'Game of Thrones', description: 'King\'s Landing in Dubrovnik and Adriatic coast' },
  ],
};

export function getStoriesForDestination(destination: string): Array<{story: string, description: string}> | null {
  const normalizedDest = Object.keys(storyDestinations).find(
    key => key.toLowerCase() === destination.toLowerCase()
  );

  if (normalizedDest) {
    return storyDestinations[normalizedDest as keyof typeof storyDestinations];
  }

  return null;
}

export function getDestinationForStory(story: string): string | null {
  for (const [destination, stories] of Object.entries(storyDestinations)) {
    const found = stories.find(s =>
      s.story.toLowerCase().includes(story.toLowerCase()) ||
      story.toLowerCase().includes(s.story.toLowerCase())
    );
    if (found) return destination;
  }
  return null;
}
