import React, { Component } from 'react';
import Tipako from 'tipako';

import data from './data';
import Tauwahi from './Tauwahi';

import './TieredPicker.scss';
import tipakoStyleOverrides from './TipakoStyleOverrides.scss';
import tauwahiStyleOverrides from './TauwahiStyleOverrides.scss';

export default class LocationPicker extends Component {
  constructor(props) {
    super(props);

    this.state = {
      currentSelection: {},
      isSearching: false
    };
  }

  onCreate = (item) => {
    console.log('Creating:', item); // eslint-disable-line
  };

  onSearch = (string) => {
    string
      ? this.setState({ isSearching: true })
      : this.setState({ isSearching: false });
  };

  onSelect = (selection) => {
    selection
      ? this.setState({ currentSelection: selection })
      : this.setState({ currentSelection: {} });
  };

  render() {
    const { currentSelection, isSearching } = this.state;

    // shared props
    const onSelect = this.onSelect;

    // Tauwahi props
    const onCreate = this.onCreate;

    // Tipako props
    const keyField = 'id';
    const onClear = () => { this.setState({ currentSelection: {} }); };
    const onFocus = () => { this.setState({ isSearching: false }); };
    const onSearch = this.onSearch;
    const renderEmpty = () => 'No locations match this search';
    const titlePlaceholder = 'Search existing locations';
    const titleValue = currentSelection.full_name;
    const valueField = 'full_name';

    const dropdownContent = !isSearching
      ? (
        <Tauwahi
          canAdd
          stylesheets={[tauwahiStyleOverrides]}
          {...{
            currentSelection,
            data,
            onCreate,
            onSelect
          }}
        />
      ) : null;

    return (
      <Tipako
        closeOnSelect
        searchable
        updateOnSelect
        stylesheets={[tipakoStyleOverrides]}
        {...{
          data,
          dropdownContent,
          keyField,
          onClear,
          onFocus,
          onSearch,
          onSelect,
          renderEmpty,
          titlePlaceholder,
          titleValue,
          valueField
        }}
      />
    );
  }
}
