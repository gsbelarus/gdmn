import React, { Component, Fragment, ReactNode } from 'react';
import { NLPDialog } from 'gdmn-nlp-agent';
// import  './NLPDialogScroll.css';

const topGap = 24;
const scrollTimerDelay = 4000;

interface INLPDialogScrollStateProps {
  readonly nlpDialog: NLPDialog;
}

interface INLPDialogScrollActionsProps {
  addNLPMessage: (text: string) => void;
}

type TNLPDialogScrollProps = INLPDialogScrollStateProps & INLPDialogScrollActionsProps;

interface INLPDialogScrollState {
  text: string;
  prevIdx?: number;
  showFrom: number;
  showTo: number;
  partialOK: boolean;
  recalc: boolean;
  scrollVisible: boolean;
  scrollTimer: any;
  prevClientY?: number;
  prevFrac: number;
}

export class NLPDialogScroll extends Component<TNLPDialogScrollProps, INLPDialogScrollState> {
  public shownItems: HTMLDivElement[] = [];
  public scrollThumb: HTMLDivElement | undefined | null;

  constructor(props: TNLPDialogScrollProps) {
    super(props);

    this.state = {
      text: '',
      showFrom: -1,
      showTo: -1,
      partialOK: true,
      recalc: true,
      scrollVisible: false,
      scrollTimer: undefined,
      prevClientY: -1,
      prevFrac: 0
    };

    this.calcVisibleCount = this.calcVisibleCount.bind(this);
    this.onWheel = this.onWheel.bind(this);
    this.onPointerDown = this.onPointerDown.bind(this);
    this.onPointerUp = this.onPointerUp.bind(this);
    this.onPointerMove = this.onPointerMove.bind(this);
    this.onInputPressEnter = this.onInputPressEnter.bind(this);
    this.onInputKeyDown = this.onInputKeyDown.bind(this);
    this.onInputChange = this.onInputChange.bind(this);
  }

  private onInputPressEnter(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    const { text } = this.state;
    const trimText = text.trim();

    if (e.key === 'Enter' && trimText) {
      const { addNLPMessage } = this.props;
      addNLPMessage(trimText);

      this.setState({
        text: '',
        showFrom: -1,
        showTo: -1,
        partialOK: true,
        recalc: true
      });
      e.preventDefault();
    }
  }

  private onInputKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    const { text, prevIdx } = this.state;
    const { nlpDialog } = this.props;

    const findNextItemIdx = (currIdx: number) => {
      const { nlpDialog } = this.props;
      let idx = currIdx;
      if (e.key === 'ArrowUp') {
        while (idx >= 0 && nlpDialog[idx].who !== 'me') {
          idx--;
        }

        if (idx < 0) {
          idx = nlpDialog.length - 1;
          while (idx > currIdx && nlpDialog[idx].who !== 'me') {
            idx--;
          }
        }
      } else {
        while (idx < nlpDialog.length && nlpDialog[idx].who !== 'me') {
          idx++;
        }

        if (idx >= nlpDialog.length) {
          idx = 0;
          while (idx < currIdx && nlpDialog[idx].who !== 'me') {
            idx++;
          }
        }
      }
      return idx;
    };

    if (nlpDialog.length && (!text || prevIdx !== undefined) && (e.key === 'ArrowUp' || e.key === 'ArrowDown')) {
      e.stopPropagation();
      e.preventDefault();
      const nextIdx = e.key === 'ArrowUp'
        ? findNextItemIdx(prevIdx === undefined ? nlpDialog.length - 1 : (prevIdx - 1))
        : findNextItemIdx(prevIdx === undefined ? 0 : (prevIdx + 1));
      if (nextIdx !== prevIdx) {
        this.setState({
          text: nlpDialog[nextIdx].text,
          prevIdx: nextIdx
        });
      }
    } else {
      if (prevIdx !== undefined) {
        this.setState({
          prevIdx: undefined
        });
      }
    }
  }

  private onInputChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    this.setState({ text: e.target.value });
  }

  private onWheel(e: React.WheelEvent<HTMLDivElement>) {
    const delayedScrollHide = () => ({
      scrollVisible: true,
      scrollTimer: setTimeout(() => this.setState({ scrollVisible: false, scrollTimer: undefined }), scrollTimerDelay)
    });

    e.preventDefault();

    const { nlpDialog } = this.props;
    const { showFrom, showTo, scrollTimer } = this.state;

    if (scrollTimer) {
      clearTimeout(scrollTimer);
    }

    if (e.deltaY < 0) {
      if (showFrom > 0) {
        this.setState({
          showFrom: showFrom - 1,
          showTo: showTo - 1,
          partialOK: false,
          recalc: true,
          ...delayedScrollHide()
        });
      } else {
        this.setState({
          partialOK: false,
          recalc: true,
          ...delayedScrollHide()
        });
      }
    } else if (e.deltaY > 0 && showTo < nlpDialog.length - 1) {
      this.setState({
        showFrom: showFrom + 1,
        showTo: showTo + 1,
        partialOK: true,
        recalc: true,
        ...delayedScrollHide()
      });
    } else {
      this.setState({
        ...delayedScrollHide()
      });
    }
  }

  private onPointerDown(e: React.PointerEvent<HTMLDivElement>) {
    e.preventDefault();

    if (e.currentTarget === e.target && this.scrollThumb) {
      const { nlpDialog } = this.props;
      const { showFrom, showTo } = this.state;

      const above = e.clientY <= this.scrollThumb.getBoundingClientRect().top;
      const page = showTo - showFrom + 1;
      let newFrom: number;
      let newTo: number;

      if (above) {
        newFrom = showFrom - page;
        newTo = showTo - page;
      } else {
        newFrom = showFrom + page;
        newTo = showTo + page;
      }

      if (newFrom < 0) {
        newFrom = 0;
      }

      if (newFrom >= nlpDialog.length) {
        newFrom = nlpDialog.length - 1;
      }

      if (newTo < newFrom) {
        newTo = newFrom;
      }

      if (newTo >= nlpDialog.length) {
        newTo = nlpDialog.length - 1;
      }

      this.setState({
        showFrom: newFrom,
        showTo: newTo,
        partialOK: !above,
        recalc: true
      });
    } else {
      e.currentTarget.setPointerCapture(e.pointerId);
      this.setState({
        scrollVisible: true,
        prevClientY: e.clientY,
        prevFrac: 0
      });
    }
  }

  private onPointerMove(e: React.PointerEvent<HTMLDivElement>) {
    const { nlpDialog } = this.props;
    const { showFrom, showTo, prevClientY, prevFrac } = this.state;

    if (!(e.buttons === 1 && typeof prevClientY === 'number' && nlpDialog.length)) return;
    e.preventDefault();

    const deltaY = e.clientY - prevClientY;
    const deltaPrecise = deltaY / (e.currentTarget.clientHeight / nlpDialog.length);
    const deltaCorrected = deltaPrecise + prevFrac;
    const delta = Math.trunc(deltaCorrected);

    if (!delta) return;
    if (showFrom === 0 && delta < 0) {
      this.setState({
        partialOK: false,
        recalc: true
      });
    } else {
      let newFrom = showFrom + delta;
      if (newFrom < 0) newFrom = 0;
      let newTo = showTo + delta;
      if (newTo >= nlpDialog.length) newTo = nlpDialog.length - 1;
      if (newFrom > newTo) newFrom = newTo;
      this.setState({
        showFrom: newFrom,
        showTo: newTo,
        partialOK: !!newFrom,
        recalc: true,
        prevClientY: e.clientY,
        prevFrac: deltaCorrected - delta
      });
    }
  }

  private onPointerUp(e: React.PointerEvent<HTMLDivElement>) {
    e.preventDefault();
    e.currentTarget.releasePointerCapture(e.pointerId);
    const { scrollTimer } = this.state;

    if (scrollTimer) {
      clearTimeout(scrollTimer);
    }

    this.setState({
      scrollVisible: true,
      scrollTimer: setTimeout(() => this.setState({ scrollVisible: false, scrollTimer: undefined }), scrollTimerDelay),
      prevClientY: undefined,
      prevFrac: 0
    });
  }

  private calcVisibleCount() {
    const { nlpDialog } = this.props;
    const { recalc, partialOK } = this.state;

    if (!recalc) return;

    const showFrom = this.state.showFrom === -1 ? nlpDialog.length - 1 : this.state.showFrom;
    const showTo = this.state.showTo === -1 ? nlpDialog.length - 1 : this.state.showTo;

    if (this.shownItems.length) {
      if (this.shownItems[0].offsetTop > topGap) {
        if (this.shownItems.length < nlpDialog.length && showFrom > 0) {
          this.setState({
            showFrom: showFrom - 1,
            showTo
          });
        } else {
          this.setState({
            showFrom,
            showTo,
            recalc: false
          });
        }
      } else if (this.shownItems[0].offsetTop + this.shownItems[0].offsetHeight < 0 && showFrom < showTo) {
        this.setState({
          showFrom: showFrom + 1,
          showTo,
          recalc: true
        });
      } else if (this.shownItems[0].offsetTop < 0 && !partialOK && !showFrom && showFrom < showTo) {
        this.setState({
          showFrom,
          showTo: showTo - 1,
          recalc: false
        });
      } else {
        this.setState({
          showFrom,
          showTo,
          recalc: false
        });
      }
    } else {
      this.setState({
        showFrom: 0,
        showTo: 0,
        recalc: false
      });
    }
  }

  public componentDidMount(): void {
    this.calcVisibleCount();
  }

  public componentDidUpdate(): void {
    this.calcVisibleCount();
  }

  public render(): ReactNode {
    const { nlpDialog } = this.props;
    const { scrollVisible } = this.state;

    const showFrom = this.state.showFrom === -1 ? nlpDialog.length - 1 : this.state.showFrom;
    const showTo = this.state.showTo === -1 ? nlpDialog.length - 1 : this.state.showTo;

    const thumbHeight = `${Math.trunc(((showTo - showFrom + 1) / nlpDialog.length) * 100).toString()}%`;
    const thumbTop = `${Math.trunc((showFrom / nlpDialog.length) * 100).toString()}%`;
    this.shownItems = [];

    return (
      <Fragment>
        <div className="NLPDialog">
          <div className="NLPItems" onWheel={this.onWheel}>
            {nlpDialog &&
              nlpDialog.map(
                (i, idx) =>
                  i &&
                  typeof idx === 'number' &&
                  idx >= showFrom &&
                  idx <= showTo && (
                    <div key={idx} className={`NLPItem ${i.who === 'me' ? 'NLPItemRight' : 'NLPItemLeft'}`} ref={elem => elem && this.shownItems.push(elem)}>
                    {
                      i.who === 'me' ?
                        <>
                          <span
                            className="Message MessageRight"
                            onClick={ () => this.setState({ text: i.text, prevIdx: undefined })}
                          >
                            {i.text}
                          </span>
                          <span className="Circle">{i.who}</span>
                        </>
                      :
                        <>
                          <span className="Circle">{i.who}</span>
                          <span className="Message MessageLeft">{i.text}</span>
                        </>
                    }
                    </div>
                  )
              )}
            <div
              className={scrollVisible ? 'NLPScrollBarVisible' : 'NLPScrollBar'}
              onPointerDown={this.onPointerDown}
              onPointerUp={this.onPointerUp}
              onPointerMove={this.onPointerMove}
            >
              <div
                className="NLPScrollBarThumb"
                style={{ height: thumbHeight, top: thumbTop }}
                ref={elem => (this.scrollThumb = elem)}
              />
            </div>
          </div>
          <div className="NLPInput">
            <textarea
              spellCheck={false}
              value={this.state.text}
              onKeyPress={this.onInputPressEnter}
              onKeyDown={this.onInputKeyDown}
              onChange={this.onInputChange}
            />
          </div>
        </div>
        <svg height="0" width="0">
          <defs>
            <clipPath id="left-droplet">
              <path d="M 10,0 A 10,10 0 0 1 0,10 H 16 V 0 Z" />
            </clipPath>
            <clipPath id="right-droplet">
              <path d="M 6,0 A 10,10 0 0 0 16,10 H 0 V 0 Z" />
            </clipPath>
          </defs>
        </svg>
      </Fragment>
    );
  }
}