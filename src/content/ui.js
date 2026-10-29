/** Button text, shape, dimensions, color and image overrides belong here.
 * CSS classes give defaults; style accepts any CSS property. IDs are permanent.
 */
export const BUTTONS = {
  start: { text: 'Raise your banner', icon: 'banner', className: 'primary', ref: 'setup.start' },
  pause: { text: 'Pause', icon: 'pause', ref: 'hud.pause' },
  routes: { text: 'Commit orders', icon: 'arrow', className: 'primary', ref: 'orders.commit' },
  clear: { text: 'Clear routes', ref: 'orders.clear' },
  research: { text: 'Research', ref: 'magic.research' },
  cast: { text: 'Cast spell', className: 'primary', ref: 'magic.cast' },
  help: { text: 'Field guide', icon: 'book', ref: 'tools.guide' },
  art: { text: 'Art workshop', icon: 'image', ref: 'tools.art' },
  inspect: { text: 'UI references', icon: 'eye', ref: 'tools.inspect' },
  new: { text: 'New campaign', icon: 'banner', ref: 'hud.new' },
};
