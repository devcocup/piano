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
      <div>
        { this.props.ioModules.map(ioModule => (
          <div key={ioModule.id} className="io-module">
            <div className="io-module-main">
              <span className="io-module-name">{ioModule.name}</span>
              <div className="io-module-content">
                <ioModule.module 
                  ref={ ioModuleInstance => this.ioModuleInstances[ioModule.id] = ioModuleInstance }
                  setCurrentMs={ ms => this.props.setCurrentMs(ioModule, ms) }
                  setPlaying={ isPlaying => this.props.setPlaying(ioModule, isPlaying) }
                />
              </div>
            </div>
            <button className="remove" type="button" onClick={() => this.props.remove(ioModule)}>
              <FontAwesomeIcon icon={faTimes} />
            </button>
          </div>  
        ))}
      </div>
    );
  } 
}