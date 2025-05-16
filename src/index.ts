import usePlacesAutocomplete from "./usePlacesAutocomplete";

export default usePlacesAutocomplete;
export { usePlacesAutocomplete };
export { getGeocode, getLatLng, getZipCode, getDetails } from "./utils";
export type {
  HookArgs,
  HookReturn,
  Suggestion,
  Status,
  Suggestions,
} from "./usePlacesAutocomplete";
export type {
  GeoArgs,
  GeocodeResult,
  GeoReturn,
  GetDetailsArgs,
  DetailsResult,
  LatLng,
  ZipCode,
} from "./utils";
