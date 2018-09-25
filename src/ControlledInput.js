import React, { Component } from 'react';
import './Resource.css';
class ControlledInput extends Component {    
    render(){
        return (
            <div>
                <label htmlFor={`header-${this.props.name}`}>{this.props.name}</label>
                <input type="text" id={`header-${this.props.name}`} value={this.props.value} onChange={this.props.update}/>
            </div>
        )
    }
}

export default ControlledInput;