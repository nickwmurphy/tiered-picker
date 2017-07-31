import React, { Component } from 'react';
import Tipako from 'tipako';

import data from './data';
import Tauwahi from './Tauwahi';

import './TieredPicker.scss';
import tipakoStyleOverrides from './tipakoStyleOverrides.scss';
import tauwahiStyleOverrides from './tauwahiStyleOverrides.scss';

export default class LocationPicker extends Component {
  constructor(props) {
    super(props);

    this.state = { currentSelection: {}, isSearching: false };
  }

  onClear = () => { this.setState({ currentSelection: {} }); };

  onCreate = (item) => { console.log('Creating:', item); }; // eslint-disable-line

  onFocus = () => { this.setState({ isSearching: false }); };

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

  renderEmpty = () => 'No locations match this search';

  render() {
    const { currentSelection, isSearching } = this.state;

    const dropdownContent = !isSearching
      ? (
        <Tauwahi
          {...{ currentSelection, data }}
          canAdd
          onCreate={this.onCreate}
          onSelect={this.onSelect}
          stylesheets={[tauwahiStyleOverrides]}
        />
      ) : null;

    return (
      <Tipako
        {...{ data, dropdownContent }}
        closeOnSelect
        keyField='id'
        onClear={this.onClear}
        onFocus={this.onFocus}
        onSearch={this.onSearch}
        onSelect={this.onSelect}
        renderEmpty={this.renderEmpty}
        searchable
        stylesheets={[tipakoStyleOverrides]}
        titlePlaceholder='Search existing locations'
        titleValue={currentSelection.full_name}
        updateOnSelect
        valueField='full_name'
      />
    );
  }
}
