import React from 'react';
import IoModuleList from './IoModuleList';
import classNames from 'classnames';
import * as IoModules from '../iomodules';
import '../style/iomodule';


export default class IoModuleForm extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      isAddActive: false,
      availableIoModules: Object.keys(IoModules),
    };

    this.removeIoModule = this.removeIoModule.bind(this);
    this.handleClickAddIoModule = this.handleClickAddIoModule.bind(this);
    this.addIoModule = this.addIoModule.bind(this);
  }

  removeIoModule(ioModule) {
    this.props.removeIoModule(ioModule);
  }

  handleClickAddIoModule() {
    this.setState({
      isAddActive: !this.state.isAddActive,
    });
  }

  addIoModule(ioModuleName) {
    this.props.addIoModule(ioModuleName);
  }

  render() {
    return (
      <div>
        <IoModuleList 
          ioModules={this.props.ioModules}
          remove={this.removeIoModule} 
          configure={this.configureIoModule}
          ref={ ioModuleList => this.ioModuleList = ioModuleList }
          setCurrentMs={this.props.setCurrentMs}
          setPlaying={this.props.setPlaying}
        />
        <button type="button" onClick={this.handleClickAddIoModule} className="hidden">add</button>
        <div className={classNames("add-io-module", { active: this.state.isAddActive })}>
          <ul>
            {this.state.availableIoModules.map(ioModuleName => (
              <li key={ioModuleName} onClick={() => this.addIoModule(ioModuleName)}>
                <span>{ioModuleName}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  }
}