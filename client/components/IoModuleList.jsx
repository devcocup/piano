import React from 'react';
import classNames from 'classnames';
import FontAwesomeIcon from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/fontawesome-free-solid';

export default class IoModuleList extends React.Component {
  constructor(props) {
    super(props);

    this.ioModuleInstances = {};
  }

  render() {
    return (
      <div className="io-modules piano-content">
        { this.props.ioModules.map(ioModule => (
          <div key={ioModule.id} className="io-module">
            <div className="io-module-main">
              <div className="io-module-content">
                <ioModule.module 
                  ref={ ioModuleInstance => this.ioModuleInstances[ioModule.name] = ioModuleInstance }
                  setCurrentMs={ ms => this.props.setCurrentMs(ioModule, ms) }
                  setPlaying={ isPlaying => this.props.setPlaying(ioModule, isPlaying) }
                  saveData={ data => this.props.saveData(ioModule, data) }
                />
              </div>
            </div>
            <button className="hidden" type="button" onClick={() => this.props.remove(ioModule)}>
              <FontAwesomeIcon icon={faTimes} />
            </button>
          </div>  
        ))}
      </div>
    );
  } 
}