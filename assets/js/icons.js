/* =========================================================
   icons.js: ícones vetoriais (sem emoji), traçados em currentColor
   ========================================================= */
const Icons = (() => {
  const P = {
    /* navegação e ações */
    home: '<path d="M4 10.8 12 4l8 6.8V19a1 1 0 0 1-1 1h-4v-6H9v6H5a1 1 0 0 1-1-1z"/>',
    chart: '<path d="M4 20V9M10 20V4M16 20v-7M22 20H2"/>',
    trending: '<path d="M3 16.5 9 10l4 3.5L21 6"/><path d="M15.5 6H21v5.2"/>',
    user: '<circle cx="12" cy="8" r="3.6"/><path d="M4.8 20a7.2 7.2 0 0 1 14.4 0"/>',
    users: '<circle cx="9" cy="8" r="3.3"/><path d="M2.8 20a6.2 6.2 0 0 1 12.4 0"/><path d="M16 5.4a3.3 3.3 0 0 1 0 5.2M17.6 14.6A6.2 6.2 0 0 1 21.2 20"/>',
    menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
    check: '<path d="m5 12.8 4.4 4.4L19 7.6"/>',
    close: '<path d="M6.5 6.5 17.5 17.5M17.5 6.5 6.5 17.5"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    chevron: '<path d="m9.5 5.5 6.5 6.5-6.5 6.5"/>',
    arrow: '<path d="M4 12h15M13.5 6.5 20 12l-6.5 5.5"/>',
    bell: '<path d="M6.5 10a5.5 5.5 0 0 1 11 0c0 3.4 1.2 5 1.9 5.8a.6.6 0 0 1-.4 1H5a.6.6 0 0 1-.4-1c.7-.8 1.9-2.4 1.9-5.8z"/><path d="M10 19.5a2.2 2.2 0 0 0 4 0"/>',
    clock: '<circle cx="12" cy="12" r="8.4"/><path d="M12 7.4V12l3 2"/>',
    pencil: '<path d="m4 20 1.1-4.2L15.6 5.3a1.6 1.6 0 0 1 2.3 0l1 1a1.6 1.6 0 0 1 0 2.3L8.4 19 4 20z"/>',
    trash: '<path d="M4.5 7h15M9.5 7V5.2A1.2 1.2 0 0 1 10.7 4h2.6a1.2 1.2 0 0 1 1.2 1.2V7"/><path d="M6.4 7 7.3 19a1.4 1.4 0 0 0 1.4 1.3h6.6A1.4 1.4 0 0 0 16.7 19L17.6 7"/>',
    lock: '<rect x="4.6" y="10.4" width="14.8" height="9.4" rx="2.2"/><path d="M8.2 10.4V7.8a3.8 3.8 0 0 1 7.6 0v2.6"/>',
    logout: '<path d="M14.5 4.5H6.4A1.4 1.4 0 0 0 5 5.9v12.2a1.4 1.4 0 0 0 1.4 1.4h8.1"/><path d="M15.5 8.5 19.5 12l-4 3.5M19 12H9.5"/>',
    refresh: '<path d="M20 12a8 8 0 1 1-2.6-5.9"/><path d="M20 4v4.4h-4.4"/>',
    eye: '<path d="M2.6 12S6.4 6 12 6s9.4 6 9.4 6-3.8 6-9.4 6-9.4-6-9.4-6z"/><circle cx="12" cy="12" r="2.9"/>',
    eyeOff: '<path d="M4 4.5 20 19.5"/><path d="M9.4 9.6A2.9 2.9 0 0 0 12 14.9M6.5 7C4.2 8.6 2.6 12 2.6 12s3.8 6 9.4 6c1.6 0 3-.4 4.2-1"/><path d="M18.6 15.4c1.7-1.6 2.8-3.4 2.8-3.4S17.6 6 12 6c-.8 0-1.5.1-2.2.3"/>',
    chat: '<path d="M20 12.4c0 3.5-3.6 6.3-8 6.3a9.6 9.6 0 0 1-2.6-.3L5 20l1.2-3.1A5.9 5.9 0 0 1 4 12.4C4 8.9 7.6 6 12 6s8 2.9 8 6.4z"/>',
    clipboard: '<rect x="5.2" y="5.4" width="13.6" height="15" rx="2.2"/><path d="M9 5.4V4.6A1.4 1.4 0 0 1 10.4 3.2h3.2A1.4 1.4 0 0 1 15 4.6v.8"/><path d="M9 11.5h6M9 15.2h4"/>',
    folder: '<path d="M3.5 7.4a1.6 1.6 0 0 1 1.6-1.6h3.6l2 2.4h7.7a1.6 1.6 0 0 1 1.6 1.6v7.8a1.6 1.6 0 0 1-1.6 1.6H5.1a1.6 1.6 0 0 1-1.6-1.6z"/>',
    wallet: '<rect x="3.4" y="6.2" width="17.2" height="12.4" rx="2.4"/><path d="M3.4 10h17.2"/><circle cx="16.6" cy="14.2" r="1.3"/>',
    banknote: '<rect x="2.8" y="6.6" width="18.4" height="10.8" rx="2"/><circle cx="12" cy="12" r="2.6"/><path d="M6 12h.01M18 12h.01"/>',
    calendar: '<rect x="3.8" y="5.6" width="16.4" height="14.2" rx="2.2"/><path d="M3.8 10h16.4M8.4 3.6v3.4M15.6 3.6v3.4"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2.8v2.4M12 18.8v2.4M2.8 12h2.4M18.8 12h2.4M5.6 5.6l1.7 1.7M16.7 16.7l1.7 1.7M18.4 5.6l-1.7 1.7M7.3 16.7l-1.7 1.7"/>',
    moon: '<path d="M20 14.2A8.2 8.2 0 0 1 9.8 4a8.4 8.4 0 1 0 10.2 10.2z"/>',
    speaker: '<path d="M4.6 9.4h3.2l5-3.8v12.8l-5-3.8H4.6z"/><path d="M16.4 9.2a4 4 0 0 1 0 5.6M19 6.8a7.6 7.6 0 0 1 0 10.4"/>',
    speakerOff: '<path d="M4.6 9.4h3.2l5-3.8v12.8l-5-3.8H4.6z"/><path d="M16.6 9.6l4.8 4.8M21.4 9.6l-4.8 4.8"/>',
    camera: '<path d="M3.4 8.8a1.8 1.8 0 0 1 1.8-1.8h2.2l1.3-2.2h6.6L16.6 7h2.2a1.8 1.8 0 0 1 1.8 1.8v8.6a1.8 1.8 0 0 1-1.8 1.8H5.2a1.8 1.8 0 0 1-1.8-1.8z"/><circle cx="12" cy="13" r="3.4"/>',
    image: '<rect x="3.6" y="4.8" width="16.8" height="14.4" rx="2.6"/><circle cx="9" cy="10" r="1.6"/><path d="m4.6 17.4 4.6-4.2 3.2 2.8 3-2.6 4 3.6"/>',
    coins: '<ellipse cx="9.2" cy="7.4" rx="5.6" ry="2.6"/><path d="M3.6 7.4v4.2c0 1.4 2.5 2.6 5.6 2.6s5.6-1.2 5.6-2.6V7.4"/><path d="M14.8 10.6c2.9.2 5 1.3 5 2.5v4.2c0 1.4-2.5 2.6-5.6 2.6-2.4 0-4.5-.7-5.3-1.7"/>',
    target: '<circle cx="12" cy="12" r="8.2"/><circle cx="12" cy="12" r="4.2"/><circle cx="12" cy="12" r=".9" fill="currentColor" stroke="none"/>',

    /* categorias */
    book: '<path d="M12 7.2C10.4 5.7 8.3 5 5.5 5a1 1 0 0 0-1 1v10.9a1 1 0 0 0 1 1c2.8 0 4.9.7 6.5 2.1 1.6-1.4 3.7-2.1 6.5-2.1a1 1 0 0 0 1-1V6a1 1 0 0 0-1-1c-2.8 0-4.9.7-6.5 2.2z"/><path d="M12 7.2V20"/>',
    house: '<path d="M4 10.8 12 4l8 6.8V19a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1z"/><path d="M9.6 20v-5.6h4.8V20"/>',
    heart: '<path d="M12 20.2S4.4 15.6 4.4 10.4A4.4 4.4 0 0 1 12 7.4a4.4 4.4 0 0 1 7.6 3c0 5.2-7.6 9.8-7.6 9.8z"/>',
    star: '<path d="m12 3.8 2.6 5.3 5.8.8-4.2 4.1 1 5.8-5.2-2.8-5.2 2.8 1-5.8L3.6 9.9l5.8-.8z"/>',
    ball: '<circle cx="12" cy="12" r="8.4"/><path d="m12 7.4 3.6 2.6-1.4 4.3H9.8L8.4 10z"/><path d="M12 3.6v3.8M4.4 9.4 8.4 10M19.6 9.4 15.6 10M7.6 19.6l2.2-5.3M16.4 19.6l-2.2-5.3"/>',
    music: '<path d="M9 17.4V6.2l10-2v11"/><circle cx="6.6" cy="17.6" r="2.6"/><circle cx="16.6" cy="15.4" r="2.6"/>',
    paw: '<ellipse cx="5.9" cy="11" rx="1.7" ry="2.1"/><ellipse cx="9.9" cy="8.4" rx="1.7" ry="2.2"/><ellipse cx="14.1" cy="8.4" rx="1.7" ry="2.2"/><ellipse cx="18.1" cy="11" rx="1.7" ry="2.1"/><path d="M12 13.2c2.5 0 4.4 1.8 4.4 3.8 0 1.6-1.3 2.5-2.7 2.1l-1.7-.5-1.7.5c-1.4.4-2.7-.5-2.7-2.1 0-2 1.9-3.8 4.4-3.8z"/>',
    leaf: '<path d="M20 4c0 8.4-4.6 12.6-10 12.6A4.6 4.6 0 0 1 7.4 8C11 5.4 15.6 5.8 20 4z"/><path d="M4.6 20c1.4-4 4-7 7.4-9.2"/>',
    drop: '<path d="M12 3.4s6.2 6.6 6.2 10.4a6.2 6.2 0 0 1-12.4 0C5.8 10 12 3.4 12 3.4z"/>',
    bed: '<path d="M3.4 19v-9M3.4 14.4h17.2V19"/><path d="M3.4 14.4v-3h11.4a5.8 5.8 0 0 1 5.8 5.8"/><circle cx="7.6" cy="10.4" r="1.9"/>',
    apple: '<path d="M12 8.4c-1-1.4-2.6-2-4.2-1.4C5.4 7.8 4.4 10.6 5.4 14c.8 2.8 2.6 5.4 4.4 5.4.8 0 1.4-.4 2.2-.4s1.4.4 2.2.4c1.8 0 3.6-2.6 4.4-5.4 1-3.4 0-6.2-2.4-7-1.6-.6-3.2 0-4.2 1.4z"/><path d="M12 8.4V5.6a2.4 2.4 0 0 1 2.4-2.4"/>',
    brain: '<path d="M12 3.4a6 6 0 0 0-3.5 10.9c.5.4.9 1 .9 1.7h5.2c0-.7.4-1.3.9-1.7A6 6 0 0 0 12 3.4z"/><path d="M9.6 18.4h4.8M10.6 20.8h2.8"/>',
    dumbbell: '<rect x="5" y="8.8" width="3" height="6.4" rx="1.1"/><rect x="16" y="8.8" width="3" height="6.4" rx="1.1"/><path d="M8 12h8M2.6 10.6v2.8M21.4 10.6v2.8"/>',
    basket: '<path d="M4 8.6h16l-1.5 9.6a1.6 1.6 0 0 1-1.6 1.4H7.1a1.6 1.6 0 0 1-1.6-1.4z"/><path d="m8.6 8.6 2.2-4.4M15.4 8.6l-2.2-4.4M10 12.6v3.4M14 12.6v3.4"/>',
    shower: '<path d="M4.4 20.4V7.4a3.2 3.2 0 0 1 6.4 0"/><path d="M8 7.4h12l-2 3.4H10z"/><path d="M11.2 14v1.8M14.6 14v1.8M18 14v1.8M12.9 17.8v1.8M16.3 17.8v1.8"/>',
    backpack: '<rect x="5" y="7.4" width="14" height="12.6" rx="3.4"/><path d="M8.6 7.4V6a3.4 3.4 0 0 1 6.8 0v1.4M9 20v-5.2h6V20M9 14.8h6"/>',
    puzzle: '<rect x="3.2" y="8.2" width="17.6" height="9.6" rx="4.4"/><path d="M8 11.4v3.2M6.4 13h3.2M15.2 12.2h.01M17.4 14.6h.01"/>',
    bike: '<circle cx="6" cy="16.6" r="3.6"/><circle cx="18" cy="16.6" r="3.6"/><path d="m6 16.6 4-8h5l3 8M9 8.6h4.4"/>',
    utensils: '<path d="M6.4 3.6v6.2a2 2 0 0 0 4 0V3.6M8.4 9.8V20"/><path d="M17 3.6c-1.6 1-2.4 2.8-2.4 5.2 0 1.8.8 2.8 2.4 3V20"/>',
    broom: '<path d="M4.4 8.6h15.2l-1.3 10.1a1.7 1.7 0 0 1-1.7 1.5H7.4a1.7 1.7 0 0 1-1.7-1.5z"/><path d="M8.2 8.6a3.8 3.8 0 0 1 7.6 0"/><path d="M4.4 12.2h15.2"/>',
    trophy: '<path d="M7.4 4.6h9.2v4.8a4.6 4.6 0 0 1-9.2 0z"/><path d="M7.4 6.4H5a2 2 0 0 0 2.4 3.8M16.6 6.4H19a2 2 0 0 1-2.4 3.8M10 14v2.4h4V14M8 20h8"/>',
    palette: '<path d="M12 3.6a8.4 8.4 0 0 0 0 16.8c1.4 0 2-1 2-2s-.6-1.6-.6-2.4c0-.8.6-1.4 1.4-1.4h1.6a3.6 3.6 0 0 0 3.6-3.6c0-4-3.6-7.4-8-7.4z"/><circle cx="8" cy="10.4" r="1"/><circle cx="12" cy="7.6" r="1"/><circle cx="15.8" cy="10" r="1"/>',
    hourglass: '<path d="M7 3.6h10M7 20.4h10"/><path d="M8 3.6c0 4 4 4.6 4 8.4s-4 4.4-4 8.4M16 3.6c0 4-4 4.6-4 8.4s4 4.4 4 8.4"/>',
    grid: '<rect x="3.6" y="3.6" width="7.4" height="7.4" rx="2.2"/><rect x="13" y="3.6" width="7.4" height="7.4" rx="2.2"/><rect x="3.6" y="13" width="7.4" height="7.4" rx="2.2"/><rect x="13" y="13" width="7.4" height="7.4" rx="2.2"/>',
  };

  const CATEGORY_ICONS = [
    'book', 'house', 'heart', 'star', 'target', 'ball', 'music', 'paw',
    'leaf', 'drop', 'bed', 'apple', 'brain', 'dumbbell', 'basket', 'shower',
    'backpack', 'puzzle', 'bike', 'utensils', 'broom', 'trophy', 'palette', 'pencil',
  ];

  /** devolve o markup do ícone; nomes desconhecidos caem em "star" */
  function svg(name, cls = '') {
    const inner = P[name] || P.star;
    return `<svg class="ico ${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${inner}</svg>`;
  }

  const has = (name) => Object.prototype.hasOwnProperty.call(P, name);

  return { svg, has, CATEGORY_ICONS };
})();
