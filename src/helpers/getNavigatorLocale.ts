const getNavigatorLocale = () => {
  if (navigator.languages && navigator.languages.length) {
    for (const i of navigator.languages) if (i) return i;
  }
  return navigator.language || 'en';
};

export default getNavigatorLocale;
