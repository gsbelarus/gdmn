import React, { useEffect, useState, useRef } from 'react';
import CSSModules from 'react-css-modules';
import styles from './styles.css';
import { gdmnActions } from '../gdmn/actions';
import { IBPProps } from './BP.types';
import { CommandBar, ICommandBarItemProps, Dropdown } from 'office-ui-fabric-react';
import { getLName } from 'gdmn-internals';
import { mxEvent, mxGraph, mxRubberband, mxHierarchicalLayout, mxConstants } from 'mxgraph/javascript/mxClient';
import { flowCharts } from '@src/app/fsm/flowCharts';
import { IBlock, isDecisionTransition } from '@src/app/fsm/types';

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
      vertexStyle[mxConstants.STYLE_PERIMETER_SPACING] = 2;
      vertexStyle[mxConstants.STYLE_FONTFAMILY] = 'Segoe UI';

      const edgeStyle = graph.getStylesheet().getDefaultEdgeStyle();
      edgeStyle[mxConstants.STYLE_ROUNDED] = true;

      graph.gridSize = 20;
    }

    // Gets the default parent for inserting new cells. This
    // is normally the first child of the root (ie. layer 0).
    const parent = graph.getDefaultParent();

    const layout = new mxHierarchicalLayout(graph);

    layout.interRankCellSpacing = 40;
    layout.forceConstant = 80;

    const w = 200;
    const h = 32;

    // Adds cells to the model in a single step
    graph.getModel().beginUpdate();
    try
    {
      graph.removeCells(graph.getChildVertices(parent));

      const map = new Map<IBlock, any>();
      Object.entries(bp.blocks).forEach( ([name, s]) => {
        const style = s.type.shape === 'PROCESS'
          ? 'shape=rectangle'
          : s.type.shape === 'DECISION'
          ? 'shape=rhombus'
          : 'shape=rectangle;rounded=1;fillColor=pink;strokeColor=red'
        const v = graph.insertVertex(
          parent,
          null,
          s.label ? s.label : name,
          0,
          0,
          w,
          s.type.shape === 'DECISION' ? h * 1.5 : h,
          style);
        map.set(s, v);
      });

      const connectBlocks = (fromBlock: IBlock, toBlock: IBlock | IBlock[], edgeLabel: string = '') => {
        if (Array.isArray(toBlock)) {
          const v = graph.insertVertex(parent, null, 'X', 0, 0, 24, 24, 'shape=rhombus;rounded=false;perimeterSpacing=2');
          graph.insertEdge(parent, null, edgeLabel, map.get(fromBlock), v);
          toBlock.forEach( to => graph.insertEdge(parent, null, '', v, map.get(to)) );
        } else {
          graph.insertEdge(parent, null, edgeLabel, map.get(fromBlock), map.get(toBlock));
        }
      };

      Object.values(bp.flow).forEach( f => {
        if (isDecisionTransition(f)) {
          connectBlocks(f.from, f.yes, 'Yes');
          connectBlocks(f.from, f.no, 'No');
        }
        else {
          connectBlocks(f.from, f.to);
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