
var saddle_up = angular.module("saddle_up", []);

function main_ctl_fn($scope, $http, $q){

  $scope.endpoints = [{
    "name": "Get saddle_up javascript",
    "method": "GET",
    "url": "saddle_up.js",
    "params": [{
      "name": "param1",
      "required": true,
      "value": "hello"
    }]
  }];

  $scope.selectedEndpoint = {};

  $scope.raml_doc = {};
  $scope.raml_url = [];
  $scope.baseUriParams = {};
  $scope.baseUrl = "";

  function validateParameters(endpoint_object){
    var is_valid = true;

    angular.forEach(endpoint_object["params"], function(parameter_def){
      if (parameter_def["required"] && !parameter_def["value"]){
        is_valid = false;
        return;
      }
    });

    return is_valid;
  }

  function makeRequestObject(endpoint_object){
    var params = {};
    var requestObject = angular.copy(endpoint_object);

    angular.forEach(endpoint_object["params"], function(parameter_def){
      var key = parameter_def["name"];
      var value = parameter_def["value"];
      params[key] = value;
    });

    requestObject["params"] = params;
    return requestObject;
  }

  function logResponse(response){
    console.log(response);
  }

  function executeQuery(){
    if ( validateParameters($scope.selectedEndpoint) ){
      requestObject = makeRequestObject($scope.selectedEndpoint);
      $http(requestObject).then(
        logResponse,
        logResponse
      );
    }
  };
  $scope.executeQuery = executeQuery;

  function getBaseURISelection(raml){
    var parameters = [];
    var param;
    var regex = /\{(\w*)?\}/g;
    var match;

    while (match = regex.exec(raml.baseUri)){
      param = {};
      param["match"] = match;

      parameters.push(match);
      console.log(param);
    }
    return parameters;
  }

  function updateBaseUri(parameters){
    var baseUri = $scope.raml_doc.baseUri;
    var regexp_template = "{key}";
    var regexp_base;
    angular.forEach(parameters, function(value, key){
      if (value.hasOwnProperty("value") && value.value){
        regexp_base = regexp_template.replace("key", key)
        baseUri = baseUri.replace(new RegExp(regexp_base), value.value);
      }
    });
    $scope.baseUrl = baseUri;
  }

  function processRAML(raml){
    $scope.raml_doc = raml;
    $scope.baseUri = raml.baseUri
    baseURISelection = getBaseURISelection($scope.raml_doc);
    $scope.baseUriParams = raml.baseUriParameters;
    $scope.$watch("baseUriParams", updateBaseUri, true);
  }

  $q.when(RAML.Parser.loadFile('test.raml')).then( function(data) {
    console.log(data);
    processRAML(data);
  }, function(error) {
    console.log('Error parsing: ' + error);
  });

};

main_ctl_fn.$inject = ["$scope", "$http", "$q"];
saddle_up.controller("main", main_ctl_fn);
