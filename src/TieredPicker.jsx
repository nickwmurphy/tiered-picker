import React, { Component } from 'react';
import Tauwahi from './Tauwahi';
import Tipako from './Tipako';

import data from './data';

import './TieredPicker.scss';
import tipakoStyleOverrides from './TipakoStyleOverrides.scss';
import tauwahiStyleOverrides from './TauwahiStyleOverrides.scss';

export default class LocationPicker extends Component {
  constructor(props) {
    super(props);

    this.state = { currentSelection: {}, isSearching: false };
  }

  onClear = () => { this.setState({ currentSelection: {} }); };

  onCreate = (item) => { console.log('Creating:', item); }; // eslint-disable-line

  onFocus = () => { this.setState({ isSearching: false }); };

  onSearch = (string) => { this.setState({ isSearching: string.length }); };

  onSelect = (selection) => { this.setState({ currentSelection: selection || {} }); };

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
