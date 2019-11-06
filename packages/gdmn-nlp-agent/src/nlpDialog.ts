export interface INLPDialogItem {
  who: string;
  text: string;
};

export type NLPDialog = INLPDialogItem[];

export interface INLPDialogEnvelope {
  version: string;
  nlpDialog: NLPDialog;
};
