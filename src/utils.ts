/* eslint-disable compat/compat */

type GeoArgs = google.maps.GeocoderRequest;

type GeocodeResult = google.maps.GeocoderResult;

type GeoReturn = Promise<GeocodeResult[] | null>;

export const geocodeErr =
  "💡 use-places-autocomplete: Please provide an address when using getGeocode() with the componentRestrictions.";

export const getGeocode = (args: GeoArgs): GeoReturn => {
  const geocoder = new window.google.maps.Geocoder();

  return new Promise((resolve, reject) => {
    geocoder.geocode(args, (results, status) => {
      if (status !== "OK") reject(status);
      if (!args.address && args.componentRestrictions) {
        console.error(geocodeErr);
        resolve(results);
      }
      resolve(results);
    });
  });
};

type LatLng = { lat: number; lng: number };

export const getLatLng = (result: GeocodeResult): LatLng => {
  const { lat, lng } = result.geometry.location;
  return { lat: lat(), lng: lng() };
};

type ZipCode = string | undefined;

export const getZipCode = (
  result: GeocodeResult,
  useShortName: false
): ZipCode => {
  const foundZip = result.address_components.find(({ types }) =>
    types.includes("postal_code")
  );

  if (!foundZip) return undefined;

  return useShortName ? foundZip.short_name : foundZip.long_name;
};

type GetDetailsArgs = google.maps.places.PlaceDetailsRequest;

type DetailsResult = Promise<google.maps.places.PlaceResult | null>;

export const getDetailsErr =
  "💡 use-places-autocomplete: Please provide a place Id when using getDetails() either as a string or as part of an Autocomplete Prediction.";

export const getDetails = (args: GetDetailsArgs): DetailsResult => {
  const PlacesService = new window.google.maps.places.PlacesService(
    document.createElement("div")
  );

  if (!args.placeId) {
    console.error(getDetailsErr);
    return Promise.reject(getDetailsErr);
  }

  return new Promise((resolve, reject) => {
    PlacesService.getDetails(args, (results, status) => {
      if (status !== "OK") reject(status);
      resolve(results);
    });
  });
};
