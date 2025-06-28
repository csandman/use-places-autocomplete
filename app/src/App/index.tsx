import type { ChangeEvent, FC } from "react";
import { type KeyboardEvent, useState } from "react";
import useOnclickOutside from "react-cool-onclickoutside";
import usePlacesAutocomplete, {
  type Suggestion,
} from "use-places-autocomplete";
import GitHubCorner from "../GitHubCorner";
import styles from "./styles.module.scss";

let cachedVal = "";
const acceptedKeys = ["ArrowUp", "ArrowDown", "Escape", "Enter"];

const App: FC = () => {
  const [currIndex, setCurrIndex] = useState<number | null>(null);
  const {
    ready,
    value,
    suggestions: { status, data },
    setValue,
    clearSuggestions,
  } = usePlacesAutocomplete({
    apiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
  });
  const hasSuggestions = status === "OK";

  const dismissSuggestions = () => {
    setCurrIndex(null);
    clearSuggestions();
  };

  const ref = useOnclickOutside(dismissSuggestions);

  const handleInput = (e: ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
    cachedVal = e.target.value;
  };

  const [formattedAddress, setFormattedAddress] = useState<string | null>(null);
  const [selectedAddressComponents, setSelectedAddressComponents] = useState<
    google.maps.places.AddressComponent[] | null
  >(null);

  const handleSelect = (suggestion: Suggestion) => async () => {
    setValue(suggestion.text.text, false);
    dismissSuggestions();

    const place = suggestion.toPlace();
    await place.fetchFields({
      fields: ["addressComponents", "formattedAddress"],
    });

    setFormattedAddress(place.formattedAddress ?? null);
    setSelectedAddressComponents(place.addressComponents ?? null);
  };

  const handleEnter = (idx: number) => () => {
    setCurrIndex(idx);
  };

  const handleLeave = () => {
    setCurrIndex(null);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (!hasSuggestions || !acceptedKeys.includes(e.key)) return;

    if (e.key === "Enter" || e.key === "Escape") {
      dismissSuggestions();
      return;
    }

    let nextIndex: number | null;

    if (e.key === "ArrowUp") {
      e.preventDefault();
      nextIndex = currIndex ?? data.length;
      nextIndex = nextIndex && nextIndex > 0 ? nextIndex - 1 : null;
    } else {
      nextIndex = currIndex ?? -1;
      nextIndex = nextIndex < data.length - 1 ? nextIndex + 1 : null;
    }

    setCurrIndex(nextIndex);
    setValue(
      nextIndex !== null && data[nextIndex]
        ? data[nextIndex]?.text.text
        : cachedVal,
      false
    );
  };

  const renderSuggestions = (): React.ReactElement => {
    const suggestions = data.map((suggestion: Suggestion, idx) => {
      const { placeId, mainText, secondaryText } = suggestion;

      return (
        <li
          key={placeId}
          id={`ex-list-item-${idx}`}
          className={`${styles["list-item"]} ${
            idx === currIndex ? `${styles["list-item-darken"]}` : ""
          }`}
          onClick={handleSelect(suggestion)}
          onMouseEnter={handleEnter(idx)}
          role="option"
          aria-selected={idx === currIndex}
        >
          <strong>{mainText?.text}</strong>
          <small className={styles["sub-text"]}>{secondaryText?.text}</small>
        </li>
      );
    });

    return (
      <>
        {suggestions}
        <li className={styles.logo}>
          <img
            src="/powered_by_google.png"
            alt="Powered by Google"
            width="120"
          />
        </li>
      </>
    );
  };

  return (
    <div className={styles.container}>
      <GitHubCorner url="https://github.com/wellyshen/use-places-autocomplete" />
      <h1 className={styles.title}>USE-PLACES-AUTOCOMPLETE</h1>
      <p className={styles.subtitle}>
        React hook for Google Maps Places Autocomplete.
      </p>
      <div className={styles.autocomplete} ref={ref}>
        <input
          className={styles.input}
          value={value}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          disabled={!ready}
          placeholder="WHERE ARE YOU GOING?"
          type="text"
          role="combobox"
          aria-controls="ex-list-box"
          aria-autocomplete="list"
          aria-haspopup="listbox"
          aria-expanded={hasSuggestions}
          aria-activedescendant={
            currIndex !== null ? `ex-list-item-${currIndex}` : undefined
          }
        />
        {hasSuggestions && (
          <ul
            id="ex-list-box"
            className={styles["list-box"]}
            onMouseLeave={handleLeave}
            role="listbox"
          >
            {renderSuggestions()}
          </ul>
        )}
      </div>

      {!!formattedAddress && !!selectedAddressComponents && (
        <div className={styles.address}>
          <h3>Formatted Address</h3>
          <p>{formattedAddress}</p>
          <h3>Address Components</h3>
          <ul>
            {selectedAddressComponents.map((component) => (
              <li key={component.longText}>
                {component.longText} ({component.types.join(", ")})
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default App;
