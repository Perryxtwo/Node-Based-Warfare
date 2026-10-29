export const UPGRADES = {
  gold: { label: 'Goldworks', subtitle: 'A stronger economy', icon: 'gold', min: 1, max: 5, costs: [4, 7, 15, 35], values: [0, 3, 2.5, 2, 1.5, 1], unit: 'seconds / gold' },
  barracks: { label: 'Barracks', subtitle: 'Raise your banners', icon: 'sword', min: 0, max: 5, costs: [3, 7, 9, 17, 35], values: [0, 1, 3, 5, 10, 19], unit: 'power / cycle' },
  hp: { label: 'Ramparts', subtitle: 'Hold the line', icon: 'shield', min: 1, max: 5, costs: [5, 16, 20, 35], values: [0, 5, 10, 20, 35, 55], unit: 'base health' },
};
