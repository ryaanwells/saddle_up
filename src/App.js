/* global RAML */
import React, { Component } from 'react';
import Resource from './Resource';
import './App.css';

function convertParametersToMap(input, keyField) {
  return !input ? {} : input.reduce(function(map, obj) {
      map[obj[keyField]] = obj;
      return map; 
  }, {});
}

class App extends Component {
  
  constructor(props){
    super(props);
    this.state = {
      loading: true,
      raml: {},
      selectedRoute: {},
    };
    this.selectRoute = this.selectRoute.bind(this);
  }
  
  componentDidMount(){
    fetch('/raml')
      .then(response => response.text())
      .then(text => RAML.Parser.load(text))
      .then(raml => this.setState({raml, loading: false}))
      .then(this.initialise);
  }
  
  initialise(){
    console.log("here");
  }
  
  getEndpoints(resources, collection = []){
    resources.forEach(resource => {
      resource.methods.forEach(method => collection.push(method));
      if (resource.resources){
        this.getEndpoints(resource.resources, collection);
      }
    });
    return collection;
  }
  
  selectRoute(route){
    this.setState({
      selectedRoute: route,
    });
  }
  
  render() {
    let possibleRequests = []
    if (!this.state.loading && this.state.raml.specification){
      const specification = this.state.raml.specification;
      possibleRequests = this.getEndpoints(specification.resources);
    }
    
    const title = this.state.loading ?
      (<h1 className="App-title">Welcome to React</h1>) :
      (<h1 className="App-title">Harness for {this.state.raml.specification.title}</h1>)
    return (
      <div className="App">
        <header className="App-header">
          {title}
        </header>

        {possibleRequests.map(req => {
          return <Resource key={req.parentUri} selectRoute={this.selectRoute} resource={req} types={convertParametersToMap(this.state.raml.specification.types, "name")}/>
        })}

      </div>
    );
  }
}

export default App;
