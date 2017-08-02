import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';

import baseStyles from './Tauwahi.scss';
import composeStyles from './stylesheetComposer';

export default class Tauwahi extends React.Component {
  static propTypes = {
    canAdd: PropTypes.bool,
    currentSelection: PropTypes.shape(),
    data: PropTypes.arrayOf(PropTypes.shape()).isRequired,
    limit: PropTypes.number,
    onCreate: PropTypes.func.isRequired,
    onSelect: PropTypes.func.isRequired,
    stylesheets: PropTypes.arrayOf(PropTypes.shape())
  };

  static defaultProps = {
    canAdd: false,
    currentSelection: {},
    limit: 9,
    stylesheets: []
  };

  constructor(props) {
    super(props);
    this.styles = composeStyles(baseStyles, [...props.stylesheets]);

    this.groupedData = props.data.reduce((acc, val) => {
      const parent = (Number.isInteger(val.parent_id) ? val.parent_id : 'root');
      return Object.assign({}, acc, { [parent]: (acc[parent] ? acc[parent].concat(val) : [val]) });
    }, {});

    this.memoizedData = props.data.reduce((acc, val) =>
      (Object.assign({}, acc, { [val.id]: val })), {});

    const maxId = props.data.reduce((acc, val) => (val.id > acc ? acc + 1 : acc), 0);

    const { currentSelection } = props;
    let currentParent = 'root';
    let stack = [];

    if (Object.keys(currentSelection).length && this.memoizedData[currentSelection.id]) {
      if (currentSelection.parent_id) {
        stack = [currentSelection.parent_id.toString(), currentSelection.id.toString()];

        let parent = null;

        if (this.memoizedData[currentSelection.parent_id].parent_id) {
          parent = this.memoizedData[currentSelection.parent_id].parent_id;
          stack.unshift(parent.toString());
        }

        while (parent && this.memoizedData[parent].parent_id) {
          parent = this.memoizedData[parent].parent_id;
          stack.unshift(parent.toString());
        }

        currentParent = currentSelection.parent_id.toString();
      } else {
        stack = [currentSelection.id.toString()];
      }
    }

    this.state = {
      currentParent,
      maxId,
      showAddNew: false,
      stack,
      value: ''
    };
  }

  componentWillReceiveProps(nextProps) {
    if (!Object.keys(nextProps.currentSelection).length) {
      this.setState({ stack: [], currentParent: 'root' });
    }
  }

  onSelect = () => {
    const { stack } = this.state;
    const selection = this.memoizedData[stack[stack.length - 1]];

    this.props.onSelect(selection);
  }

  onConfirmCreate = (evt) => {
    evt.stopPropagation();

    const value = this.input.value;

    if (value) {
      const { currentParent, maxId, stack } = this.state;
      const nextId = maxId + 1;

      const fullName = stack.length && currentParent !== 'root'
        ? `${this.memoizedData[currentParent].full_name} > ${this.input.value}`
        : this.input.value;

      this.memoizedData[nextId] = {
        full_name: fullName,
        id: nextId,
        name: this.input.value,
        parent_id: currentParent !== 'root' ? currentParent : null
      };

      this.groupedData[currentParent]
        ? this.groupedData[currentParent].push(this.memoizedData[nextId])
        : this.groupedData[currentParent] = [this.memoizedData[nextId]];

      const currentSelection = this.memoizedData[stack[stack.length - 1]];
      const isSelectedAtRoot = currentParent === 'root' && stack.length;
      const isSelectedAtChild = currentParent !== 'root' && currentSelection.parent_id
        ? currentSelection.parent_id.toString() === currentParent
        : false;

      if (isSelectedAtRoot || isSelectedAtChild) stack.pop();
      stack.push(nextId.toString());

      this.input.value = '';

      this.setState({ maxId: nextId, stack }, () => {
        this.itemsContainer.scrollTop = this.itemsContainer.scrollHeight;
        this.onSelect();
      });

      this.toggleCreateInput();

      this.props.onCreate(this.memoizedData[nextId]);
    }
  }

  onForwardClick = (evt) => {
    evt.stopPropagation();

    const { stack } = this.state;
    const { limit } = this.props;

    const currentParent = evt.target.dataset.id || evt.target.parentNode.dataset.id;

    const sameParent = stack.length && this.state.currentParent !== 'root'
      ? this.memoizedData[currentParent].parent_id ===
        this.memoizedData[stack[stack.length - 1]].parent_id
      : false;

    if (stack.length < limit - 1 || (stack.length === limit - 1
      && stack[stack.length - 1] !== this.state.currentParent)) {
      while (stack.length && !sameParent
        && stack[stack.length - 1] !== this.state.currentParent) {
        stack.pop();
      }

      if (!stack.length || (stack.length && !sameParent)) {
        stack.push(currentParent);
      } else if (stack.length && sameParent) {
        stack.pop();
        stack.push(currentParent);
      }

      this.setState({ currentParent, stack }, () => {
        this.onSelect();
      });
    }
  }

  onItemClick = (evt) => {
    const { stack } = this.state;

    const currentParent = evt.target.dataset.id || evt.target.parentNode.dataset.id;

    const sameParent = stack.length && this.state.currentParent !== 'root'
      ? this.memoizedData[currentParent].parent_id ===
        this.memoizedData[stack[stack.length - 1]].parent_id
      : false;

    if (stack[stack.length - 1] !== currentParent) {
      while (stack.length && !sameParent
        && stack[stack.length - 1] !== this.state.currentParent) {
        stack.pop();
      }

      if (!stack.length || (stack.length && !sameParent)) {
        stack.push(currentParent);
      } else if (stack.length && sameParent) {
        stack.pop();
        stack.push(currentParent);
      }
    } else {
      stack.pop();
    }

    this.setState({ stack }, () => {
      this.onSelect();
    });
  }

  onBackClick = () => {
    const { stack } = this.state;

    if (stack.length) stack.pop();

    const currentParent = stack[stack.length - 1] || 'root';

    this.setState({ currentParent, stack }, () => {
      this.onSelect();
    });
  }

  onBreadCrumbClick = (evt) => {
    const { stack } = this.state;
    const currentParent = evt.target.dataset.id || 'root';

    while (stack[stack.length - 1] !== currentParent) stack.pop();

    this.setState({ currentParent, stack }, () => {
      this.onSelect();
    });
  }

  onFooterClick = (evt) => {
    if (evt.target !== this.selectButton) evt.stopPropagation();
  }

  toggleCreateInput = () => {
    const showAddNew = !this.state.showAddNew;
    const value = '';

    this.setState({ showAddNew, value }, () => {
      if (this.input) this.input.focus();
    });
  }

  handleInput = (evt) => {
    const value = evt.target.value;

    this.setState({ value });
  }

  render() {
    const { currentParent, showAddNew, stack, value } = this.state;
    const { canAdd, limit } = this.props;

    const isListDisabled = this.groupedData[currentParent] === undefined;

    const backButton = currentParent !== 'root'
      ? (<div
        className={cx('fa fa-arrow-left', this.styles.backButton)}
        onClick={this.onBackClick}
      />)
      : null;

    const breadCrumb = stack
      .map(id => (
        id !== stack[stack.length - 1] || id === currentParent
          ? (
            <div
              className={cx(this.styles.breadCrumb,
                { [this.styles.currentParent]: id === currentParent })}
              data-id={id}
              key={id}
              onClick={this.onBreadCrumbClick}
            >{this.memoizedData[id].name}</div>
          ) : null
      ))
      .reduce((acc, v) => (acc === null
        ? [v]
        : [...acc, v
          ? (
            <span
              className={cx('fa fa-caret-right', this.styles.caret)}
              key={`caret-${Math.random(10)}`}
            />
          ) : null, v])
        , null);

    const breadCrumbs = currentParent !== 'root'
      ? <div className={this.styles.breadCrumbs}>{breadCrumb}</div>
      : <div className={this.styles.emptyBreadCrumbs}>Locations</div>;

    const header = (
      <div className={this.styles.header} onClick={(evt) => { evt.stopPropagation(); }}>
        {backButton}
        {breadCrumbs}
      </div>);

    const check = <div className={cx('fa fa-check', this.styles.check)} />;

    const forwardButton = stack.length < limit - 1 || (stack.length === limit - 1
      && stack[stack.length - 1] !== currentParent)
      ? (
        <div
          className={cx('fa fa-chevron-right', this.styles.forwardButton)}
          onClick={this.onForwardClick}
        />
      ) : null;

    const items = isListDisabled
      ? null
      : this.groupedData[currentParent].map(item => (
        <div
          className={cx(this.styles.item,
            { [this.styles.currentParent]: item.id.toString() === stack[stack.length - 1] })}
          data-id={item.id}
          key={item.id}
          onClick={this.onItemClick}
          onDoubleClick={this.onForwardClick}
        >
          {check}
          <div className={this.styles.itemName}>{item.name}</div>
          {this.groupedData[item.id] || canAdd ? forwardButton : null}
        </div>
      ));

    const itemsContainer = items
      ? (
        <div
          className={cx(this.styles.itemsContainer,
            { [this.styles.showAddNew]: showAddNew })}
          onClick={(evt) => { evt.stopPropagation(); }}
          ref={(el) => { this.itemsContainer = el; }}
        >{items}</div>
      ) : (
        <div
          className={cx(this.styles.itemsContainer, this.styles.emptyItemsContainer,
            { [this.styles.showAddNew]: showAddNew })}
          onClick={(evt) => { evt.stopPropagation(); }}
        >{`No locations in ${this.memoizedData[currentParent].name}`}</div>
      );

    const placeholder = currentParent !== 'root'
      ? `Create new location in ${this.memoizedData[currentParent].name}`
      : 'Create new location';

    const addNewInput = showAddNew
      ? (
        <div
          className={cx(this.styles.inputContainer,
            { [this.styles.emptyItemsContainer]: !items })}
          onClick={(evt) => { evt.stopPropagation(); }}
        >
          <input
            className={this.styles.input}
            onChange={this.handleInput}
            placeholder={placeholder}
            ref={(el) => { this.input = el; }}
          />
        </div>
      ) : null;

    const selectButton = (
      <button className={cx(this.styles.confirmButton,
        { [this.styles.disabled]: !stack.length })}
      >Select</button>
    );

    const createNewButton = canAdd && !showAddNew
      ? (
        <button
          className={this.styles.createNewButton}
          onClick={this.toggleCreateInput}
        >+</button>
      ) : null;

    const confirmCancelButtons = showAddNew
      ? (
        <div>
          <button
            className={this.styles.cancelButton}
            onClick={this.toggleCreateInput}
          >Cancel</button>
          <button
            className={cx(this.styles.confirmButton,
              { [this.styles.disabled]: !value })}
            disabled={!value}
            onClick={this.onConfirmCreate}
          >Confirm</button>
        </div>
      ) : null;

    const footer = !showAddNew
      ? (<div
        className={this.styles.footer}
        onClick={this.onFooterClick}
      >
        {createNewButton}
        {selectButton}
      </div>)
      : (<div
        className={cx(this.styles.footer, this.styles.showAddNew)}
        onClick={this.onFooterClick}
      >
        {confirmCancelButtons}
      </div>);

    return (
      <div className={this.styles.container}>
        {header}
        {itemsContainer}
        {addNewInput}
        {footer}
      </div>
    );
  }
}
