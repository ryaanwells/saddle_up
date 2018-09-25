import React, { Component } from 'react';
import ControlledInput from './ControlledInput';
import './Resource.css';

function convertParametersToMap(input, keyField) {
    return !input ? {} : input.reduce(function(map, obj) {
        map[obj[keyField]] = obj;
        map[obj[keyField]].value = '';
        return map; 
    }, {});
}

function unpackTypes(types, chosenType) {
    
}

class Resource extends Component {
    
    constructor(props){
        super(props);
        this.state = {
            open: false,
            headers: convertParametersToMap(props.resource.headers, 'name'),
            uriParameters: convertParametersToMap(props.resource.uriParameters, 'name'),
            body: convertParametersToMap(this.props.types[this.props.resource.body[0].type].properties, 'name')
        }
        this.toggleOpen = this.toggleOpen.bind(this);
        this.updateHeader = this.updateHeader.bind(this);
        this.updateUriParameter = this.updateUriParameter.bind(this);
        this.updateBody = this.updateBody.bind(this);
    }
    
    toggleOpen() {
        this.setState(previousState => ({
            open: !previousState.open,
        }));
    }
    
    updateHeader(value){
        return (event) => {
            event.persist();
            this.setState(state => ({
                headers: {
                    ...state.headers,
                    [value]: {
                        ...state.headers[value],
                        value: event.target.value
                    }
                }
            }));
        }
    }
    
    updateUriParameter(value) {
        return (event) => {
            event.persist();
            this.setState(state => ({
                uriParameters: {
                    ...state.uriParameters,
                    [value]: {
                        ...state.uriParameters[value],
                        value: event.target.value
                    }
                }
            }));
        }
    }
    
    updateBody(value) {
        return (event) => {
            event.persist();
            this.setState(state => ({
                body: {
                    ...state.body,
                    [value]: {
                        ...state.body[value],
                        value: event.target.value
                    }
                }
            }));
        }
    }
    
    render() {
        const headers = Object.values(this.state.headers).map(header => 
            <ControlledInput key={header.name} name={header.displayName} value={this.state.headers[header.name].value} update={this.updateHeader(header.name)}/>
        );
        const uriParameters = Object.values(this.state.uriParameters).map(uriParam =>
            <ControlledInput key={uriParam.name} name={uriParam.displayName} value={this.state.uriParameters[uriParam.name].value} update={this.updateUriParameter(uriParam.name)}/>
        );
        const bodyParameters = Object.values(this.state.body).map(bodyParam => 
            <ControlledInput key={bodyParam.name} name={bodyParam.displayName} value={this.state.body[bodyParam.name].value} update={this.updateBody(bodyParam.name)}/>
        );
        return (
            <div>
                <h1 onClick={() => this.props.selectRoute(this.props.resource)}>Route: {this.props.resource.parentUri} <span onClick={this.toggleOpen}>{this.state.open ? "-" : "+"}</span></h1>
                <div className={this.state.open ? null : "description-hidden"}>
                    {this.props.resource.description}
                </div>
                <h2>Headers</h2>
                {headers}
                <h2>URI Parameters</h2>
                {uriParameters}
                <h2>Body Parameters</h2>
                {bodyParameters}                
            </div>
        );
    }
}

export default Resource;
