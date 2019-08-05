import React, { useEffect, useState, useRef } from 'react';
import CSSModules from 'react-css-modules';
import styles from './styles.css';
import { gdmnActions } from '../gdmn/actions';
import { IBPProps } from './BP.types';
import { CommandBar, ICommandBarItemProps, Dropdown } from 'office-ui-fabric-react';
import { getLName } from 'gdmn-internals';
import { mxEvent, mxGraph, mxRubberband, mxHierarchicalLayout, mxConstants } from 'mxgraph/javascript/mxClient';
import { flowcharts } from '@src/app/fsm/flowcharts';
import { IBlock, isDecisionTransition } from '@src/app/fsm/types';
import { fsmActions } from '@src/app/fsm/actions';
import { FSM } from '@src/app/fsm/fsm';

interface IGraphState{
  graph: any;
};

export const BP = CSSModules( (props: IBPProps): JSX.Element => {

  const { url, viewTab, dispatch, fsm } = props;
  const [flowchart, setFlowchart] = useState( fsm ? fsm.flowchart : Object.values(flowcharts).length ? Object.values(flowcharts)[0] : null );
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

    if (!flowchart || !container) return;

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
      Object.entries(flowchart.blocks).forEach( ([name, s]) => {
        const style = s.type.shape === 'PROCESS'
          ? 'shape=rectangle'
          : s.type.shape === 'DECISION'
          ? 'shape=rhombus'
          : 'shape=rectangle;rounded=1;fillColor=pink;strokeColor=red';

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

      Object.values(flowchart.flow).forEach( f => {
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

  }, [flowchart, graphContainer.current, fsm]);

  const commandBarItems: ICommandBarItemProps[] = [
    {
      key: 'active',
      text: 'Активный',
      disabled: !fsm || fsm.flowchart === flowchart,
      iconProps: {
        iconName: 'CRMProcesses'
      },
      onClick: () => setFlowchart(fsm!.flowchart)
    },
    {
      key: 'start',
      text: 'Старт',
      disabled: !!fsm || !flowchart,
      iconProps: {
        iconName: 'Play'
      },
      onClick: () => dispatch(fsmActions.setFSM(FSM.create(flowchart!)))
    },
    {
      key: 'stop',
      text: 'Стоп',
      disabled: !fsm || flowchart !== fsm.flowchart,
      iconProps: {
        iconName: 'Stop'
      },
      onClick: () => dispatch(fsmActions.destroyFSM())
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
              selectedKey={flowchart ? flowchart.name : undefined}
              onChange={ (_event, option) => option && typeof option.key === 'string' && setFlowchart(flowcharts[option.key]) }
              placeholder="Select a business process"
              options={Object.entries(flowcharts).map( ([key, bp]) =>({ key, text: getLName(bp.label, ['ru']) }) )}
              //styles={{ dropdown: { width: 300 } }}
            />
            {
              flowchart
              &&
              <div
                styleName="BPCard"
              >
                {getLName(flowchart.description, ['ru'])}
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