import React from 'react';
import Select from '@particles/select';
import TieredSelect from '@particles/tiered-select';

import data from './data';

import './LocationSelect.scss';
import selectStyleOverrides from './selectStyleOverrides.scss';
import tieredSelectStyleOverrides from './tieredSelectStyleOverrides.scss';

export default class LocationPicker extends React.Component {
  constructor(props) {
    super(props);

    this.state = { currentSelection: {}, isSearching: false };
  }

  onClear = () => this.setState({ currentSelection: {} });

  onCreate = item => console.log('Creating:', item); // eslint-disable-line

  onFocus = () => { this.setState({ isSearching: false }); };

  onSearch = string => this.setState({ isSearching: string.length });

  onSelect = selection => this.setState({ currentSelection: selection || {} });

  renderEmpty = () => 'No locations match this search';

  render() {
    const { currentSelection, isSearching } = this.state;

    const i18n = {
      clear_all: 'Clear All',
      no_items_found: 'No items found.',
      retrieving_items: 'Retrieving items...',
      search_placeholder: 'Search locations...',
      select_all: 'Select All',
      title_placeholder: 'Select a location...'
    };

    const dropdownContent = !isSearching
      ? (
        <TieredSelect
          {...{ currentSelection, data }}
          canAdd
          onCreate={this.onCreate}
          onSelect={this.onSelect}
          stylesheets={[tieredSelectStyleOverrides]}
        />
      ) : null;

    return (
      <Select
        {...{ data, dropdownContent }}
        i18n={i18n}
        keyField='id'
        onClear={this.onClear}
        onFocus={this.onFocus}
        onSearch={this.onSearch}
        onSelect={this.onSelect}
        renderEmpty={this.renderEmpty}
        searchable
        stylesheets={[selectStyleOverrides]}
        titlePlaceholder='Search existing locations'
        titleValue={currentSelection.full_name}
        valueField='full_name'
      />
    );
  }
}
