import React from 'react';
import { useState } from 'react';
import { IDragDropEvents, buildColumns, getTheme, mergeStyles, IDragDropContext } from 'office-ui-fabric-react';
import { MarqueeSelection } from 'office-ui-fabric-react/lib/MarqueeSelection';
import { DetailsList, Selection, SelectionMode } from 'office-ui-fabric-react/lib/DetailsList';

const theme = getTheme();
const dragEnterClass = mergeStyles({
  backgroundColor: theme.palette.neutralLight
});

export const DetailsListDragDrop = (props: {items: any[], onInsertItem: (item: any, position: number) => void}): JSX.Element => {
  let _draggedItem: any | undefined;
  let _draggedIndex: number = -1;

  const _selection = new Selection()
  const [items, onChangeItems] = useState(props.items)
  const columns = buildColumns(items, true);

  const _getDragDropEvents = (): IDragDropEvents => {
    return {
      canDrop: (dropContext?: IDragDropContext, dragContext?: IDragDropContext) => {
        return true;
      },
      canDrag: (item?: any) => {
        return true;
      },
      onDragEnter: (item?: any, event?: DragEvent) => {
        return dragEnterClass;
      },
      onDragLeave: (item?: any, event?: DragEvent) => {
        return;
      },
      onDrop: (item?: any, event?: DragEvent) => {
        if (_draggedItem) {
          _insertBeforeItem(item);
          const position = items.findIndex(object => object === item)
          props.onInsertItem(_draggedItem.key, position - 1)
        }
      },
      onDragStart: (item?: any, itemIndex?: number, selectedItems?: any[], event?: MouseEvent) => {
        _draggedItem = item;
        _draggedIndex = itemIndex!;
      },
      onDragEnd: (item?: any, event?: DragEvent) => {
        _draggedItem = undefined;
        _draggedIndex = -1;
      }
    };
  }
  
  const _dragDropEvents: IDragDropEvents = _getDragDropEvents();

  const _insertBeforeItem = (item: any): void => {
    const draggedItems = _selection.isIndexSelected(_draggedIndex)
      ? (_selection.getSelection())
      : [_draggedItem!];

    const itemsfilter = items.filter(itm => draggedItems.indexOf(itm) === -1);
    let insertIndex = itemsfilter.indexOf(item);

    if (insertIndex === -1) {
      insertIndex = 0;
    }

    itemsfilter.splice(insertIndex, 0, ...draggedItems);

    onChangeItems(itemsfilter);
  }

  return (
    <div>
      <MarqueeSelection selection={_selection}>
        <DetailsList
          setKey="items"
          items={items}
          columns={columns}
          selectionPreservedOnEmptyClick={true}
          selectionMode={SelectionMode.none}
          dragDropEvents={_dragDropEvents}
        />
      </MarqueeSelection>
    </div>
  );
}
