import React from 'react';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import '../style/iomodule';

class IoModuleForm extends React.Component {
  constructor(props) {
    super(props);
  }

  getModuleInstance(ioModule) {
    if (ioModule && ioModule.getWrappedInstance) {
      return ioModule.getWrappedInstance();
    }
    return ioModule;
  }

  render() {
    return (
      <div className="io-modules piano-content">
        { this.props.ioModules.map((IoModule, index) => (
            <div key={index} className="io-module">
              <IoModule 
                ref={ ioModule => this.props.setIoModuleInstance && 
                  this.props.setIoModuleInstance(index, this.getModuleInstance(ioModule))} 
                callbacks={ this.props.ioModuleCallbacks }
              />
            </div>  
          ))}
      </div>
    );
  }
}

IoModuleForm.propTypes = {
  ioModules: PropTypes.array,
  setIoModuleInstance: PropTypes.func,
  callbacks: PropTypes.object,
};

export default IoModuleForm;