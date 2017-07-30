import React, { Component } from 'react';
import Tauwahi from 'tauwahi';
import Tipako from 'tipako';

import data from './data';
import styles from './TieredPicker.scss';

export default class LocationPicker extends Component {
  constructor(props) {
    super(props);

    this.state = {
      currentSelection: {},
      isSearching: false
    };
  }

  render() {
    const { currentSelection, isSearching } = this.state;

    // shared props
    const stylesheets = [styles];
    const onSelect = (selection) => {
      selection
        ? this.setState({ currentSelection: selection })
        : this.setState({ currentSelection: {} });
    };

    // Tauwahi props
    const onCreate = (item) => { console.log('Creating:', item); }; // eslint-disable-line

    // Tipako props
    const keyField = 'id';

    const onClear = () => { this.setState({ currentSelection: {} }); };
    const onFocus = () => { this.setState({ isSearching: false }); };

    const renderEmpty = () => 'No locations match this search';
    const titlePlaceholder = 'Search existing locations';
    const titleValue = currentSelection.full_name;
    const valueField = 'full_name';

    const onSearch = (string) => {
      string
        ? this.setState({ isSearching: true })
        : this.setState({ isSearching: false });
    };

    const dropdownContent = !isSearching
      ? (
        <Tauwahi
          canAdd
          {...{
            currentSelection,
            data,
            onCreate,
            onSelect,
            stylesheets
          }}
        />
      ) : null;

    return (
      <Tipako
        closeOnSelect
        searchable
        updateOnSelect
        {...{
          data,
          dropdownContent,
          keyField,
          onClear,
          onFocus,
          onSearch,
          onSelect,
          renderEmpty,
          stylesheets,
          titlePlaceholder,
          titleValue,
          valueField
        }}
      />
    );
  }
}
