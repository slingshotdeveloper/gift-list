import { useEffect, useState } from "react";

interface IMinWidthQuery {
  'min-width': number;
}

interface IMaxWidthQuery {
  'max-width': number;
}

interface IWidthRangeQuery extends IMaxWidthQuery, IMinWidthQuery {}

type WidthQuery = IMaxWidthQuery | IMinWidthQuery | IWidthRangeQuery;

type Query = WidthQuery;

export const useMediaQuery = (query: Query): boolean => {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    let mediaQueryString = '';
    
    if ('min-width' in query && 'max-width' in query) {
      mediaQueryString = `(min-width: ${query['min-width']}px) and (max-width: ${query['max-width']}px)`;
    } else if ('min-width' in query) {
      mediaQueryString = `(min-width: ${query['min-width']}px)`;
    } else if ('max-width' in query) {
      mediaQueryString = `(max-width: ${query['max-width']}px)`;
    }

    const mediaQueryList = window.matchMedia(mediaQueryString);
    setMatches(mediaQueryList.matches);

    const handleChange = () => setMatches(mediaQueryList.matches);
    mediaQueryList.addEventListener('change', handleChange);

    return () => mediaQueryList.removeEventListener('change', handleChange);
  }, [query]);

  return matches;
};
