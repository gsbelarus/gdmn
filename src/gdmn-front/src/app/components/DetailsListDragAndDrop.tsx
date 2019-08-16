import React, { useEffect, useRef } from 'react';
import { useState } from 'react';
import { IDragDropEvents, buildColumns, getTheme, mergeStyles, IDragDropContext } from 'office-ui-fabric-react';
import { MarqueeSelection } from 'office-ui-fabric-react/lib/MarqueeSelection';
import { DetailsList, Selection, IColumn } from 'office-ui-fabric-react/lib/DetailsList';

const theme = getTheme();
const dragEnterClass = mergeStyles({
  backgroundColor: theme.palette.neutralLight
});

export interface IDetailsListDragDropProps {
  items: any[], 
  onInsertItem: (item: any, position: number) => void
};

export const DetailsListDragDrop = (props: IDetailsListDragDropProps): JSX.Element => {

  const { items } = props; 

  const _draggedItem = useRef<any>(undefined);
  const _draggedIndex = useRef(-1);

  const [columns, setColumns] = useState([] as IColumn[]);
  const [selection, setSelection] = useState(new Selection());

  useEffect( () => {
    setColumns(buildColumns(items, true));
  }, [items]);

  const _insertBeforeItem = (item: any): void => {
    const draggedItems = selection.isIndexSelected(_draggedIndex.current)
      ? (selection.getSelection())
      : [_draggedItem.current];

    const itemsfilter = items.filter(itm => draggedItems.indexOf(itm) === -1);
    let insertIndex = itemsfilter.indexOf(item);

    if (insertIndex === -1) {
      insertIndex = 0;
    }

    itemsfilter.splice(insertIndex, 0, ...draggedItems);
  }

  return (
    <MarqueeSelection selection={selection}>
      <DetailsList
        setKey="items"
        getKey={ (item: any) => item.key }
        items={items}
        columns={columns}
        selection={selection}
        dragDropEvents={{
          canDrop: () => true,
          canDrag: () => true,
          onDragEnter: () => dragEnterClass,
          onDragLeave: undefined,
          onDrop: (item?: any, event?: DragEvent) => {
            if (_draggedItem.current) {
              _insertBeforeItem(item);
              const position = items.findIndex(object => object === item)
              props.onInsertItem(_draggedItem.current.key, position - 1)
            }
          },
          onDragStart: (item?: any, itemIndex?: number, selectedItems?: any[], event?: MouseEvent) => {
            _draggedItem.current = item;
            _draggedIndex.current = itemIndex!;
          },
          onDragEnd: (item?: any, event?: DragEvent) => {
            _draggedItem.current = undefined;
            _draggedIndex.current = -1;
          }
        }}
        selectionPreservedOnEmptyClick={true}
        enterModalSelectionOnTouch={true}
      />
    </MarqueeSelection>
  );
}
