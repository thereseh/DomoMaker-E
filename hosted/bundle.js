"use strict";

var domoRenderer = void 0;
var domoForm = void 0;
var DomoFormClass = void 0;
var DomoListClass = void 0;

var handleDomo = function handleDomo(e) {
  e.preventDefault();
  $("#domoMessage").animate({ width: 'hide' }, 350);

  if ($("#domoName").val() == '' || $("domoAge").val() == '' || $("domoFood").val() == '') {
    handleError("RAWR! All fields are required");
    return false;
  }

  sendAjax('POST', $("#domoForm").attr("action"), $("#domoForm").serialize(), function () {
    domoRenderer.loadDomosFromServer();
  });

  return false;
};

var removeDomo = function removeDomo(name, age, food) {
  $("#domoMessage").animate({ width: 'hide' }, 350);
  var key = $("#cs")[0].attributes.value.value;
  var data = "name=" + name + "&age=" + age + "&favFood=" + food + "&_csrf=" + key;
  sendAjax('DELETE', '/removeDomo', data, function () {
    domoRenderer.loadDomosFromServer();
  });

  return false;
};

var renderDomo = function renderDomo() {
  return React.createElement(
    "form",
    { id: "domoForm",
      onSubmit: this.handleSubmit,
      name: "domoForm",
      action: "/maker",
      method: "POST",
      className: "domoForm"
    },
    React.createElement(
      "label",
      { htmlFor: "name" },
      "Name: "
    ),
    React.createElement("input", { id: "domoName", type: "text", name: "name", placeholder: "Domo Name" }),
    React.createElement(
      "label",
      { htmlFor: "age" },
      "Age:"
    ),
    React.createElement("input", { id: "domoAge", type: "text", name: "age", placeholder: "Domo Age" }),
    React.createElement(
      "label",
      { htmlFor: "favFood" },
      "Food:"
    ),
    React.createElement("input", { id: "domoFood", type: "text", name: "favFood", placeholder: "Domo Favorite Food" }),
    React.createElement("input", { type: "hidden", name: "_csrf", value: this.props.csrf }),
    React.createElement("input", { className: "makeDomoSubmit", type: "submit", value: "Make Domo" })
  );
};

var renderDomoList = function renderDomoList() {
  if (this.state.data.length === 0) {
    return React.createElement(
      "div",
      { className: "domoList" },
      React.createElement(
        "h3",
        { className: "emptyDomo" },
        "No Domos yet"
      )
    );
  }

  var domoNodes = this.state.data.map(function (domo) {
    return React.createElement(
      "div",
      { key: domo._id, className: "domo" },
      React.createElement("img", { src: "/assets/img/domoface.jpeg", alt: "domo face", className: "domoFace" }),
      React.createElement(
        "h3",
        { className: "domoName" },
        " Name: ",
        domo.name
      ),
      React.createElement(
        "h3",
        { className: "domoAge" },
        " Age: ",
        domo.age
      ),
      React.createElement(
        "h3",
        { className: "domoFood" },
        " Food: ",
        domo.favFood
      ),
      React.createElement(
        "button",
        { onClick: function onClick() {
            removeDomo(domo.name, domo.age, domo.favFood);
          } },
        "Remove"
      )
    );
  });

  return React.createElement(
    "div",
    { className: "domoList" },
    React.createElement("input", { type: "hidden", id: "cs", name: "_csrf", value: this.props.csrf }),
    domoNodes
  );
};

var setup = function setup(csrf) {
  DomoFormClass = React.createClass({
    displayName: "DomoFormClass",

    handleSubmit: handleDomo,
    render: renderDomo
  });

  DomoListClass = React.createClass({
    displayName: "DomoListClass",

    loadDomosFromServer: function loadDomosFromServer() {
      sendAjax('GET', '/getDomos', null, function (data) {
        this.setState({ data: data.domos });
      }.bind(this));
    },
    getInitialState: function getInitialState() {
      return { data: [] };
    },
    componentDidMount: function componentDidMount() {
      this.loadDomosFromServer();
    },
    render: renderDomoList
  });
  domoForm = ReactDOM.render(React.createElement(DomoFormClass, { csrf: csrf }), document.querySelector("#makeDomo"));
  domoRenderer = ReactDOM.render(React.createElement(DomoListClass, { csrf: csrf }), document.querySelector("#domos"));
};

var getToken = function getToken() {
  sendAjax('GET', '/getToken', null, function (result) {
    setup(result.csrfToken);
  });
};

$(document).ready(function () {
  getToken();
});
"use strict";

var handleError = function handleError(message) {
  $("#errorMessage").text(message);
  $("#domoMessage").animate({ width: 'toggle' }, 350);
};

var redirect = function redirect(response) {
  $("#domoMessage").animate({ width: 'hide' }, 350);
  window.location = response.redirect;
};

var sendAjax = function sendAjax(type, action, data, success) {
  console.dir(data);
  $.ajax({
    catche: false,
    type: type,
    url: action,
    data: data,
    dataType: "json",
    success: success,
    error: function error(xhr, status, _error) {
      var messageObj = JSON.parse(xhr.responseText);
      handleError(messageObj.error);
    }
  });
};
