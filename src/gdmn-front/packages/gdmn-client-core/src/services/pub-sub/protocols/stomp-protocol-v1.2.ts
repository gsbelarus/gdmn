import { StompHeaders as IFrameHeaders } from '@stomp/stompjs';

/**
 * client protocol
 */

type TBaseFrameHeader<
  THeaderKey extends TFrameHeaderKey,
  TRequiredHeaderKey extends TFrameHeaderKey,
  TExtendedHeaderKey extends TFrameHeaderKey = TStandardHeaderKey.CONTENT_LENGTH
> = { [key in TRequiredHeaderKey]: TFrameHeaderValue } &
  Partial<{ [key in Exclude<THeaderKey, TRequiredHeaderKey> | TStandardHeaderKey]: TFrameHeaderValue }> &
  IFrameHeaders;

export type TStompFrameHeaders = TBaseFrameHeader<
  TStompFrameHeaderKey,
  TStompFrameHeaderKeyRequired,
  TStompFrameHeaderKeyStandard
>;

export type TDisconnectFrameHeaders = TBaseFrameHeader<'', '', TDisconnectFrameHeaderKeyStandard>;

export type TSendFrameHeaders = TBaseFrameHeader<
  TSendFrameHeaderKey,
  TSendFrameHeaderKeyRequired,
  TSendFrameHeaderKeyStandard
>;

type TAckFrameHeaders = TBaseFrameHeader<TAckFrameHeaderKey, TAckFrameHeaderKeyRequired, TAckFrameHeaderKeyStandard>;

type TNackFrameHeaders = TBaseFrameHeader<
  TNackFrameHeaderKey,
  TNackFrameHeaderKeyRequired,
  TNackFrameHeaderKeyStandard
>;

export type TSubcribeFrameHeaders = TBaseFrameHeader<
  TSubcribeFrameHeaderKey,
  TSubcribeFrameHeaderKeyRequired,
  TSubcribeFrameHeaderKeyStandard
>;

type TUnsubcribeFrameHeaders = TBaseFrameHeader<
  TUnsubcribeFrameHeaderKey,
  TUnsubcribeFrameHeaderKeyRequired,
  TUnsubcribeFrameHeaderKeyStandard
>;

type TBeginFrameHeaders = TBaseFrameHeader<
  TBeginFrameHeaderKey,
  TBeginFrameHeaderKeyRequired,
  TBeginFrameHeaderKeyStandard
>;

type TCommitFrameHeaders = TBaseFrameHeader<
  TCommitFrameHeaderKey,
  TCommitFrameHeaderKeyRequired,
  TCommitFrameHeaderKeyStandard
>;

type TAbortFrameHeaders = TBaseFrameHeader<
  TAbortFrameHeaderKey,
  TAbortFrameHeaderKeyRequired,
  TAbortFrameHeaderKeyStandard
>;

/**
 * STOMP PROTOCOL V1.2
 * headers
 */

type TFrameHeaderKey = string;
type TFrameHeaderValue = string; // | undefined;
// type TFrameHeaderValueAck = 'auto' | 'client' | 'client-individual';

export const enum TStandardHeaderKey {
  CONTENT_LENGTH = 'content-length',
  CONTENT_TYPE = 'content-type',
  RECEIPT = 'receipt'
};

/* stomp */
const enum TStompFrameHeaderKey {
  ACCEPT_VERSION = 'accept_version',
  HOST = 'host',
  LOGIN = 'login',
  PASSCODE = 'passcode',
  HEART_BEAT = 'heart-beat'
};

type TStompFrameHeaderKeyRequired = TStompFrameHeaderKey.ACCEPT_VERSION | TStompFrameHeaderKey.HOST;
type TStompFrameHeaderKeyStandard = TStandardHeaderKey.CONTENT_LENGTH | TStandardHeaderKey.RECEIPT;

/* disconnect */
type TDisconnectFrameHeaderKeyStandard = TStandardHeaderKey.CONTENT_LENGTH | TStandardHeaderKey.RECEIPT;

/* send */
const enum TSendFrameHeaderKey {
  DESTINATION = 'destination',
  TRANSACTION = 'transaction'
}
type TSendFrameHeaderKeyRequired = TSendFrameHeaderKey.DESTINATION;
type TSendFrameHeaderKeyStandard = TStandardHeaderKey;

/* ack */
const enum TAckFrameHeaderKey {
  ID = 'id',
  TRANSACTION = 'transaction'
}
type TAckFrameHeaderKeyRequired = TAckFrameHeaderKey.ID;
type TAckFrameHeaderKeyStandard = TStandardHeaderKey.CONTENT_LENGTH | TStandardHeaderKey.RECEIPT;

/* nack */
type TNackFrameHeaderKey = TAckFrameHeaderKey;
type TNackFrameHeaderKeyRequired = TAckFrameHeaderKeyRequired;
type TNackFrameHeaderKeyStandard = TAckFrameHeaderKeyStandard;

/* subscribe */
const enum TSubcribeFrameHeaderKey {
  DESTINATION = 'destination',
  ID = 'id',
  ACK = 'ack'
}
type TSubcribeFrameHeaderKeyRequired = TSubcribeFrameHeaderKey.DESTINATION | TSubcribeFrameHeaderKey.ID;
type TSubcribeFrameHeaderKeyStandard = TStandardHeaderKey.CONTENT_LENGTH | TStandardHeaderKey.RECEIPT;

/* unsubscribe */
const enum TUnsubcribeFrameHeaderKey {
  ID = 'id'
}
type TUnsubcribeFrameHeaderKeyRequired = TUnsubcribeFrameHeaderKey.ID;
type TUnsubcribeFrameHeaderKeyStandard = TStandardHeaderKey.CONTENT_LENGTH | TStandardHeaderKey.RECEIPT;

/* begin */
const enum TBeginFrameHeaderKey {
  TRANSACTION = 'transaction'
}
type TBeginFrameHeaderKeyRequired = TBeginFrameHeaderKey.TRANSACTION;
type TBeginFrameHeaderKeyStandard = TStandardHeaderKey.CONTENT_LENGTH | TStandardHeaderKey.RECEIPT;

/* commit */
type TCommitFrameHeaderKey = TBeginFrameHeaderKey;
type TCommitFrameHeaderKeyRequired = TBeginFrameHeaderKeyRequired;
type TCommitFrameHeaderKeyStandard = TBeginFrameHeaderKeyStandard;

/* abort */
type TAbortFrameHeaderKey = TBeginFrameHeaderKey;
type TAbortFrameHeaderKeyRequired = TBeginFrameHeaderKeyRequired;
type TAbortFrameHeaderKeyStandard = TBeginFrameHeaderKeyStandard;
