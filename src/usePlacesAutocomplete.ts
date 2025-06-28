import { useCallback, useEffect, useRef, useState } from 'react';
import { Loader } from '@googlemaps/js-api-loader';
import _debounce from './debounce';
import useLatest from './useLatest';

export interface HookArgs {
  apiKey: string;
  requestOptions?: Omit<google.maps.places.AutocompleteRequest, 'input'>;
  debounce?: number;
  cache?: number | false;
  defaultValue?: string;
}

export type Suggestion = google.maps.places.PlacePrediction;

export type Status = `${google.maps.places.PlacesServiceStatus}` | '';

export interface Suggestions {
  readonly loading: boolean;
  readonly status: Status;
  data: Suggestion[];
}

export interface SetValue {
  (val: string, shouldFetchData?: boolean): void;
}

export interface HookReturn {
  ready: boolean;
  value: string;
  suggestions: Suggestions;
  setValue: SetValue;
  clearSuggestions: () => void;
  clearCache: (key?: string) => void;
  completeSession: () => void;
}

export const loadApiErr =
  '💡 use-places-autocomplete: Google Maps Places API library must be loaded. See: https://github.com/wellyshen/use-places-autocomplete#load-the-library';

const usePlacesAutocomplete = ({
  apiKey,
  requestOptions,
  debounce = 200,
  cache = 24 * 60 * 60,
  defaultValue = '',
}: HookArgs): HookReturn => {
  const [ready, setReady] = useState(false);
  const [value, setVal] = useState(defaultValue);
  const [suggestions, setSuggestions] = useState<Suggestions>({
    loading: false,
    status: '',
    data: [],
  });

  const loaderRef = useRef<Loader | null>(null);

  const placesLibRef = useRef<google.maps.PlacesLibrary | null>(null);

  const requestOptionsRef = useLatest(requestOptions);

  const init = useCallback(() => {
    if (loaderRef.current) {
      return;
    }

    const loadPlacesLib = async () => {
      loaderRef.current = new Loader({
        apiKey,
        version: 'weekly',
      });

      try {
        const placesLib = await loaderRef.current.importLibrary('places');
        placesLibRef.current = placesLib;
        setReady(true);
      } catch (err) {
        console.error(loadApiErr);
      }
      setReady(true);
    };

    loadPlacesLib();
  }, [apiKey]);

  const sessionTokenRef =
    useRef<google.maps.places.AutocompleteSessionToken | null>(null);

  const completeSession = () => {
    if (sessionTokenRef.current) {
      sessionTokenRef.current = null;
    }
  };

  const clearSuggestions = useCallback(() => {
    setSuggestions({ loading: false, status: '', data: [] });
  }, []);

  const cacheRef = useRef<
    Record<string, { data: Suggestion[]; maxAge: number }>
  >({});

  const clearCache = useCallback(() => {
    cacheRef.current = {};
  }, []);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const fetchPredictions = useCallback(
    _debounce(async (val: string) => {
      if (!placesLibRef.current) {
        console.error(loadApiErr);
        return;
      }

      if (!sessionTokenRef.current) {
        sessionTokenRef.current =
          new placesLibRef.current.AutocompleteSessionToken();
      }

      if (!val) {
        clearSuggestions();
        return;
      }

      setSuggestions((prevState) => ({ ...prevState, isLoading: true }));

      if (cache) {
        // Only keep the cache data that is still valid
        cacheRef.current = Object.keys(cacheRef.current).reduce(
          (acc: typeof cacheRef.current, key) => {
            if (cacheRef.current[key].maxAge - Date.now() >= 0) {
              acc[key] = cacheRef.current[key];
            }
            return acc;
          },
          {}
        );

        if (cacheRef.current[val]) {
          setSuggestions({
            loading: false,
            status: 'OK',
            data: cacheRef.current[val].data,
          });
          return;
        }
      }

      // If there is no cache data, fetch the suggestions from the API
      const fetchReq: google.maps.places.AutocompleteRequest = {
        sessionToken: sessionTokenRef.current,
        language: 'en',
        input: val,
        ...requestOptionsRef.current,
      };

      try {
        const { suggestions: suggestionsRes } =
          await placesLibRef.current.AutocompleteSuggestion.fetchAutocompleteSuggestions(
            fetchReq
          );

        const placePredictions = suggestionsRes.reduce<Suggestion[]>(
          (acc, suggestion) => {
            if (suggestion.placePrediction) {
              acc.push(suggestion.placePrediction);
            }
            return acc;
          },
          []
        );

        setSuggestions({
          loading: false,
          status: 'OK',
          data: placePredictions,
        });

        if (cache) {
          cacheRef.current[val] = {
            data: placePredictions,
            maxAge: Date.now() + cache * 1000,
          };
        }
      } catch (err) {
        console.error('Error fetching Google Place predictions');
        setSuggestions({
          loading: false,
          status: 'UNKNOWN_ERROR',
          data: [],
        });
      }
    }, debounce),
    [cache, clearSuggestions, requestOptionsRef]
  );

  const setValue: SetValue = useCallback(
    (val, shouldFetchData = true) => {
      setVal(val);
      if (shouldFetchData) {
        fetchPredictions(val);
      }
    },
    [fetchPredictions]
  );

  useEffect(() => {
    init();
  }, [init]);

  return {
    ready,
    value,
    suggestions,
    setValue,
    clearSuggestions,
    clearCache,
    completeSession,
  };
};

export default usePlacesAutocomplete;
