import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import _debounce from '../debounce';
import type { HookArgs } from '../usePlacesAutocomplete';
import usePlacesAutocomplete from '../usePlacesAutocomplete';

vi.useFakeTimers();
vi.mock('../debounce');

// @ts-expect-error
_debounce.mockImplementation((fn) => fn);

const renderHelper = (args: HookArgs = { apiKey: '' }) =>
  renderHook(() => usePlacesAutocomplete({ ...args })).result;

const ok = 'OK';
const error = 'ERROR';
const data = [{ place_id: '0109' }];
// const okSuggestions = {
//   loading: false,
//   status: ok,
//   data,
// };
const defaultSuggestions = {
  loading: false,
  status: '',
  data: [],
};
const getPlacePredictions = vi.fn();
const getMaps = (type = 'success', d = data): any => ({
  maps: {
    places: {
      AutocompleteService: class {
        getPlacePredictions =
          type === 'opts'
            ? getPlacePredictions
            : (_: any, cb: (dataArg: any, status: string) => void) => {
                setTimeout(() => {
                  cb(
                    type === 'success' ? d : null,
                    type === 'success' ? ok : error
                  );
                }, 500);
              };
      },
    },
  },
});

describe('usePlacesAutocomplete', () => {
  beforeEach(() => {
    vi.clearAllTimers();
    globalThis.google = getMaps();
    getPlacePredictions.mockClear();
    // @ts-expect-error
    _debounce.mockClear();
  });

  it('should set debounce correctly', () => {
    renderHelper();
    expect(_debounce).toHaveBeenCalledWith(expect.any(Function), 200);

    const debounce = 500;
    renderHelper({ apiKey: '', debounce });
    expect(_debounce).toHaveBeenCalledWith(expect.any(Function), debounce);
  });

  // it('should set "requestOptions" correctly', () => {
  //   globalThis.google = getMaps("opts");
  //   const opts: Partial<google.maps.places.AutocompleteRequest> = {
  //     includedPrimaryTypes: ["street_address"],
  //   };
  //   const result = renderHelper({ apiKey: "", requestOptions: opts });
  //   act(() => result.current.setValue("test"));
  //   expect(getPlacePredictions).toHaveBeenCalledWith(
  //     { ...opts, input: "test" },
  //     expect.any(Function)
  //   );
  // });

  it('should return "ready" correctly', () => {
    console.error = () => null;

    // @ts-ignore
    delete globalThis.google;
    let res = renderHelper({ apiKey: '' });
    expect(res.current.ready).toBeTruthy();

    // res = renderHelper();
    // expect(res.current.ready).toBeFalsy();

    globalThis.google = getMaps();
    res = renderHelper();
    expect(res.current.ready).toBeTruthy();
  });

  it('should return "value" correctly', () => {
    let result = renderHelper();
    expect(result.current.value).toBe('');

    const defaultValue = 'Welly';
    result = renderHelper({ apiKey: '', defaultValue });
    expect(result.current.value).toBe(defaultValue);

    act(() => {
      result.current.setValue('test');
      vi.runAllTimers();
    });
    expect(result.current.value).toBe('test');
  });

  it('should return "suggestions" correctly', () => {
    const res = renderHelper();
    expect(res.current.suggestions).toEqual(defaultSuggestions);

    act(() => res.current.setValue(''));
    expect(res.current.suggestions).toEqual(defaultSuggestions);

    act(() => res.current.setValue('test', false));
    expect(res.current.suggestions).toEqual(defaultSuggestions);

    // act(() => res.current.setValue("test"));
    // expect(res.current.suggestions).toEqual({
    //   ...defaultSuggestions,
    //   loading: true,
    // });

    // act(() => {
    //   res.current.setValue("test");
    //   vi.runAllTimers();
    // });
    // expect(res.current.suggestions).toEqual(okSuggestions);

    // globalThis.google = getMaps("failure");
    // res = renderHelper();
    // act(() => {
    //   res.current.setValue("test");
    //   vi.runAllTimers();
    // });
    // expect(res.current.suggestions).toEqual({
    //   loading: false,
    //   status: error,
    //   data: [],
    // });
  });

  // it('should return "suggestions" with cache correctly', () => {
  //   let res = renderHelper({ apiKey: "", cache: 0 });
  //   act(() => {
  //     res.current.setValue("prev");
  //     vi.runAllTimers();
  //   });
  //   expect(res.current.suggestions).toEqual(okSuggestions);

  //   vi.setSystemTime(0);
  //   const cachedData = [{ place_id: "1119" }];
  //   globalThis.google = getMaps("success", cachedData);
  //   res = renderHelper({ apiKey: "", cache: 10 });
  //   act(() => {
  //     res.current.setValue("prev");
  //     vi.runAllTimers();
  //   });
  //   expect(res.current.suggestions).toEqual({
  //     ...okSuggestions,
  //     data: cachedData,
  //   });

  //   globalThis.google = getMaps();
  //   res = renderHelper({ apiKey: "", cache: 10 });
  //   act(() => {
  //     res.current.setValue("prev");
  //     vi.runAllTimers();
  //   });
  //   expect(res.current.suggestions).toEqual({
  //     ...okSuggestions,
  //     data: cachedData,
  //   });

  //   vi.setSystemTime(100000);
  //   act(() => {
  //     res.current.setValue("next");
  //     vi.runAllTimers();
  //   });
  //   act(() => {
  //     res.current.setValue("prev");
  //     vi.runAllTimers();
  //   });
  //   expect(res.current.suggestions).toEqual(okSuggestions);
  // });

  // it("should allow custom cache names", () => {
  //   const CACHE_KEY_1 = "cache1";
  //   const CACHE_KEY_2 = "cache2";
  //   vi.setSystemTime(0);
  //   // Queue up some cached data
  //   const cachedData = [{ place_id: "1119" }];
  //   globalThis.google = getMaps("success", cachedData);
  //   const res1 = renderHelper({ cache: 10, cacheKey: CACHE_KEY_1 });
  //   act(() => {
  //     res1.current.setValue("foo");
  //     vi.runAllTimers();
  //   });
  //   // Ensure we're actually getting cached data by resetting getMaps mock
  //   globalThis.google = getMaps();
  //   act(() => {
  //     res1.current.setValue("foo");
  //     vi.runAllTimers();
  //   });
  //   expect(res1.current.suggestions).toEqual({
  //     ...okSuggestions,
  //     data: cachedData,
  //   });

  //   // Set up a 2nd helper with a different cache key
  //   const res2 = renderHelper({ cache: 10, cacheKey: CACHE_KEY_2 });
  //   act(() => {
  //     res2.current.setValue("foo");
  //     vi.runAllTimers();
  //   });
  //   expect(res2.current.suggestions).toEqual(okSuggestions);

  //   // Finally, make sure the original cache key still works
  //   const res3 = renderHelper({ cache: 10, cacheKey: CACHE_KEY_1 });
  //   act(() => {
  //     res3.current.setValue("foo");
  //     vi.runAllTimers();
  //   });
  //   expect(res3.current.suggestions).toEqual({
  //     ...okSuggestions,
  //     data: cachedData,
  //   });
  // });

  // it("should clear cache", () => {
  //   const cachedData = [{ place_id: "1119" }];
  //   globalThis.google = getMaps("success", cachedData);
  //   let res = renderHelper({ apiKey: "", cache: 10 });
  //   act(() => {
  //     res.current.setValue("prev");
  //     vi.runAllTimers();
  //   });
  //   expect(res.current.suggestions).toEqual({
  //     ...okSuggestions,
  //     data: cachedData,
  //   });

  //   globalThis.google = getMaps();
  //   res = renderHelper({ apiKey: "", cache: 10 });
  //   res.current.clearCache("other_key");
  //   act(() => {
  //     res.current.setValue("prev");
  //     vi.runAllTimers();
  //   });
  //   expect(res.current.suggestions).toEqual({
  //     ...okSuggestions,
  //     data: cachedData,
  //   });

  //   globalThis.google = getMaps();
  //   res = renderHelper({ apiKey: "", cache: 10 });
  //   res.current.clearCache();
  //   act(() => {
  //     res.current.setValue("prev");
  //     vi.runAllTimers();
  //   });
  //   expect(res.current.suggestions).toEqual(okSuggestions);
  // });

  it('should clear suggestions', () => {
    const result = renderHelper();
    act(() => {
      result.current.setValue('test');
      vi.runAllTimers();
    });
    // expect(result.current.suggestions).toEqual(okSuggestions);

    act(result.current.clearSuggestions);
    expect(result.current.suggestions).toEqual(defaultSuggestions);
  });

  it('should not fetch data if places API not ready', () => {
    console.error = vi.fn();

    // @ts-ignore
    delete globalThis.google;
    const result = renderHelper();
    act(() => result.current.setValue('test'));
    expect(result.current.suggestions).toEqual(defaultSuggestions);
  });
});
