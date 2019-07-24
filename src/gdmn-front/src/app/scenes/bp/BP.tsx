import React, { useEffect, useState, useRef } from 'react';
import CSSModules from 'react-css-modules';
import styles from './styles.css';
import { gdmnActions } from '../gdmn/actions';
import { IBPProps } from './BP.types';
import { CommandBar, ICommandBarItemProps, Dropdown, arraysEqual } from 'office-ui-fabric-react';
import { flowCharts, IBlock, isDecisionTransition } from '@src/app/fsm/fsm';
import { getLName } from 'gdmn-internals';
import { mxEvent, mxGraph, mxRubberband, mxHierarchicalLayout, mxConstants, mxPerimeter } from 'mxgraph/javascript/mxClient';

interface IGraphState{
  graph: any;
};

export const BP = CSSModules( (props: IBPProps): JSX.Element => {

  const { url, viewTab, dispatch } = props;
  const [activeBP, setActiveBP] = useState( Object.keys(flowCharts).length ? Object.keys(flowCharts)[0] : null );
  const bp = activeBP ? flowCharts[activeBP] : undefined;
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
      vertexStyle[mxConstants.STYLE_PERIMETER_SPACING] = 2;
      vertexStyle[mxConstants.STYLE_ROUNDED] = true;
      vertexStyle[mxConstants.STYLE_SHADOW] = false;
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

      const map = new Map<IBlock, any>();
      Object.entries(bp.states).forEach( ([name, s]) => {
        const v = graph.insertVertex(parent, null, s.label ? s.label : name, 0, 0, w, h, 'shape=rectangle');
        map.set(s, v);
      });

      bp.flow.forEach( f => {
        if (isDecisionTransition(f)) {
          if (Array.isArray(f.yes)) {
            f.yes.forEach( to => graph.insertEdge(parent, null, '', map.get(f.from), map.get(to)) );
          } else {
            graph.insertEdge(parent, null, '', map.get(f.from), map.get(f.yes));
          }

          if (Array.isArray(f.no)) {
            f.no.forEach( to => graph.insertEdge(parent, null, '', map.get(f.from), map.get(to)) );
          } else {
            graph.insertEdge(parent, null, '', map.get(f.from), map.get(f.no));
          }
        } else {
          if (Array.isArray(f.to)) {
            f.to.forEach( to => graph.insertEdge(parent, null, '', map.get(f.from), map.get(to)) );
          } else {
            graph.insertEdge(parent, null, '', map.get(f.from), map.get(f.to));
          }
        }
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
              options={Object.entries(flowCharts).map( ([key, bp]) =>({ key, text: getLName(bp.label, ['ru']) }) )}
              //styles={{ dropdown: { width: 300 } }}
            />
            {
              activeBP
              &&
              <div
                styleName="BPCard"
              >
                {getLName(flowCharts[activeBP].description, ['ru'])}
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