import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import baseStyles from './Tipako.scss';
import composeStyles from './stylesheetComposer';
import generateId from './generateId';

let counter = 0;
let groupCounter = 0;

export default class Tipako extends React.Component {
  static propTypes = {
    closeOnSelect: PropTypes.bool,
    dropdownContent: PropTypes.node,
    data: PropTypes.arrayOf(PropTypes.shape({
      children: PropTypes.arrayOf(PropTypes.shape({
        disabled: PropTypes.bool,
        key: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
        value: PropTypes.string.isRequired
      })),
      disabled: PropTypes.bool,
      key: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      value: PropTypes.string.isRequired
    })),
    disabled: PropTypes.bool,
    keyField: PropTypes.string,
    loading: PropTypes.bool,
    onClear: PropTypes.func,
    onClearAll: PropTypes.func,
    onFocus: PropTypes.func,
    onSearch: PropTypes.func,
    onSelect: PropTypes.func.isRequired,
    onSelectAll: PropTypes.func,
    renderEmpty: PropTypes.func,
    renderGroup: PropTypes.func,
    renderItem: PropTypes.func,
    searchable: PropTypes.bool,
    slotBottom: PropTypes.node,
    slotTitle: PropTypes.element,
    stylesheets: PropTypes.arrayOf(PropTypes.shape()),
    titlePlaceholder: PropTypes.string,
    titleValue: PropTypes.string,
    updateOnSelect: PropTypes.bool,
    valueField: PropTypes.string,
    valueFunction: PropTypes.func
  }

  static defaultProps = {
    closeOnSelect: false,
    dropdownContent: null,
    data: [],
    disabled: false,
    keyField: 'key',
    loading: false,
    onClear: null,
    onClearAll: null,
    onFocus: null,
    onSearch: null,
    onSelectAll: null,
    renderEmpty: null,
    renderGroup: null,
    renderItem: null,
    searchable: false,
    selectedKey: null,
    slotBottom: null,
    slotTitle: null,
    stylesheets: [],
    titlePlaceholder: 'Select...',
    titleValue: '',
    updateOnSelect: false,
    valueField: 'value',
    valueFunction: null
  }

  constructor(props) {
    super(props);

    this.styles = composeStyles(baseStyles, [...props.stylesheets]);

    this.guid = generateId();

    if (props.searchable === false && props.onSearch !== null) {
      console.error('An instance of Tipako has an "onSearch()" ' // eslint-disable-line
        + 'callback defined, but its "searchable" prop is false, '
        + 'so the callback will have no effect.');
    }

    this.state = {
      currentIndex: -1,
      expanded: false,
      value: props.titleValue
    };
  }

  componentWillMount() {
    window.addEventListener('click', this.onBlur);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.titleValue !== this.props.titleValue) {
      this.setState({ value: nextProps.titleValue });
    }
  }

  componentDidUpdate() {
    const { currentIndex, expanded } = this.state;

    if (expanded) {
      if (this.focusedItem && currentIndex > -1) {
        this.focusedItem.focus();
      }

      if (this.searchInput && currentIndex === -1) {
        this.searchInput.focus();
      }
    }
  }

  componentWillUnmount() {
    window.removeEventListener('click', this.onBlur);
  }

  onSearch = (evt) => {
    const str = evt.target.value;
    this.setState({ value: str, expanded: true }, () => {
      if (this.props.onSearch) {
        this.props.onSearch(str);
      }
    });
  }

  onChildClick = (evt, child) => {
    evt.stopPropagation();

    if (child.disabled) {
      return;
    }

    this.props.onSelect(child);

    if (this.props.closeOnSelect) {
      this.setState({ expanded: false });
    }

    this.updateValue(child);
  }

  onGroupClick = (evt, group) => {
    evt.stopPropagation();

    if (group.disabled) {
      return;
    }

    this.props.onSelect(group);

    if (this.props.closeOnSelect) {
      this.setState({ expanded: false });
    }

    this.updateValue(group);
  }

  onUngroupedClick = (evt, item) => {
    evt.stopPropagation();

    if (item.disabled) {
      return;
    }

    this.props.onSelect(item);

    if (this.props.closeOnSelect) {
      this.setState({ expanded: false });
    }

    this.updateValue(item);
  }

  onTitleClick = (evt) => {
    if (this.state.expanded === false) {
      this.setState({ currentIndex: -1, expanded: true, guid: this.guid });
      this.props.onFocus && this.props.onFocus();
    } else if (evt.target !== this.searchInput) {
      this.onBlur();
      this.setState({ currentIndex: -1 });
    } else {
      evt.stopPropagation();
      this.setState({ currentIndex: -1 });
    }
  }

  onSelectAll = () => {
    this.props.onSelectAll();
    this.setState({ expanded: false });
  }

  onClearAll = () => {
    this.props.onClearAll([]);
    this.setState({ expanded: false });
  }

  onSearchFocus = (evt) => {
    evt.target.select();
    this.props.onFocus && this.props.onFocus();
  }

  onBlur = () => {
    const expanded = (this.state.guid === this.guid);
    this.setState({ expanded, guid: null });
  };

  onInputClear = (evt) => {
    evt.stopPropagation();

    if (this.props.onSearch) {
      this.props.onSearch('');
    }

    if (this.props.onClear) {
      this.props.onClear();
    }

    this.setState({ value: '' });
  }

  getEmptyString = () => {
    if (this.state.value) {
      return `No matches for "${this.state.value}".`;
    }

    if (this.props.loading) {
      return 'Retrieving items...';
    }

    return 'No items found.';
  }

  updateValue = (item) => {
    if (this.props.updateOnSelect) {
      if (this.props.valueFunction) {
        this.setState({ value: this.props.valueFunction(item) });
      } else {
        this.setState({ value: item[this.props.valueField] });
      }
    }
  }

  handleKeyDown = (evt) => {
    let { currentIndex } = this.state;
    const { expanded } = this.state;
    const { searchable } = this.props;

    let totalCounter = counter > groupCounter
      ? counter
      : groupCounter;

    if (groupCounter === 0) {
      totalCounter -= 1;
    }

    if (evt.keyCode === 38 && expanded) { // arrow up
      evt.preventDefault();
      if ((currentIndex > -1 && searchable) || (currentIndex > 0 && !searchable)) {
        currentIndex -= 1;
        this.setState({ currentIndex });
      }
    } else if (evt.keyCode === 40 && expanded) { // arrow down
      evt.preventDefault();
      if (currentIndex < totalCounter) {
        currentIndex += 1;
        this.setState({ currentIndex });
      }
    } else if (evt.keyCode === 27 && expanded) { // esc
      this.onBlur();
    }
  }

  render() {
    const {
      dropdownContent,
      data,
      disabled,
      keyField,
      loading,
      onClearAll,
      onSelectAll,
      renderEmpty,
      renderGroup,
      renderItem,
      searchable,
      slotBottom,
      slotTitle,
      titlePlaceholder,
      updateOnSelect,
      valueField
    } = this.props;

    const {
      currentIndex,
      expanded,
      value
    } = this.state;

    const searchTerm = (searchable && value)
      ? value.toLowerCase()
      : '';

    counter = 0;
    groupCounter = 0;

    const items = data.reduce((acc, v, i) => {
      // Grouped
      if (v.children) {
        const children = v.children.reduce((result, vv, ii) => {
          if (vv[valueField].toLowerCase().indexOf(searchTerm) === -1) {
            return result;
          }

          groupCounter > counter
            ? counter = groupCounter + 1
            : counter += 1;

          const focusedItem = currentIndex === counter;

          const childItem = result.concat(<div
            className={cx(this.styles.item, this.styles.childItem,
              { [this.styles.disabled]: vv.disabled,
                [this.styles.keyFocus]: focusedItem })}
            key={`child-${v[keyField]}-${vv[keyField]}`}
            onClick={(e) => { this.onChildClick(e, vv); }}
            onKeyDown={(e) => {
              if (focusedItem && expanded && e.keyCode === 13) this.onChildClick(e, vv);
            }}
            ref={(el) => { if (focusedItem) this.focusedItem = el; }}
            tabIndex={-1}
          >
            {renderItem ? renderItem(vv, ii) : vv[valueField]}
          </div>);

          return childItem;
        }, []);

        if (children.length === 0 && v[valueField].toLowerCase().indexOf(searchTerm) === -1) {
          return acc;
        }

        const focusedItem = currentIndex === groupCounter;

        const group = (<div
          className={cx(this.styles.item, this.styles.groupItem,
            { [this.styles.disabled]: v.disabled,
              [this.styles.keyFocus]: focusedItem })}
          key={`group-${v[keyField]}`}
          onClick={(evt) => { this.onGroupClick(evt, v); }}
          onKeyDown={(e) => {
            if (focusedItem && expanded && e.keyCode === 13) this.onGroupClick(e, v);
          }}
          ref={(el) => { if (focusedItem) this.focusedItem = el; }}
          tabIndex={-1}
        >
          {renderGroup ? renderGroup(v, i) : v[valueField]}
        </div>);

        groupCounter = counter + 1;
        return acc.concat(group).concat(children);
      }

      if (v[valueField].toLowerCase().indexOf(searchTerm) === -1) {
        return acc;
      }

      // Ungrouped
      if (groupCounter > 0) {
        groupCounter > counter
          ? counter = groupCounter + 1
          : counter += 1;
      }

      const focusedItem = currentIndex === counter;

      const ungrouped = (<div
        className={cx(this.styles.item, this.styles.ungroupedItem,
          { [this.styles.disabled]: v.disabled,
            [this.styles.keyFocus]: focusedItem })}
        key={`ungrouped-${v[keyField]}`}
        onClick={(evt) => { this.onUngroupedClick(evt, v); }}
        onKeyDown={(e) => {
          if (focusedItem && expanded && e.keyCode === 13) this.onUngroupedClick(e, v);
        }}
        ref={(el) => { if (focusedItem) this.focusedItem = el; }}
        tabIndex={-1}
      >
        {renderItem ? renderItem(v, i) : v[valueField]}
      </div>);

      if (groupCounter === 0) {
        counter += 1;
      }

      return acc.concat(ungrouped);
    }, []);

    const selectAll = (onSelectAll && items.length > 0)
      ? (<button className={this.styles.controlsButton} onClick={this.onSelectAll} type='button'>
           Select All
      </button>)
      : null;

    const clearAll = onClearAll
      ? (<button className={this.styles.controlsButton} onClick={this.onClearAll} type='button'>
          Clear All
      </button>)
      : null;

    const spacer = (clearAll && selectAll)
      ? <div className={this.styles.controlsSpacer}>/</div>
      : null;

    const controls =
      (!dropdownContent && (selectAll || clearAll)) && (
        <div className={this.styles.controls}>
          {selectAll}
          {spacer}
          {clearAll}
        </div>
      );

    const empty = (<div className={this.styles.empty}>
      {renderEmpty ? renderEmpty() : this.getEmptyString()}
    </div>);

    const caret = loading
      ? null
      : (<button onClick={this.onTitleClick} className={this.styles.caret} type='button'>
        <span className={cx('fa', 'fa-caret-down', this.styles.arrow, { [this.styles.expanded]: expanded })} />
      </button>);

    const clear = value
      ? <button onClick={this.onInputClear} className={this.styles.clear} type='button' />
      : null;

    const spinner = loading
      ? <span className={this.styles.spinner} />
      : null;

    const slot = slotTitle
      ? <div className={this.styles.slot}>{slotTitle}</div>
      : null;

    const search = searchable
      ? (
        <input
          className={cx(this.styles.input, { [this.styles.noClear]: !updateOnSelect })}
          onChange={this.onSearch}
          onClick={this.onTitleClick}
          onFocus={this.onSearchFocus}
          placeholder={titlePlaceholder}
          ref={(input) => { this.searchInput = input; }}
          type='text'
          value={value || ''}
        />
      )
      : (
        <div
          className={cx(this.styles.staticText, { [this.styles.noClear]: !updateOnSelect })}
          onClick={this.onTitleClick}
        >
          {value || titlePlaceholder}
        </div>
      );

    const itemsContainer = !dropdownContent && (
      <div className={this.styles.itemsContainer}>
        {items.length ? items : empty}
      </div>
    );

    return (
      <div
        className={cx(this.styles.container,
          { [this.styles.active]: expanded,
            [this.styles.disabled]: disabled })}
        onKeyDown={this.handleKeyDown}
        tabIndex={-1}
      >
        <div
          className={cx(this.styles.title,
            { [this.styles.active]: expanded,
              [this.styles.disabled]: disabled })}
        >
          {slot}
          {search}
          {clear}
          {caret}
          {spinner}
        </div>

        <div className={this.styles.dropdownContainer}>
          <div
            className={cx(this.styles.dropdown, {
              [this.styles.expanded]: expanded,
              [this.styles.withSlotBottom]: slotBottom && expanded
            })}
          >
            {expanded ? dropdownContent : null}
            {controls}
            {itemsContainer}
            {slotBottom &&
              <div
                className={this.styles.slotBottom}
                onClick={e => e.stopPropagation()}
              >{slotBottom}</div>}
          </div>
        </div>
      </div>
    );
  }
}
