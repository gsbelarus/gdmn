import * as React from 'react';
import { GroupedList, IGroup } from 'office-ui-fabric-react/lib/components/GroupedList/index';
import { IColumn } from 'office-ui-fabric-react/lib/DetailsList';
import { DetailsRow } from 'office-ui-fabric-react/lib/components/DetailsList/DetailsRow';
import { FocusZone } from 'office-ui-fabric-react/lib/FocusZone';
import { Selection, SelectionMode, SelectionZone } from 'office-ui-fabric-react/lib/utilities/selection/index';
import { Toggle } from 'office-ui-fabric-react/lib/Toggle';

//import { IExampleItem } from 'office-ui-fabric-react/lib/utilities/exampleData';
import { createGroups, IExampleItem } from 'office-ui-fabric-react/lib/utilities/exampleData';

const groupCount = 2;
const groupDepth = 3;

export interface IGroupedListExampleState {
  isCompactMode?: boolean;
}

const myListEtem: IExampleItem[] = [
  {
    thumbnail: '1',
    key: 'item-1',
    name: '1',
    description: 'example',
    color: 'red',
    shape: 'circle',
    location: 'Minsk',
    width: 150,
    height: 150
  }, {
    thumbnail: '2',
    key: 'item-2',
    name: '2',
    description: 'example',
    color: 'green',
    shape: 'circle',
    location: 'Minsk',
    width: 150,
    height: 150
  },
  {
    thumbnail: '3',
    key: 'item-3',
    name: '3',
    description: 'example',
    color: 'red',
    shape: 'circle',
    location: 'Minsk',
    width: 150,
    height: 150
  }, {
    thumbnail: '4',
    key: 'item-4',
    name: '4',
    description: 'example',
    color: 'green',
    shape: 'circle',
    location: 'Minsk',
    width: 150,
    height: 150
  },
  {
    thumbnail: '5',
    key: 'item-5',
    name: '5',
    description: 'example',
    color: 'green',
    shape: 'circle',
    location: 'Minsk',
    width: 150,
    height: 150
  }, {
    thumbnail: '6',
    key: 'item-6',
    name: '6',
    description: 'example',
    color: 'green',
    shape: 'circle',
    location: 'Minsk',
    width: 150,
    height: 150
  },
  {
    thumbnail: '7',
    key: 'item-7',
    name: '7',
    description: 'example',
    color: 'blue',
    shape: 'circle',
    location: 'Minsk',
    width: 150,
    height: 150
  }, {
    thumbnail: '8',
    key: 'item-8',
    name: '8',
    description: 'example',
    color: 'red',
    shape: 'circle',
    location: 'Minsk',
    width: 150,
    height: 150
  },
  {
    thumbnail: '9',
    key: 'item-9',
    name: '9',
    description: 'example',
    color: 'blue',
    shape: 'circle',
    location: 'Minsk',
    width: 150,
    height: 150
  }, {
    thumbnail: '10',
    key: 'item-10',
    name: '10',
    description: 'example',
    color: 'green',
    shape: 'circle',
    location: 'Minsk',
    width: 150,
    height: 150
  },
  {
    thumbnail: '11',
    key: 'item-11',
    name: '11',
    description: 'example',
    color: 'blue',
    shape: 'circle',
    location: 'Minsk',
    width: 150,
    height: 150
  }, {
    thumbnail: '12',
    key: 'item-12',
    name: '12',
    description: 'example',
    color: 'red',
    shape: 'circle',
    location: 'Minsk',
    width: 150,
    height: 150
  },
  {
    thumbnail: '13',
    key: 'item-13',
    name: '13',
    description: 'example',
    color: 'blue',
    shape: 'circle',
    location: 'Minsk',
    width: 150,
    height: 150
  }, {
    thumbnail: '14',
    key: 'item-14',
    name: '14',
    description: 'example',
    color: 'green',
    shape: 'circle',
    location: 'Minsk',
    width: 150,
    height: 150
  },
  {
    thumbnail: '15',
    key: 'item-15',
    name: '15',
    description: 'example',
    color: 'green',
    shape: 'circle',
    location: 'Minsk',
    width: 150,
    height: 150
  }, {
    thumbnail: '16',
    key: 'item-16',
    name: '16',
    description: 'example',
    color: 'red',
    shape: 'circle',
    location: 'Minsk',
    width: 150,
    height: 150
  },
  {
    thumbnail: '17',
    key: 'item-17',
    name: '17',
    description: 'example',
    color: 'blue',
    shape: 'circle',
    location: 'Minsk',
    width: 150,
    height: 150
  }, {
    thumbnail: '18',
    key: 'item-18',
    name: '18',
    description: 'example',
    color: 'green',
    shape: 'circle',
    location: 'Minsk',
    width: 150,
    height: 150
  },
];

export class GroupedListComponent extends React.Component<{}, IGroupedListExampleState> {

  private items: IExampleItem[];
  private columns: IColumn[];
  private groups: IGroup[];
  private selection: Selection;

  constructor(props: {}) {
    super(props);

    this.items = myListEtem;
    
    //this.groups = createGroups(4, groupDepth, 0, groupCount);

    this.groups = this.createGroups();
    this.columns = Object.keys(this.items[0])
    .slice(0, 7)
    .map(
      (key: string): IColumn => ({
        key: key,
        name: key,
        fieldName: key,
        minWidth: 300
      })
    );

    this.selection = new Selection();
    this.selection.setItems(this.items);

    this.state = {
      isCompactMode: false
    };
  }

  private createGroups = (): IGroup[] => {
      let myGroupsByColor : IGroup[] = [];
      this.items.sort( (a, b) => {return a.color > b.color ? 1 : 0} )
      const valuesGroups = this.items.map( item => {return item.color} ).reduce((acc: string[], current) => {
        current = current.trim();
        if (!acc.includes(current)) {
            acc.push(current);
        }
        return acc;
      }, []);
      valuesGroups.forEach( value => {
        myGroupsByColor.push( {
          key: value,
          name: value,
          level: 0,
          isCollapsed: false,
          children: [],
          startIndex: this.items.map( item => {return item.color} ).indexOf(  value ),
          count: this.items.reduce( (count, item) => { return item.color === value ? count + 1 : count }, 0)} as IGroup )
      });
      myGroupsByColor.forEach( group => {
        group.data = this.items.filter( item => { return item.color === group.key});
      })
      return myGroupsByColor;
  }

  render () {
    const { isCompactMode } = this.state;

    return (
      <div>
        <Toggle
          label="Enable compact mode"
          checked={isCompactMode}
          onChange={this.onChangeCompactMode}
          onText="Compact"
          offText="Normal"
          styles={{ root: { marginBottom: '20px' } }}
        />
        <FocusZone>
          <SelectionZone selection={this.selection} selectionMode={SelectionMode.multiple}>
            <GroupedList
              items={this.items}
              onRenderCell={this.onRenderCell}
              selection={this.selection}
              selectionMode={SelectionMode.single}
              groups={this.groups}
              compact={isCompactMode}
            />
          </SelectionZone>
        </FocusZone>
      </div>
    );
  }

  private onRenderCell = (nestingDepth?: number, item?: IExampleItem, itemIndex?: number): JSX.Element => {
    return (
      <DetailsRow
        columns={this.columns}
        groupNestingDepth={nestingDepth}
        item={item}
        itemIndex={itemIndex ? itemIndex : 0}
        selection={this.selection}
        selectionMode={SelectionMode.single}
        compact={this.state.isCompactMode}
      />
    );
  };

  private onChangeCompactMode = (ev: React.MouseEvent<HTMLElement>, checked?: boolean): void => {
    this.setState({ isCompactMode: checked });
  };
}
