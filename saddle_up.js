
var saddle_up = angular.module("saddle_up", ["ui.bootstrap"]);

function utils(){

  Object.defineProperty(Array.prototype, 'last', {
    enumerable: false,
    configurable: true,
    get: function() {
      if (this.length > 0){
        return this[this.length - 1];
      }
      return undefined;
    },
    set: undefined
  });

  function formatString(input, key, value){
    var regexp_base = "{" + key + "}";
    return input.replace(new RegExp(regexp_base, 'g'), value);
  }

  function extendAndInitialize(dest, src){
    src = src || {};
    angular.forEach(src, function(value, key){
      if (value.enum && value.required && !value.value){
        value.value = value.enum[0];
      }
      this[key] = value
    }, dest);
  }

  function project(source, attr){
    var projected = {};
    angular.forEach(source, function(value, key){
      this[key] = value[attr];
    }, projected);
    console.log(projected);
    return projected;
  }

  function validateType(parameter){
    var typeMappings = {
      "string": angular.isString,
      "number": angular.isNumber,
      "integer": function(value){
        // polyfil from https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/isInteger
        return typeof value === "number" && isFinite(value) && Math.floor(value) === value;
      },
      "date": angular.isDate,
      "boolean": function(value){ return typeof value === "boolean"}
    };
    return typeMappings[parameter.type](parameter.value);
  }

  return {
    formatString: formatString,
    extendAndInitialize: extendAndInitialize,
    project: project,
    validateType: validateType
  };
}

saddle_up.factory('utils', utils);

function saddle_up_ctl($scope, $http, $q, utils){

  $scope.ramlDoc = {};
  $scope.ramlUrl = [];

  $scope.baseUriParameters = {};
  $scope.uriParameters = {};
  $scope.queryParameters = {};

  $scope.baseUrl = "";
  $scope.fullUrl = "";
  $scope.endpointDescription = "";
  $scope.response = {};


  function updateFullUrl(){
    $scope.fullUrl = $scope.ramlDoc.baseUri;
    var partial_uri = "";

    angular.forEach($scope.baseUriParameters, function(value, key){
      if (value.hasOwnProperty("value") && value.value){
        $scope.fullUrl = utils.formatString($scope.fullUrl, key, value.value);
      }
    });

    angular.forEach($scope.ramlUrl.slice(1), function(partial){
      if (partial.type !== "Method") {
        partial_uri = partial.relativeUri;
        if (partial.hasOwnProperty("uriParameters")){
          angular.forEach(partial.uriParameters, function(value, key){
            if (value.hasOwnProperty("value") && value.value){
              partial_uri = utils.formatString(partial_uri, key, value.value);
            }
          });
        }
        $scope.fullUrl = $scope.fullUrl + partial_uri;
      }
    });
  }

  function getSegmentOptions(segment){
    if (! segment.hasOwnProperty("options")){
      segment.options = [];

      if (segment.hasOwnProperty("resources")){
        angular.forEach(segment.resources, function(resource){
          resource.type = "Partial";
          segment.options.push({
            "option": resource,
            "name": resource.relativeUri
            });
        });
      }

      if (segment.hasOwnProperty("methods")){
        angular.forEach(segment.methods, function(method){
          method.type = "Method";
          segment.options.push({
            "option": method,
            "name": method.method.toUpperCase()
            });
        });
      }
    }

    return segment.options;
  }
  $scope.getSegmentOptions = getSegmentOptions;



  function updateParameterSelection(){
    $scope.baseUriParameters = {};
    $scope.uriParameters = {};
    $scope.queryParameters = {};

    angular.forEach($scope.ramlUrl, function(partial, index){
      utils.extendAndInitialize($scope.baseUriParameters, partial.baseUriParameters);
      utils.extendAndInitialize($scope.uriParameters, partial.uriParameters);
      utils.extendAndInitialize($scope.queryParameters, partial.queryParameters);
    });

  }

  function printout(){
    console.log($scope.ramlUrl);
  }
  $scope.printout = printout;

  function ramlUrlUpdate(index){
    if ( index < $scope.ramlUrl.length - 1 ){
      // Trim the URL if we change a middle segment.
      $scope.ramlUrl = $scope.ramlUrl.slice(0, index + 1);
    }

    while (getSegmentOptions($scope.ramlUrl.last).length === 1){
      // Autocomplete the next segments if there is only one option.
      $scope.ramlUrl.push($scope.ramlUrl.last.options[0].option);
    }

    updateParameterSelection();
    updateFullUrl();
    $scope.endpointDescription = $scope.ramlUrl.last.description;
  }
  $scope.ramlUrlUpdate = ramlUrlUpdate;



  function validateRequest(){
    var isValid = true;
    var paramGroups = [$scope.baseUriParameters,
                       $scope.uriParameters,
                       $scope.queryParameters];

    if ($scope.ramlUrl.length === 0 || $scope.ramlUrl.last.type !== "Method"){
      isValid = false;
    }

    angular.forEach(paramGroups, function(paramGroup){
      angular.forEach(paramGroup, function(parameter, key){
        if ( parameter.required &&
             !( parameter.value || parameter.default) &&
             !utils.validateType(parameter)){
          isValid = false;
        }
      });
    });
    return isValid;
  }
  $scope.validateRequest = validateRequest;



  function success(response){
    $scope.response = response.data;
  }

  function failure(response){
    $scope.response = response.data || {};
  }

  function makeRequest(){
    if (validateRequest()){
      var request = {
        "url": $scope.fullUrl,
        "method": $scope.ramlUrl.last.method,
        "data": utils.project($scope.queryParameters, 'value')
      };
      if (request.method.toUpperCase() === "GET") { request["params"] = request.data; }

      $scope.response = "Requesting...";
      $http(request).then(success, failure);
    }
  }
  $scope.makeRequest = makeRequest;

  function processRAML(raml){
    $scope.ramlDoc = raml;
    $scope.baseUrl = raml.baseUri;
    $scope.baseUriParameters = raml.baseUriParameters;
    $scope.ramlUrl[0] = $scope.ramlDoc;
    $scope.$watch("baseUriParameters", updateFullUrl, true);
    $scope.$watch("uriParameters", updateFullUrl, true);
    updateParameterSelection();
    updateFullUrl();
  }

  $q.when(RAML.Parser.loadFile('api.raml')).then( function(data) {
    console.log(data);
    processRAML(data);
  }, function(error) {
    console.log('Error parsing: ' + error);
  });

}

saddle_up_ctl.$inject = ["$scope", "$http", "$q", "utils"];
saddle_up.controller("saddle_up_ctl", saddle_up_ctl);
