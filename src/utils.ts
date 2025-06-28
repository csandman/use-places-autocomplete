/* eslint-disable compat/compat */

export type GeoArgs = google.maps.GeocoderRequest;

export type GeocodeResult = google.maps.GeocoderResult;

export type GeoReturn = Promise<GeocodeResult[] | null>;

export const geocodeErr =
  '💡 use-places-autocomplete: Please provide an address when using getGeocode() with the componentRestrictions.';

export const getGeocode = (args: GeoArgs): GeoReturn => {
  const geocoder = new window.google.maps.Geocoder();

  return new Promise((resolve, reject) => {
    geocoder.geocode(args, (results, status) => {
      if (status !== 'OK') reject(status);
      if (!args.address && args.componentRestrictions) {
        console.error(geocodeErr);
        resolve(results);
      }
      resolve(results);
    });
  });
};

export type LatLng = { lat: number; lng: number };

export const getLatLng = (result: GeocodeResult): LatLng => {
  const { lat, lng } = result.geometry.location;
  return { lat: lat(), lng: lng() };
};

export type ZipCode = string | undefined;

export const getZipCode = (
  result: GeocodeResult,
  useShortName: false
): ZipCode => {
  const foundZip = result.address_components.find(({ types }) =>
    types.includes('postal_code')
  );

  if (!foundZip) return undefined;

  return useShortName ? foundZip.short_name : foundZip.long_name;
};
