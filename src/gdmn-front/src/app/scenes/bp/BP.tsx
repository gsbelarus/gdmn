import React, { useEffect, useState, useRef } from 'react';
import CSSModules from 'react-css-modules';
import styles from './styles.css';
import { gdmnActions } from '../gdmn/actions';
import { IBPProps } from './BP.types';
import { CommandBar, ICommandBarItemProps, Dropdown } from 'office-ui-fabric-react';
import { businessProcesses, IState } from '@src/app/fsm/fsm';
import { getLName } from 'gdmn-internals';
import { mxEvent, mxGraph, mxRubberband, mxHierarchicalLayout, mxConstants, mxPerimeter } from 'mxgraph/javascript/mxClient';

interface IGraphState{
  graph: any;
};

export const BP = CSSModules( (props: IBPProps): JSX.Element => {

  const { url, viewTab, dispatch } = props;
  const [activeBP, setActiveBP] = useState( Object.keys(businessProcesses).length ? Object.keys(businessProcesses)[0] : null );
  const bp = activeBP ? businessProcesses[activeBP] : undefined;
  const [graphState, setGraphState] = useState<IGraphState | null>(null);
  const graphContainer = useRef(null);

  useEffect( () => {
    if (!viewTab) {
      dispatch(gdmnActions.addViewTab({
        url,
        caption: 'BP',
        canClose: true
      }));
    }
  }, []);

  useEffect( () => {
    const container = graphContainer.current;

    if (!bp || !container) return;

    // Disables the built-in context menu
    mxEvent.disableContextMenu(container);

    // Creates the graph inside the given container
    const graph = graphState && graphState.graph ? graphState.graph : new mxGraph(container);

    if (!graphState || !graphState.graph) {
      // Enables rubberband selection
      new mxRubberband(graph);

      const vertexStyle = graph.getStylesheet().getDefaultVertexStyle();
      vertexStyle[mxConstants.STYLE_PERIMETER] = mxPerimeter.RectanglePerimeter;
      vertexStyle[mxConstants.STYLE_GRADIENTCOLOR] = 'white';
      vertexStyle[mxConstants.STYLE_PERIMETER_SPACING] = 6;
      vertexStyle[mxConstants.STYLE_ROUNDED] = true;
      vertexStyle[mxConstants.STYLE_SHADOW] = true;
      vertexStyle[mxConstants.STYLE_FONTFAMILY] = 'Segoe UI';

      const edgeStyle = graph.getStylesheet().getDefaultEdgeStyle();
      edgeStyle[mxConstants.STYLE_ROUNDED] = true;

      graph.gridSize = 20;
    }

    // Gets the default parent for inserting new cells. This
    // is normally the first child of the root (ie. layer 0).
    const parent = graph.getDefaultParent();

    const layout = new mxHierarchicalLayout(graph);

    layout.forceConstant = 80;

    const w = 200;
    const h = 40;

    // Adds cells to the model in a single step
    graph.getModel().beginUpdate();
    try
    {
      graph.removeCells(graph.getChildVertices(parent));

      const map = new Map<IState, any>();
      Object.entries(bp.states).forEach( ([name, s]) => {
        const v = graph.insertVertex(parent, null, s.label ? s.label : name, 0, 0, w, h);
        map.set(s, v);
      });

      bp.flow.forEach( f => {
        graph.insertEdge(parent, null, '', map.get(f.sFrom), map.get(f.sTo));
      });

      layout.execute(parent);
    }
    finally
    {
      // Updates the display
      graph.getModel().endUpdate();
    }

    setGraphState({ graph });

  }, [bp, graphContainer.current]);

  const commandBarItems: ICommandBarItemProps[] = [
    {
      key: 'start',
      text: 'Старт',
      iconProps: {
        iconName: 'CRMProcesses'
      },
      onClick: () => {}
    }
  ];

  return (
    <div styleName="SGrid">
      <div styleName="SGridTop">
        <CommandBar items={commandBarItems} />
      </div>
      <div styleName="SGridTable">
        <div styleName="BPList">
          <div styleName="BPColumn">
            <Dropdown
              label="Бизнес-процесс"
              selectedKey={activeBP}
              onChange={ (_event, option) => option && typeof option.key === 'string' && setActiveBP(option.key) }
              placeholder="Select a business process"
              options={Object.entries(businessProcesses).map( ([key, bp]) =>({ key, text: getLName(bp.label, ['ru']) }) )}
              //styles={{ dropdown: { width: 300 } }}
            />
            {
              activeBP
              &&
              <div
                styleName="BPCard"
              >
                {getLName(businessProcesses[activeBP].description, ['ru'])}
              </div>
            }
          </div>
          <div styleName="BPFlow" ref={graphContainer}>

          </div>
        </div>
      </div>
    </div>
  );
}, styles, { allowMultiple: true });