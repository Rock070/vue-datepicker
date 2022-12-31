const getTimeLocale = (
  date: Date,
  locale: Intl.LocalesArgument,
  options?: Intl.DateTimeFormatOptions
) => {
  let str = '';
  try {
    str = date.toLocaleString(locale, options);
  } catch (err) {
    str = date.toLocaleString('en', options);
    // eslint-disable-next-line no-console
    console.warn(
      '[Datepicker warning] The locale props should be a string with a BCP 47 language tag, or an array of such strings.'
    );
  }
  return str;
};

export default getTimeLocale;
