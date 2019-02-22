import React, { Component } from 'react';
import { Checkbox, TextField, PrimaryButton } from 'office-ui-fabric-react';
import './setParameterLoad.css';

export interface ISetParameterProps {
  host: string,
  port: string,
  isReadFile: boolean,
  errorMessage: string,
  onSetTextHost: (text: string) => void,
  onSetTextPort: (text: string) => void,
  onSetReadFile: (check: boolean) => void,
  onLoadByParam: (host: string, port: string, isReadFile: boolean) => void,
}

export class SetParameterLoad extends Component<ISetParameterProps, {}> {

  render() {
    return (
      <div className='SetParamBox'>
        <TextField
            label="Host"
            style={{maxWidth: '200px'}}
            value={this.props.host}
            disabled={this.props.isReadFile}
            onChange={ (e: React.ChangeEvent<HTMLInputElement>) => {
              this.props.onSetTextHost(e.target.value);
            }}
          />
        <TextField
            label="port"
            style={{maxWidth: '200px'}}
            value={this.props.port}
            disabled={this.props.isReadFile}
            onChange={ (e: React.ChangeEvent<HTMLInputElement>) => {
              this.props.onSetTextPort(e.target.value);
            }}
          />

        <Checkbox
          label="Reading from file"
          style={{ maxWidth: '48px' }}
          checked={this.props.isReadFile}
          onChange={ (_ev: React.FormEvent<HTMLElement>, isChecked: boolean) => {
            this.props.onSetReadFile(isChecked);
          }}
        />
        
        <PrimaryButton
          text="Загрузить"
          style={{ maxWidth: '48px' }}
          onClick={ () => {
            this.props.onLoadByParam(this.props.host, this.props.port, this.props.isReadFile);
          } }
        />
      </div>
    );
  }
}
