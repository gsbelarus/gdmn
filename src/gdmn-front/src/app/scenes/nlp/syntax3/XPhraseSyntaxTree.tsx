import React from "react";
import { Phrase, PhraseItem, AnyWord, IXParseResultSuccess, IXPhrase } from "gdmn-nlp";
import { Edge as DagreEdge, graphlib, layout } from 'dagre';
import { Edge } from "./Edge";
import { Rect } from "./Rect";

interface IXPhraseSyntaxTreeProps {
  parsed: IXParseResultSuccess;
};

export const XPhraseSyntaxTree = (props: IXPhraseSyntaxTreeProps) => {
  const { parsed } = props;
  const { phrase } = parsed;

  // Create a new directed graph
  const g = new graphlib.Graph();

  // Set an object for the graph label
  g.setGraph({});

  // Default to assigning a new object as a label for each new edge.
  g.setDefaultEdgeLabel(() => {
    return {};
  });

  const recurs = (
    phr: IXPhrase
  ) => {
    const label = phr.phraseTemplateId;
    g.setNode(phr.id.toString(), {
      label,
      width: label.length * 9 + 8,
      height: 26,
      className: 'phrase'
    });

    if (phr.specifier) {
      recurs(phr.specifier);
      g.setEdge(phr.id.toString(), phr.specifier.id.toString());
    }

    if (phr.head) {
      recurs(phr.head);
      g.setEdge(phr.id.toString(), phr.head.id.toString());
    }
    else if (phr.headTokens?.length) {
      for (const t of phr.headTokens) {
        if (t.type === 'WORD') {
          let label = `${t.negative ? 'NEG ' : ''}${t.word.word}`;
          if (t.uniform) {
            for (const u of t.uniform) {
              if (u.type === 'WORD') {
                label += ' ' + u.word.word;
              } else {
                label += u.token.image;
              }
            }
          }
          g.setNode(t.id.toString(), {
            label,
            width: label.length * 9 + 8,
            height: 26,
            className: 'word',
            rank: 'min'
          });
        } else {
          const label = t.token.image;
          g.setNode(t.id.toString(), {
            label,
            width: label.length * 9 + 8,
            height: 26,
            className: 'word',
            rank: 'min'
          });
        }
        g.setEdge(phr.id.toString(), t.id.toString());
      }
    }

    if (phr.complements?.length) {
      for (const complement of phr.complements) {
        recurs(complement);
        g.setEdge(phr.id.toString(), complement.id.toString());
      }
    }
  };

  recurs(phrase);

  g.graph().ranksep = 36;
  g.graph().marginx = 2;
  g.graph().marginy = 2;
  layout(g);

  const makeRect = (n: string, idx: number) => {
    const nd = g.node(n) as any;
    if (!nd) return null;

    const x = nd.x - nd.width / 2;
    const y = nd.y - nd.height / 2;
    const rectStyle = nd.className === 'word'
      ? {
          stroke: 'none',
          fill: 'aquamarine'
        }
      : {
          stroke: 'none',
          fill: 'white'
        };
    return (
      <Rect key={idx} x={x} y={y} width={nd.width} height={nd.height} text={nd.label} rectStyle={rectStyle} />
    );
  };

  const makeEdge = (e: DagreEdge, idx: number) => <Edge key={idx} points={g.edge(e).points} />;

  return (
    <div style={{ display: 'flex', flexDirection: 'row' }}>
      {g.graph() ? (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width={g.graph().width}
          height={g.graph().height}
          viewBox={'0 0 ' + g.graph().width + ' ' + g.graph().height}
          preserveAspectRatio="xMidYMid meet"
          style={{
            display: 'block',
            margin: 'auto',
            paddingTop: '16px'
          }}
        >
          <defs>
            <marker
              id="arrow"
              viewBox="0 0 10 10"
              refX="9"
              refY="5"
              markerUnits="strokeWidth"
              markerWidth="8"
              markerHeight="6"
              orient="auto"
            >
              <path d="M 0 0 L 10 5 L 0 10 Z" style={{ strokeWidth: '1', fill: 'gray' }} />
            </marker>
          </defs>
          <g>
            {g.nodes().map((n, idx) => makeRect(n, idx))}
            {g.edges().map((e, idx) => makeEdge(e, idx))}
          </g>
        </svg>
      ) : null}
    </div>
  );
}