import React, { Component } from 'react';
import { Checkbox, TextField, PrimaryButton } from 'office-ui-fabric-react';
import './setParameterLoad.css';
import { load } from '../appAction';
import { IERModels } from '../ermodel/reducer';

export interface IParameterState {
  host: string;
  port: string;
  isReadFile: boolean;
};

export interface ISetParameterProps {
  host: string,
  port: string,
  isReadFile: boolean,
  ermodel: IERModels,
  loading: boolean,
  onLoadByParameter: (host: string, port: string, isReadFile: boolean) => void,
  onParametersLoading: (host: string, port: string, isReadFile: boolean) => void,
  onSetLoading: (loading: boolean) => void,
}

export class SetParameterLoad extends Component<ISetParameterProps, IParameterState> {
  state: IParameterState = {
    host: this.props.host,
    port: this.props.port,
    isReadFile: this.props.isReadFile
  };

  render() {

    return (
      <div className='SetParamBox'>
        <TextField
            label="Host"
            style={{maxWidth: '200px'}}
            value={this.state.host}
            disabled={this.state.isReadFile}
            onChange={ (e: React.ChangeEvent<HTMLInputElement>) => {
              this.setState( {host: e.target.value });
            }}
          />
        <TextField
            label="port"
            style={{maxWidth: '200px'}}
            value={this.state.port}
            disabled={this.state.isReadFile}
            onChange={ (e: React.ChangeEvent<HTMLInputElement>) => {
              this.setState( {port: e.target.value });
            }}
          />

        <Checkbox
          label="Reading from file"
          style={{ maxWidth: '48px' }}
          checked={this.state.isReadFile}
          disabled={this.props.loading}
          onChange={ (_ev: React.FormEvent<HTMLElement>, isChecked: boolean) => {
            this.setState( {isReadFile: isChecked });
          }}
        />
        
        <PrimaryButton
          text="Загрузить"
          style={{ maxWidth: '48px' }}
          disabled={this.props.loading}
          onClick={ () => {
            this.props.onLoadByParameter(this.state.host, this.state.port, this.state.isReadFile);
            this.props.onParametersLoading(this.state.host, this.state.port, this.state.isReadFile);
          } }
        />
      </div>
    );
  }
}
