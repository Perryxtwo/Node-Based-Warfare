import { BALANCE as B } from './balance.js';
export const NODE_TYPES = {
  regular: { name: 'Lowlands', icon: 'keep', hp: 1, speed: 1, description: 'Open land. No terrain modifiers.' },
  mountain: { name: 'Mountain', icon: 'mountain', hp: B.mountainHp, speed: B.mountainSpeed, description: '+40% base health · 25% slower travel' },
  river: { name: 'River crossing', icon: 'river', hp: 1, speed: B.riverSpeed, description: '30% slower travel to or from this node' },
};
