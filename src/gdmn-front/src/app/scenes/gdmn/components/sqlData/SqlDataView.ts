import {DataView, IDataViewProps} from "@src/app/components/DataView";

export interface ISqlDataViewProps extends IDataViewProps<any> {
  run: () => void;
  onChange: (ev: any, text?: string) => void;
}

export interface ISqlDataViewState {

}

// export class SqlDataView extends DataView<ISqlDataViewProps, ISqlDataViewState> {
//
// }
